import { EventEmitter } from 'events';
import { NowPlayingTrack } from '../nowPlayingTrack';
import { SimpleEventEmitter } from '../utils';

enum Event {
  Error = 'error',
}

interface Events {
  [Event.Error]: any;
}

export abstract class SourceProvider extends SimpleEventEmitter<Events> {
  public static Events = Event;

  public async getNowPlaying(): Promise<NowPlayingTrack | null> {
    try {
      const result = await this.check();
      return result;
    } catch (error) {
      this.emit(SourceProvider.Events.Error, error);
      return null;
    }
  }

  protected async check(): Promise<NowPlayingTrack | null> {
    throw new Error('Method not implemented');
  }
}
