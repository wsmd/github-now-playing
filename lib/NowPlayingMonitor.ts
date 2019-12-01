import assert from 'assert';
import { logger } from 'yanl';
import { SourceProvider } from './SourceProvider';
import { SimpleEventEmitter } from './SimpleEventEmitter';
import { NowPlayingTrack, NowPlayingStatus, StatusPublisher } from './types';

enum State {
  Listening,
  Stopping,
  Stopped,
}

enum Events {
  Error = 'error',
  ListenStart = 'listen-start',
  ListenStop = 'listen-stop',
  StatusCleared = 'status-cleared',
  StatusUpdated = 'status-updated',
}

type EventListeners<Status> = {
  [Events.Error](error: unknown): void;
  [Events.ListenStart](): void;
  [Events.ListenStop](): void;
  [Events.StatusCleared](): void;
  [Events.StatusUpdated](status: Status | null): void;
};

function assertIsDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  assert(value != null, message);
}

export class NowPlayingMonitor<Status extends NowPlayingStatus> extends SimpleEventEmitter<
  EventListeners<Status>
> {
  /**
   * A dictionary containing event names for a GitHubNowPlaying instance
   */
  public static Events = Events;

  private isStatusDirty: boolean = false;

  private sourceProvider: SourceProvider | null = null;

  private state: State = State.Stopped;

  constructor(private statusPublisher: StatusPublisher) {
    super();
  }

  /**
   * Listens to track changes using the provided source.
   */
  public listen(): void {
    assertIsDefined(this.sourceProvider, 'Expected source to be specified');

    // istanbul ignore if
    if (this.state === State.Listening) {
      return;
    }

    this.state = State.Listening;
    this.sourceProvider.listen();
    this.emit(Events.ListenStart);
  }

  /**
   * Stop listening to track changes using the provided source. Calling this
   * will clear the profile status if it has been already updated.
   */
  public async stop(): Promise<void> {
    assertIsDefined(this.sourceProvider, 'Expected source to be specified');

    // istanbul ignore if
    if (this.state === State.Stopped || this.state === State.Stopping) {
      return;
    }

    this.state = State.Stopping;
    this.sourceProvider.stop();
    await this.cleanUp();
    this.state = State.Stopped;
    this.emit(Events.ListenStop);
  }

  /**
   * Sets a source from which the currently playing track will be retrieved.
   */
  public setSource(source: SourceProvider): void {
    let autoStartNextSource = false;
    if (this.sourceProvider) {
      autoStartNextSource = this.sourceProvider.isListening();
      this.unsetSourceProvider();
    }
    this.setSourceProvider(source, autoStartNextSource);
  }

  private setSourceProvider(source: SourceProvider, autoStart: boolean): void {
    this.sourceProvider = source;
    this.sourceProvider
      .on(SourceProvider.Events.TrackChanged, this.updateStatus.bind(this))
      .on(SourceProvider.Events.TrackStopped, this.clearStatus.bind(this))
      .on(SourceProvider.Events.Error, this.emitError.bind(this));
    if (autoStart) {
      this.sourceProvider.listen();
    }
  }

  private unsetSourceProvider(): void {
    assertIsDefined(this.sourceProvider, 'Expected source to be specified');
    this.sourceProvider.stop();
    this.sourceProvider.removeAllListeners();
  }

  private async updateStatus(track: NowPlayingTrack): Promise<void> {
    try {
      const status = await this.statusPublisher.set({
        emoji: ':musical_note:',
        message: `is listening to "${track.title}" by ${track.artist}`,
      });
      this.isStatusDirty = true;
      this.emit(Events.StatusUpdated, status as Status);
    } catch (error) {
      this.emitError(error);
    }
  }

  private async clearStatus(): Promise<void> {
    try {
      logger.debug('clearing the profile status');
      await this.statusPublisher.clear();
      this.isStatusDirty = false;
      this.emit(Events.StatusCleared);
    } catch (error) {
      this.emitError(error);
    }
  }

  private emitError(error: {}): void {
    this.emit(Events.Error, error);
  }

  private async cleanUp(): Promise<void> {
    if (this.isStatusDirty) {
      await this.clearStatus();
    }
  }
}
