import assert from 'assert';
import { logger } from 'yanl';
import { SourceProvider } from './SourceProvider';
import { SimpleEventEmitter } from './SimpleEventEmitter';
import { NowPlayingTrack, NowPlayingStatus as Status, StatusPublisher } from './types';

enum Events {
  StatusUpdated = 'status-updated',
  StatusCleared = 'status-cleared',
  ListenStart = 'listen-start',
  ListenStop = 'listen-stop',
  Error = 'error',
}

type EventListeners<S> = {
  [Events.Error](error: any): void;
  [Events.ListenStart](): void;
  [Events.ListenStop](): void;
  [Events.StatusCleared](): void;
  [Events.StatusUpdated](status: S | null): void;
};

export class NowPlayingMonitor<S extends Status> extends SimpleEventEmitter<EventListeners<S>> {
  /**
   * A dictionary containing event names for a GitHubNowPlaying instance
   */
  public static Events = Events;
  /**
   * Indicates whether the profile status has been updated and not reset.
   */
  private isStatusDirty: boolean = false;
  /**
   * The source provider instance watching for track changes
   */
  private sourceProvider: SourceProvider | null = null;

  constructor(private profileStatus: StatusPublisher) {
    super();
  }

  /**
   * Listens to track changes using the provided source.
   */
  public listen() {
    assertIsDefined(this.sourceProvider, 'Expected source to be specified');
    this.sourceProvider.listen();
    this.emit(Events.ListenStart);
  }

  /**
   * Stop listening to track changes using the provided source. Calling this
   * will clear the profile status if it has been already updated.
   */
  public async stop() {
    assertIsDefined(this.sourceProvider, 'Expected source to be specified');
    this.sourceProvider.stop();
    await this.cleanUp();
    this.emit(Events.ListenStop);
  }

  /**
   * Sets a source from which the currently playing track will be retrieved.
   */
  public setSource(source: SourceProvider) {
    let autoStartNextSource = false;
    if (this.sourceProvider) {
      autoStartNextSource = this.sourceProvider.isListening;
      this.unsetSourceProvider();
    }
    this.setSourceProvider(source, autoStartNextSource);
  }

  private setSourceProvider(source: SourceProvider, autoStart: boolean) {
    this.sourceProvider = source;
    this.sourceProvider
      .on(SourceProvider.Events.TrackChanged, this.updateStatus.bind(this))
      .on(SourceProvider.Events.TrackStopped, this.clearStatus.bind(this))
      .on(SourceProvider.Events.Error, this.emitError.bind(this));
    if (autoStart) {
      this.sourceProvider.listen();
    }
  }

  private unsetSourceProvider() {
    this.sourceProvider!.stop();
    this.sourceProvider!.removeAllListeners();
  }

  private async updateStatus(track: NowPlayingTrack) {
    try {
      const status = await this.profileStatus.set({
        emoji: ':musical_note:',
        message: `is listening to "${track.title}" by ${track.artist}`,
      });
      this.isStatusDirty = true;
      this.emit(Events.StatusUpdated, status as S);
    } catch (error) {
      this.emitError(error);
    }
  }

  private async clearStatus() {
    try {
      logger.debug('clearing the profile status');
      await this.profileStatus.clear();
      this.isStatusDirty = false;
      this.emit(Events.StatusCleared);
    } catch (error) {
      this.emitError(error);
    }
  }

  private emitError(error: any) {
    this.emit(Events.Error, error);
  }

  private async cleanUp() {
    if (this.isStatusDirty) {
      await this.clearStatus();
    }
  }
}

function assertIsDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  assert(value != null, message);
}
