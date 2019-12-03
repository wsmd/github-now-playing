import { GitHubProfileStatus } from 'github-profile-status';
import { GitHubNowPlaying } from 'lib/GitHubNowPlaying';
import { NowPlayingMonitor } from 'lib/NowPlayingMonitor';
import { SourceProvider } from 'lib/SourceProvider';
import { NowPlayingSources } from 'lib/sources';
import { runNextUpdateTick } from './__helpers__/utils';

function createConcreteSourceProvider(expectedTrack: { current: any }) {
  class ConcreteSourceProvider extends SourceProvider {
    protected getNowPlaying = async () => expectedTrack.current;
  }
  return new ConcreteSourceProvider({ updateFrequency: 1 });
}

jest.mock('github-profile-status');

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe('GitHubNowPlaying', () => {
  it('creates an instance of NowPlayingMonitor', () => {
    const nowPlayingInstance = new GitHubNowPlaying({ token: '12345' });
    expect(nowPlayingInstance).toBeInstanceOf(NowPlayingMonitor);
  });

  it('has Events statics', () => {
    expect(GitHubNowPlaying.Events).toMatchInlineSnapshot(`
      Object {
        "Error": "error",
        "ListenStart": "listen-start",
        "ListenStop": "listen-stop",
        "StatusCleared": "status-cleared",
        "StatusUpdated": "status-updated",
      }
    `);
  });

  it('has Sources statics', () => {
    expect(GitHubNowPlaying.Sources).toEqual({
      Spotify: NowPlayingSources.Spotify,
      LastFM: NowPlayingSources.LastFM,
      ITunes: NowPlayingSources.ITunes,
    });
  });

  it('creates an instance of GitHubProfileStatus as the status publisher', async () => {
    const currentTrack: { current: any } = { current: { title: 'A', artist: 'B' } };
    const nowPlaying = new GitHubNowPlaying({ token: 'foobar' });
    const source = createConcreteSourceProvider(currentTrack);
    nowPlaying.setSource(source);

    const profileStatusInstance = ((GitHubProfileStatus as any) as jest.Mock).mock.instances[0];

    // an instance of GitHubProfileStatus is created with the provided token
    expect(GitHubProfileStatus).toHaveBeenCalledWith({ token: 'foobar' });

    nowPlaying.listen();
    await runNextUpdateTick();

    expect(profileStatusInstance.set).toHaveBeenCalledWith({
      emoji: ':musical_note:',
      message: 'is listening to "A" by B',
    });

    currentTrack.current = null;
    await runNextUpdateTick();

    expect(profileStatusInstance.clear).toHaveBeenCalled();
  });
});
