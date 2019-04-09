import { EventEmitter } from 'events';
import query from 'querystring';
import request from 'request-promise';
import url from 'url';
import { SourceProvider } from './sourceProvider';

interface LastFMSourceProviderOptions {
  apiKey: string;
}

export class LastFMSourceProvider extends EventEmitter implements SourceProvider {
  constructor(private options: LastFMSourceProviderOptions) {
    super();
  }

  public async getNowPlaying() {
    try {
      const res = await request.get(this.recentTracksUrl, { json: true });
      const track = res.recenttracks.track[0];
      this.emit('check', track);
      if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
        return {
          artist: track.artist['#text'],
          title: track.name,
        };
      }
      return null;
    } catch (error) {
      this.emit('error', error);
      return null;
    }
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
