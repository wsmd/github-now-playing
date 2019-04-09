import { EventEmitter } from 'events';
import { NowPlayingTrack } from '../nowPlayingTrack';

export interface SourceProvider extends EventEmitter {
  getNowPlaying(): Promise<NowPlayingTrack | null>;
}
