import { EventEmitter } from 'events';
import { GitHubProfileStatus } from 'github-profile-status';
import { NowPlayingMonitor, NowPlayingMonitorOptions } from './nowPlayingMonitor';
import { NowPlayingTrack } from './nowPlayingTrack';
import { SourceProvider } from './sources/sourceProvider';
import { SimpleEventEmitter } from './utils';

interface StatusPublisherOptions extends NowPlayingMonitorOptions {
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

export class NowPlayingStatusPublisher extends SimpleEventEmitter<Events> {
  public static Events = Event;

  private monitor!: NowPlayingMonitor;
  private profileStatus!: GitHubProfileStatus;

  constructor(private options: StatusPublisherOptions) {
    super();
    this.handleTrackChange = this.handleTrackChange.bind(this);
    this.handleTrackStopped = this.handleTrackStopped.bind(this);
    this.init();
  }

  private init() {
    this.profileStatus = new GitHubProfileStatus({
      sessionCookie: this.options.sessionCookie,
    });

    this.monitor = new NowPlayingMonitor(this.options);

    this.monitor
      .on(NowPlayingMonitor.Events.TrackChanged, this.handleTrackChange)
      .on(NowPlayingMonitor.Events.TrackStopped, this.handleTrackStopped)
      .on(NowPlayingMonitor.Events.Error, error => this.emit(error));
  }

  private async handleTrackChange(track: NowPlayingTrack) {
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

  private async handleTrackStopped() {
    try {
      await this.profileStatus.clear();
      this.emit(Event.StatusCleared);
    } catch (error) {
      this.emit(Event.Error, error);
    }
  }
}
