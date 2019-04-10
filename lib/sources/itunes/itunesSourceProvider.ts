import { resolve } from 'path';
import { NowPlayingTrack } from '../../nowPlayingTrack';
import { execFileAsync } from '../../utils';
import { NowPlayingSourceProvider } from '../sourceProvider';

export class ITunesSourceProvider extends NowPlayingSourceProvider {
  private static scriptPath = resolve(__dirname, 'get-current-track.jxa');

  protected async getNowPlaying() {
    const result = await execFileAsync(ITunesSourceProvider.scriptPath);
    return JSON.parse(result) as NowPlayingTrack | null;
  }
}
