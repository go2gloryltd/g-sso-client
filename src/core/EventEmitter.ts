import { EventType, EventHandler } from '../types';

export class EventEmitter {
  private events: Map<EventType, Set<EventHandler>> = new Map();

  on(event: EventType, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  off(event: EventType, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: EventType, data?: any): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: EventType): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}