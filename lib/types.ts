export interface NowPlayingTrack {
  title: string;
  artist: string;
}

export interface NowPlayingStatus {
  emoji: any;
  message: string | null;
}

export interface StatusPublisher {
  set(status: NowPlayingStatus): Promise<NowPlayingStatus | null>;
  clear(): Promise<boolean>;
}
