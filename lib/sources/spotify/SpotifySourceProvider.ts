import osascript from 'osascript-tag';
import { SourceProvider } from '../../SourceProvider';
import { NowPlayingTrack } from '../../types';

export class SpotifySourceProvider extends SourceProvider {
  protected getNowPlaying(): Promise<NowPlayingTrack | null> {
    return osascript.jxa<NowPlayingTrack | null>({ parse: true })`
      const spotify = Application('Spotify');

      if (!spotify.running()) {
        return null;
      }

      if (spotify.playerState() !== 'playing') {
        return null;
      }

      return {
        artist: spotify.currentTrack.artist(),
        title: spotify.currentTrack.name(),
      }
    `;
  }
}
