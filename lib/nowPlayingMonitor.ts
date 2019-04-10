import { GitHubProfileStatus } from 'github-profile-status';
import { NowPlayingTrack } from './nowPlayingTrack';
import { NowPlayingSourceProvider } from './sources/sourceProvider';
import { SimpleEventEmitter } from './utils';

interface StatusPublisherOptions {
  sessionCookie: string;
}

enum Event {
  StatusUpdated = 'status-updated',
  StatusCleared = 'status-cleared',
  Error = 'error',
}

interface Events {
  [Event.StatusUpdated]: NowPlayingTrack;
  [Event.StatusCleared]: never;
  [Event.Error]: any;
}

export class NowPlayingMonitor extends SimpleEventEmitter<Events> {
  public static Events = Event;

  private sourceProvider!: NowPlayingSourceProvider;
  private profileStatus!: GitHubProfileStatus;

  constructor(private options: StatusPublisherOptions) {
    super();
    this.init();
  }

  public set source(source: NowPlayingSourceProvider) {
    this.sourceProvider = source;
    this.sourceProvider
      .on(NowPlayingSourceProvider.Events.TrackChanged, this.updateStatus.bind(this))
      .on(NowPlayingSourceProvider.Events.TrackStopped, this.clearStatus.bind(this))
      .on(NowPlayingSourceProvider.Events.Error, this.emit.bind(this, Event.Error));
  }

  private init() {
    this.profileStatus = new GitHubProfileStatus({
      sessionCookie: this.options.sessionCookie,
    });
  }

  private async updateStatus(track: NowPlayingTrack) {
    try {
      await this.profileStatus.set({
        emoji: ':musical_note:',
        message: `is listening to "${track.title}" by ${track.artist}`,
      });
      this.emit(Event.StatusUpdated, track);
    } catch (error) {
      this.emit(Event.Error, error);
    }
  }

  private async clearStatus() {
    try {
      await this.profileStatus.clear();
      this.emit(Event.StatusCleared);
    } catch (error) {
      this.emit(Event.Error, error);
    }
  }
}
