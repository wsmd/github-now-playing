import { NowPlayingTrack } from '../nowPlayingTrack';
import { SimpleEventEmitter } from '../utils';

enum Event {
  Error = 'error',
  TrackChanged = 'track-changed',
  TrackStopped = 'track-stopped',
}

interface Events {
  [Event.Error]: any;
  [Event.TrackChanged]: NowPlayingTrack;
  [Event.TrackStopped]: never;
}

interface SourceProviderOptions {
  updateFrequency: number;
}

export abstract class NowPlayingSourceProvider<T = {}> extends SimpleEventEmitter<Events> {
  public static Events = Event;
  private updateFrequency!: number;
  private lastTrack: NowPlayingTrack | null = null;

  constructor(protected options: T & SourceProviderOptions) {
    super();
    this.updateFrequency = options.updateFrequency;
    this.checkNowPlaying();
  }

  protected async getNowPlaying(): Promise<NowPlayingTrack | null> {
    throw new Error('Method not implemented');
  }

  /**
   * @todo add track-checked event
   */
  private async check(): Promise<NowPlayingTrack | null> {
    try {
      const result = await this.getNowPlaying();
      return result;
    } catch (error) {
      this.emit(NowPlayingSourceProvider.Events.Error, error);
      return null;
    }
  }

  private async checkNowPlaying() {
    const track = await this.check();
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
