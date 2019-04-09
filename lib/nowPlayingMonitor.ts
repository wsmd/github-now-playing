import { NowPlayingTrack } from './nowPlayingTrack';
import { SourceProvider } from './sources/sourceProvider';
import { SimpleEventEmitter } from './utils';

export interface NowPlayingMonitorOptions {
  source: SourceProvider;
  updateFrequency: number;
}

enum Event {
  TrackChanged = 'track-changed',
  TrackStopped = 'track-stopped',
  Error = 'error',
}

interface Events {
  [Event.Error]: any;
  [Event.TrackStopped]: never;
  [Event.TrackChanged]: NowPlayingTrack;
}

export class NowPlayingMonitor extends SimpleEventEmitter<Events> {
  public static Events = Event;

  private source: SourceProvider;
  private updateFrequency!: number;
  private lastTrack: NowPlayingTrack | null = null;

  constructor(private options: NowPlayingMonitorOptions) {
    super();
    this.source = options.source;
    this.source.on('error', error => this.emit(NowPlayingMonitor.Events.Error, error));
    this.updateFrequency = options.updateFrequency;
    this.checkNowPlaying();
  }

  private async checkNowPlaying() {
    const track = await this.source.getNowPlaying();
    if (this.hasTrackChanged(track)) {
      this.lastTrack = track;
      if (track) {
        this.emit(Event.TrackChanged, track);
      } else {
        this.emit(Event.TrackStopped);
      }
    }
    setTimeout(this.checkNowPlaying.bind(this), this.updateFrequency);
  }

  private hasTrackChanged(track: NowPlayingTrack | null): boolean {
    console.log({ last: this.lastTrack, current: track });
    if (this.lastTrack && track) {
      for (const key in track) {
        if ((track as any)[key] !== (this.lastTrack as any)[key]) {
          return true;
        }
      }
      return false;
    }
    return this.lastTrack !== track;
  }
}
