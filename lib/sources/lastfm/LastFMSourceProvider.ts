import url from 'url';
import query from 'querystring';
import fetch from 'node-fetch';
import { logger } from 'yanl';
import { SourceProvider } from '../../SourceProvider';
import { NowPlayingTrack } from '../../types';

export interface LastFMSourceProviderOptions {
  apiKey: string;
  user: string;
}

export class LastFMSourceProvider extends SourceProvider<LastFMSourceProviderOptions> {
  protected async getNowPlaying(): Promise<NowPlayingTrack | null> {
    const response = await fetch(this.recentTracksUrl);
    const payload = await response.json();

    logger.debug('api request to last.fm', response.status, response.statusText);

    const track = payload?.recenttracks?.track[0];
    if (track?.['@attr']?.nowplaying === 'true') {
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
        user: this.options.user,
      }),
    });
  }
}
