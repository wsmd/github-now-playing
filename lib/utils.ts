import { EventEmitter } from 'events';

type Listener<M, E extends keyof M> = M[E] extends never ? () => void : (arg1: M[E]) => void;

export abstract class SimpleEventEmitter<M> extends EventEmitter {
  public on<E extends Extract<keyof M, string>>(event: E, listener: Listener<M, E>): this {
    return super.on(event, listener);
  }

  public emit<E extends Extract<keyof M, string>>(event: E, payload?: M[E]): boolean {
    return super.emit(event, payload);
  }
}
