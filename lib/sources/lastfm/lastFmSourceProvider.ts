import query from 'querystring';
import request from 'request-promise';
import url from 'url';
import { NowPlayingSourceProvider } from '../sourceProvider';

interface LastFMSourceProviderOptions {
  apiKey: string;
}

export class LastFMSourceProvider extends NowPlayingSourceProvider<LastFMSourceProviderOptions> {
  protected async getNowPlaying() {
    const res = await request.get(this.recentTracksUrl, { json: true });
    const track = res.recenttracks.track[0];
    if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
      return {
        artist: track.artist['#text'],
        title: track.name,
      };
    }
    return null;
  }

  private get recentTracksUrl(): string {
    return url.format({
      hostname: 'ws.audioscrobbler.com',
      pathname: '/2.0',
      protocol: 'http',
      search: query.stringify({
        api_key: this.options.apiKey,
        format: 'json',
        method: 'user.getrecenttracks',
        user: 'dwaseem',
      }),
    });
  }
}
