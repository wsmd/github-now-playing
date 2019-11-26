import osascript from 'osascript-tag';
import { SourceProvider } from '../../SourceProvider';
import { NowPlayingTrack } from '../../types';

export class ITunesSourceProvider extends SourceProvider {
  protected getNowPlaying() {
    return osascript.jxa<NowPlayingTrack | null>({ parse: true })`
      const iTunes = Application('iTunes');

      if (!iTunes.running()) {
        return null;
      }

      if (iTunes.playerState() !== 'playing') {
        return null;
      }

      return {
        artist: iTunes.currentTrack.artist(),
        title: iTunes.currentTrack.name(),
      };
    `;
  }
}
