import { SourceProvider } from 'lib/SourceProvider';
import { runNextUpdateTick } from './__helpers__/utils';

function createConcreteSourceProvider(expectedTrack: { current: any }) {
  class ConcreteSourceProvider extends SourceProvider {
    protected getNowPlaying = async () => expectedTrack.current;
  }
  return new ConcreteSourceProvider({ updateFrequency: 1 });
}

beforeEach(jest.useFakeTimers);
afterEach(jest.clearAllTimers);

describe('SourceProvider', () => {
  it('emits a track-changed event after a track change', async () => {
    const expectedTrack: { current: any } = { current: null };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackChangedFn = jest.fn();
    source.on(SourceProvider.Events.TrackChanged, trackChangedFn);
    source.listen();

    // next check
    await runNextUpdateTick();
    expect(trackChangedFn).not.toHaveBeenCalled();

    expectedTrack.current = { title: 'foo', artist: 'bar' };

    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalledWith(expectedTrack.current);

    source.stop();
  });

  it('emits a track-changed event if a track is already playing', async () => {
    const expectedTrack: { current: any } = { current: { title: 'foo', artist: 'bar' } };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackChangedFn = jest.fn();
    source.on(SourceProvider.Events.TrackChanged, trackChangedFn);
    source.listen();

    // next check
    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalledWith(expectedTrack.current);

    source.stop();
  });

  it('emits a track-changed event once if a track has not changed', async () => {
    const expectedTrack: { current: any } = { current: { title: 'a', artist: 'b' } };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackChangedFn = jest.fn();
    source.on(SourceProvider.Events.TrackChanged, trackChangedFn);
    source.listen();

    // first tick
    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalled();

    // second tick
    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalledTimes(1);

    source.stop();
  });

  it('emits a track-changed event if a track has changed', async () => {
    const expectedTrack: { current: any } = { current: { title: 'a', artist: 'a' } };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackChangedFn = jest.fn();
    source.on(SourceProvider.Events.TrackChanged, trackChangedFn);
    source.listen();

    // first tick
    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalled();

    expectedTrack.current = { title: 'a', artist: 'b' };

    // second tick
    await runNextUpdateTick();
    expect(trackChangedFn).toHaveBeenCalledTimes(2);

    source.stop();
  });

  it('emits a track-stopped when a track stops', async () => {
    const expectedTrack: { current: any } = { current: null };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackStoppedFn = jest.fn();
    source.on(SourceProvider.Events.TrackStopped, trackStoppedFn);
    source.listen();

    await runNextUpdateTick();
    expect(trackStoppedFn).not.toHaveBeenCalled();

    // track changed
    expectedTrack.current = { title: 'foo', artist: 'bar' };

    await runNextUpdateTick();
    expect(trackStoppedFn).not.toHaveBeenCalled();

    // track becomes null
    expectedTrack.current = null;

    await runNextUpdateTick();
    expect(trackStoppedFn).toHaveBeenCalled();

    source.stop();
  });

  it('emits an error event when something goes wrong', async () => {
    const source = createConcreteSourceProvider({
      get current() {
        throw new Error();
      },
    });

    const onErrorFn = jest.fn();
    source.on(SourceProvider.Events.Error, onErrorFn);
    source.listen();

    await runNextUpdateTick();

    expect(onErrorFn).toHaveBeenCalled();
  });

  it('does not emit a track change if stopped', async () => {
    const expectedTrack: { current: any } = { current: { title: 'foo', artist: 'bar' } };
    const source = createConcreteSourceProvider(expectedTrack);

    const trackChangedFn = jest.fn();
    source.on(SourceProvider.Events.TrackChanged, trackChangedFn);
    source.listen();
    source.stop();

    await runNextUpdateTick();
    expect(trackChangedFn).not.toHaveBeenCalled();
  });

  it('throws if checkNowPlayingMethod is not implemented', () => {
    // tslint:disable-next-line: max-classes-per-file
    class ConcreteSourceProvider extends SourceProvider {}
    const onErrorFn = jest.fn();
    const source = new ConcreteSourceProvider({ updateFrequency: 1 });
    source.on(SourceProvider.Events.Error, onErrorFn);
    source.listen();
    expect(onErrorFn).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/not implemented/) }),
    );
  });
});
