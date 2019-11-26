import { GitHubProfileStatus, UserStatus } from 'github-profile-status';
import { NowPlayingMonitor } from './NowPlayingMonitor';
import { NowPlayingSources } from './sources';

export interface GitHubNowPlayingConstructorOptions {
  token: string;
}

class GitHubNowPlaying extends NowPlayingMonitor<UserStatus> {
  public static Sources = NowPlayingSources;

  constructor(options: GitHubNowPlayingConstructorOptions) {
    super(new GitHubProfileStatus(options));
  }
}

export { GitHubNowPlaying, NowPlayingSources };
