import { EventEmitter } from 'events';
import { logger } from 'yanl';

type ListenersMap = {
  [event: string]: (...args: any[]) => void;
};

export class SimpleEventEmitter<Listeners extends ListenersMap = ListenersMap> {
  private emitter = new EventEmitter();

  public on<E extends keyof Listeners>(event: E, listener: Listeners[E]): this {
    this.emitter.addListener(event, listener);
    return this;
  }

  public off<E extends keyof Listeners>(event: E, listener: Listeners[E]): this {
    logger.debug('removed all listeners', event);
    this.emitter.removeListener(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  protected emit<E extends keyof Listeners>(event: E, ...args: Parameters<Listeners[E]>): boolean {
    logger.debug('emitted event', event, ...args);
    return this.emitter.emit(event, ...args);
  }
}
