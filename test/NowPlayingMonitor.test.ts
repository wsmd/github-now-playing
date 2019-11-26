import { SourceProvider } from 'lib/SourceProvider';
import { NowPlayingMonitor } from 'lib/NowPlayingMonitor';
import { StatusPublisher } from 'lib/types';
import { runNextUpdateTick } from './__helpers__/utils';

function createStatusPublisher(): StatusPublisher {
  return {
    clear: jest.fn(),
    set: jest.fn().mockImplementation(async value => value),
  };
}

function createConcreteSourceProvider(expectedTrack: { current: any }) {
  class ConcreteSourceProvider extends SourceProvider {
    protected getNowPlaying = async () => expectedTrack.current;
  }
  return new ConcreteSourceProvider({ updateFrequency: 1 });
}

beforeEach(jest.useFakeTimers);
afterEach(jest.clearAllTimers);

describe('NowPlayingMonitor', () => {
  it('calls listen-start event on start', () => {
    const onStartFn = jest.fn();
    const currentTrack = { current: null };
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);

    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.ListenStart, onStartFn);
    nowPlayingMonitor.listen();

    expect(onStartFn).toHaveBeenCalled();
  });

  it('updates the status on track change', async () => {
    const onStatusUpdated = jest.fn();
    const currentTrack = { current: { title: 'foo', artist: 'bar' } };
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);

    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.StatusUpdated, onStatusUpdated);

    nowPlayingMonitor.listen();
    await runNextUpdateTick();

    expect(statusPublisher.set).toHaveBeenCalledWith({
      emoji: ':musical_note:',
      message: 'is listening to "foo" by bar',
    });

    expect(onStatusUpdated).toHaveBeenCalledWith({
      emoji: ':musical_note:',
      message: 'is listening to "foo" by bar',
    });
  });

  it('clears the status on track stop', async () => {
    const onStatusClear = jest.fn();
    const currentTrack: { current: any } = { current: { title: 'foo', artist: 'bar' } };
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);

    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.StatusCleared, onStatusClear);

    nowPlayingMonitor.listen();
    await runNextUpdateTick();

    currentTrack.current = null;
    await runNextUpdateTick();

    expect(statusPublisher.clear).toHaveBeenCalled();
    expect(onStatusClear).toHaveBeenCalled();
  });

  it('clears the status on monitor stop if status is dirty', async () => {
    const onStatusClear = jest.fn();
    const currentTrack: { current: any } = { current: { title: 'foo', artist: 'bar' } };
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);

    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.StatusCleared, onStatusClear);

    nowPlayingMonitor.listen();
    await runNextUpdateTick();

    nowPlayingMonitor.stop();
    await runNextUpdateTick();

    expect(statusPublisher.clear).toHaveBeenCalled();
    expect(onStatusClear).toHaveBeenCalled();
  });

  it('does not update status when monitor is stopped', async () => {
    const onListenStop = jest.fn();
    const currentTrack: { current: any } = { current: { title: 'foo', artist: 'bar' } };
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);

    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.ListenStop, onListenStop);
    nowPlayingMonitor.listen();
    nowPlayingMonitor.stop();

    await runNextUpdateTick();

    expect(statusPublisher.set).not.toHaveBeenCalled();
    expect(onListenStop).toHaveBeenCalled();
  });

  it('stops current source provider when using a new one', async () => {
    const onStatusUpdated = jest.fn();
    const currentTrackSourceA: { current: any } = { current: { title: 'A', artist: 'A' } };
    const currentTrackSourceB: { current: any } = { current: { title: 'B', artist: 'B' } };
    const sourceProviderA = createConcreteSourceProvider(currentTrackSourceA);
    const sourceProviderB = createConcreteSourceProvider(currentTrackSourceB);

    const statusPublisher = createStatusPublisher();
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.StatusUpdated, onStatusUpdated);

    nowPlayingMonitor.setSource(sourceProviderA);

    nowPlayingMonitor.listen();

    nowPlayingMonitor.setSource(sourceProviderB);

    await runNextUpdateTick();

    expect(onStatusUpdated).toHaveBeenCalledTimes(1);
    expect(onStatusUpdated).toHaveBeenCalledWith({
      emoji: ':musical_note:',
      message: 'is listening to "B" by B',
    });
  });

  it('emits errors when the status publisher fails to update', async () => {
    const onErrorFn = jest.fn();
    const currentTrack: { current: any } = { current: { title: 'A', artist: 'A' } };
    const statusPublisher = createStatusPublisher();
    (statusPublisher.set as jest.Mock).mockRejectedValue(new Error());
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);
    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.Error, onErrorFn);

    // update status
    nowPlayingMonitor.listen();
    await runNextUpdateTick();

    expect(onErrorFn).toHaveBeenCalled();
  });

  it('emits errors when the status publisher fails to clear', async () => {
    const onErrorFn = jest.fn();
    const currentTrack: { current: any } = { current: { title: 'A', artist: 'A' } };
    const statusPublisher = createStatusPublisher();
    (statusPublisher.clear as jest.Mock).mockRejectedValue(new Error());
    const sourceProvider = createConcreteSourceProvider(currentTrack);
    const nowPlayingMonitor = new NowPlayingMonitor(statusPublisher);
    nowPlayingMonitor.setSource(sourceProvider);
    nowPlayingMonitor.on(NowPlayingMonitor.Events.Error, onErrorFn);

    // update status
    nowPlayingMonitor.listen();
    await runNextUpdateTick();

    // clear status
    nowPlayingMonitor.stop();
    await runNextUpdateTick();

    expect(onErrorFn).toHaveBeenCalled();
  });
});
