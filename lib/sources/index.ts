import { LastFMSourceProvider } from './lastfm/LastFMSourceProvider';
import { ITunesSourceProvider } from './itunes/ITunesSourceProvider';
import { SpotifySourceProvider } from './spotify/SpotifySourceProvider';

const NowPlayingSources = {
  LastFM: LastFMSourceProvider,
  iTunes: ITunesSourceProvider,
  Spotify: SpotifySourceProvider,
};

export { NowPlayingSources };
