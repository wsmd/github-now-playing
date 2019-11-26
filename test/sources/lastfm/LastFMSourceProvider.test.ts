import fetch from 'node-fetch';
import { LastFMSourceProvider } from 'lib/sources/lastfm/LastFMSourceProvider';
import { runNextUpdateTick } from '../../__helpers__/utils';
import * as LastFMResponseFixtures from '../../__fixtures__/lastfm-responses';

jest.mock('node-fetch');

function mockNextJSONResponse(value: any) {
  const fetchMock = (fetch as unknown) as jest.Mock;
  fetchMock.mockReturnValue({
    json: jest.fn().mockResolvedValueOnce(value),
  });
}

function createSourceProviderInstance() {
  return new LastFMSourceProvider({ updateFrequency: 1, apiKey: '123', user: 'batman' });
}

beforeEach(jest.useFakeTimers);

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe('LastFMSourceProvider', () => {
  it('makes a request to the last.fm API', async () => {
    const source = createSourceProviderInstance();

    mockNextJSONResponse(LastFMResponseFixtures.trackCurrentlyPlaying);

    expect(fetch).not.toHaveBeenCalled();
    source.listen();
    await runNextUpdateTick();

    expect(fetch).toHaveBeenCalledWith(
      'http://ws.audioscrobbler.com/2.0' +
        '?api_key=123' +
        '&format=json' +
        '&method=user.getrecenttracks' +
        '&user=batman',
    );
  });

  it('reports the now playing track', async () => {
    const onTrackChange = jest.fn();
    const source = createSourceProviderInstance();

    mockNextJSONResponse(LastFMResponseFixtures.trackCurrentlyPlaying);

    source.on(LastFMSourceProvider.Events.TrackChanged, onTrackChange);

    source.listen();
    await runNextUpdateTick();

    expect(onTrackChange).toHaveBeenCalledWith(LastFMResponseFixtures.expectedTrack);
  });

  it('does not report a track if nothing is currently playing', async () => {
    const onTrackStopped = jest.fn();
    const source = createSourceProviderInstance();

    mockNextJSONResponse(LastFMResponseFixtures.trackCurrentlyPlaying);

    source.on(LastFMSourceProvider.Events.TrackStopped, onTrackStopped);

    source.listen();
    await runNextUpdateTick();

    mockNextJSONResponse(LastFMResponseFixtures.noTrackCurrentlyPlaying);
    await runNextUpdateTick();

    expect(onTrackStopped).toHaveBeenCalled();
  });
});
