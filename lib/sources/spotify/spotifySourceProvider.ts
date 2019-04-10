import { resolve } from 'path';
import { NowPlayingTrack } from '../../nowPlayingTrack';
import { execFileAsync } from '../../utils';
import { NowPlayingSourceProvider } from '../sourceProvider';

export class SpotifySourceProvider extends NowPlayingSourceProvider {
  private static scriptPath = resolve(__dirname, 'get-current-track.jxa');

  protected async getNowPlaying() {
    const result = await execFileAsync(SpotifySourceProvider.scriptPath);
    return JSON.parse(result) as NowPlayingTrack | null;
  }
}
