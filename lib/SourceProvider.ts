import { logger } from 'yanl';
import { NowPlayingTrack } from './types';
import { SimpleEventEmitter } from './SimpleEventEmitter';

enum State {
  Listening,
  Stopped,
}

enum Events {
  Error = 'error',
  TrackChanged = 'track-changed',
  TrackStopped = 'track-stopped',
}

type EventListeners = {
  [Events.Error](error: unknown): void;
  [Events.TrackChanged](track: NowPlayingTrack): void;
  [Events.TrackStopped](): void;
};

export abstract class SourceProvider<T = {}> extends SimpleEventEmitter<EventListeners> {
  public static Events = Events;

  private state: State = State.Stopped;

  private nextCheckTimeout!: NodeJS.Timeout;

  private lastTrack: NowPlayingTrack | null = null;

  constructor(protected options: T & { updateFrequency: number }) {
    super();
  }

  public isListening(): boolean {
    return this.state === State.Listening;
  }

  public listen(): void {
    // istanbul ignore if
    if (this.isListening()) {
      return;
    }
    logger.debug('started listening from source');
    this.state = State.Listening;
    this.checkNowPlaying();
  }

  public stop(): void {
    logger.debug('stopped listening from source');
    this.state = State.Stopped;
    clearTimeout(this.nextCheckTimeout);
  }

  protected getNowPlaying(): Promise<NowPlayingTrack | null> {
    throw new Error(`Method \`getNowPlaying\` is not implemented in ${this.constructor.name}`);
  }

  private async checkNowPlaying(): Promise<void> {
    logger.debug('checking source for now playing track');

    let track = null;
    try {
      track = await this.getNowPlaying();
    } catch (error) {
      this.emit(Events.Error, error);
      return;
    }

    // bail out in case the source provider has been stopped while the check was pending
    if (this.state === State.Stopped) {
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

    this.nextCheckTimeout = setTimeout(() => this.checkNowPlaying(), this.options.updateFrequency);
    logger.debug('scheduled next source check');
  }

  private hasTrackChanged(track: NowPlayingTrack | null): boolean {
    const { lastTrack } = this;
    if (lastTrack == null || track == null) {
      return lastTrack !== track;
    }
    const keys = Object.keys(track) as Array<keyof NowPlayingTrack>;
    return keys.some(key => track[key] !== lastTrack[key]);
  }
}
