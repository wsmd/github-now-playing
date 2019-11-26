import { SimpleEventEmitter } from 'lib/SimpleEventEmitter';

function createConcreteEventEmitter() {
  class ConcreteEventEmitter extends SimpleEventEmitter {
    public emitEvent(name: string, ...data: any) {
      this.emit(name, ...data);
    }
  }
  return new ConcreteEventEmitter();
}

describe('SimpleEventEmitter', () => {
  test('calls a listener when event is emitted', () => {
    const emitter = createConcreteEventEmitter();
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    emitter.on('a', listenerA);
    emitter.on('b', listenerB);
    emitter.emitEvent('a', { value: 'a' });
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerA).toHaveBeenCalledWith({ value: 'a' });
    expect(listenerB).not.toHaveBeenCalled();
  });

  test('does not call a listener if removed', () => {
    const emitter = createConcreteEventEmitter();
    const callback = jest.fn();
    emitter.on('a', callback);
    emitter.off('a', callback);
    emitter.emitEvent('a', { value: 'a' });
    expect(callback).not.toHaveBeenCalled();
  });

  test('does not call a listener if all listeners are removed', () => {
    const emitter = createConcreteEventEmitter();
    const callback = jest.fn();
    emitter.on('a', callback);
    emitter.removeAllListeners('a');
    emitter.emitEvent('a', { value: 'a' });
    expect(callback).not.toHaveBeenCalled();
  });
});
