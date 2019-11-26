import osascript from 'osascript-tag';
import { SpotifySourceProvider } from 'lib/sources/spotify/SpotifySourceProvider';

beforeEach(jest.useFakeTimers);
afterEach(jest.clearAllTimers);

describe('SpotifySourceProvider', () => {
  it('calls osascript.jxa with correct script', () => {
    const runScriptFn = jest.fn();
    jest.spyOn(osascript, 'jxa').mockImplementationOnce(() => runScriptFn);
    const source = new SpotifySourceProvider({ updateFrequency: 10000 });
    source.listen();
    expect(runScriptFn.mock.calls[0]).toMatchSnapshot();
  });

  it('reports the track via osascript', async () => {
    const expectedTrack = { artist: 'UFO', title: 'Space Child' };

    // osascript.jxa does returns a track
    jest.spyOn(osascript, 'jxa').mockImplementation(() => async () => expectedTrack);

    const onChangeFn = jest.fn();

    const source = new SpotifySourceProvider({ updateFrequency: 1 });
    source.on(SpotifySourceProvider.Events.TrackChanged, onChangeFn);
    source.listen();

    await new Promise(process.nextTick);
    expect(onChangeFn).toHaveBeenCalledWith(expectedTrack);
  });

  it('does not report a track if nothing is currently playing', async () => {
    // osascript.jxa does not return a track
    jest.spyOn(osascript, 'jxa').mockImplementation(() => async () => null);

    const onChangeFn = jest.fn();
    const source = new SpotifySourceProvider({ updateFrequency: 1 });
    source.on(SpotifySourceProvider.Events.TrackChanged, onChangeFn);
    source.listen();

    await new Promise(process.nextTick);
    expect(onChangeFn).not.toHaveBeenCalled();
  });
});
