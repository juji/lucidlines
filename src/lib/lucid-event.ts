import { EventEmitter } from "node:events";

/**
 * Custom event emitter for LucidLines
 * Provides typed event handling for the application
 */
export class LucidEvent extends EventEmitter {
	/**
	 * Emit an event with optional data
	 */
	emit(event: string, ...args: any[]): boolean {
		return super.emit(event, ...args);
	}

	/**
	 * Register an event listener
	 */
	on(event: string, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	/**
	 * Register a one-time event listener
	 */
	once(event: string, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	/**
	 * Remove an event listener
	 */
	off(event: string, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}

	/**
	 * Remove all listeners for an event or all events
	 */
	removeAllListeners(event?: string): this {
		return super.removeAllListeners(event);
	}

	/**
	 * Get the number of listeners for an event
	 */
	listenerCount(event: string): number {
		return super.listenerCount(event);
	}

	/**
	 * Get the names of events that have listeners
	 */
	eventNames(): (string | symbol)[] {
		return super.eventNames();
	}
}

/**
 * Factory function to create a new LucidEvent instance
 */
export function createLucidEvent(): LucidEvent {
	return new LucidEvent();
}
