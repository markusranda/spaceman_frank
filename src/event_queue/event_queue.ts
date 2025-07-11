import { SpaceEvent } from "./space_events";

class EventQueue {
  private events: SpaceEvent[] = [];

  emit(event: SpaceEvent) {
    this.events.push(event);
  }

  consume(): SpaceEvent[] {
    const flushed = [...this.events];
    this.events.length = 0;
    return flushed;
  }
}

export const eventQueue = new EventQueue();
