import { logger } from 'yanl';
import { NowPlayingTrack } from './types';
import { SimpleEventEmitter } from './SimpleEventEmitter';

enum Events {
  Error = 'error',
  TrackChanged = 'track-changed',
  TrackStopped = 'track-stopped',
}

type EventListeners = {
  [Events.Error](error: any): void;
  [Events.TrackChanged](track: NowPlayingTrack): void;
  [Events.TrackStopped](): void;
};

export abstract class SourceProvider<T = {}> extends SimpleEventEmitter<EventListeners> {
  /**
   * A dictionary containing event names for a SourceProvider instance
   */
  public static Events = Events;
  /**
   * Indicates whether the instance is currently listening to a source provider.
   */
  public isListening: boolean = false;
  private timeout!: NodeJS.Timeout;
  private lastTrack: NowPlayingTrack | null = null;

  constructor(protected options: T & { updateFrequency: number }) {
    super();
  }

  public listen() {
    logger.debug('started listening');
    this.isListening = true;
    this.checkNowPlaying();
  }

  public stop() {
    logger.debug('stopped listening from source');
    this.isListening = false;
    clearTimeout(this.timeout);
  }

  /* private */

  protected getNowPlaying(): Promise<NowPlayingTrack | null> {
    throw new Error('Method not implemented');
  }

  private async checkNowPlaying() {
    logger.debug('checking source for now playing track');

    let track;
    try {
      track = await this.getNowPlaying();
    } catch (error) {
      this.emit(Events.Error, error);
      return;
    }

    // bail from reporting track changes or scheduling the next check in case
    // it has source provider has been stopped during the pending check
    if (!this.isListening) {
      return;
    }

    if (this.hasTrackChanged(track)) {
      if (track) {
        this.emit(Events.TrackChanged, track);
      } else {
        this.emit(Events.TrackStopped);
      }
      this.lastTrack = track;
    }

    this.timeout = setTimeout(() => this.checkNowPlaying(), this.options.updateFrequency);
    logger.debug('scheduled next source check');
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
