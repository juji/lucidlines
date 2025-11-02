import { EventEmitter } from "node:events";
import { rmSync } from "node:fs";
import { Level } from "level";
import * as tmp from "tmp";

/**
 * DataBank - A central store for streaming data that decouples
 * data producers from consumers (WebSocket clients).
 *
 * - Stores and manages data with a simple API
 * - Buffers recent messages for new clients using LevelDB (persistent DB)
 * - Provides a clean event-based API for consumers
 * - Uses temporary file storage that's cleaned up on exit
 */

// Define the type for log entries
export interface LogEntry {
	type: string;
	data: string;
	timestamp: number;
}

/**
 * Factory function to create a new DataBank instance
 */
export function createDatabank() {
	const RECENT_MESSAGE_LIMIT = 100; // Max number of recent messages to give initially

	const emitter = new EventEmitter();
	const availableTypes: Set<string> = new Set();

	// Create temp directory for LevelDB that will be cleaned up when the process exits
	const tempDir = tmp.dirSync({
		prefix: "lucidlines-db-",
		unsafeCleanup: true,
	});

	// Initialize LevelDB database
	const db = new Level<string, LogEntry>(tempDir.name, {
		valueEncoding: "json",
	});

	// Counter for generating sequential IDs
	let idCounter = 0;

	/**
	 * Generate a sortable key for timestamp-based ordering
	 * Format: timestamp-paddedId to ensure chronological order
	 */
	const generateKey = (timestamp: number, id: number): string => {
		return `${timestamp.toString().padStart(20, "0")}-${id.toString().padStart(10, "0")}`;
	};

	/**
	 * Add data to the databank
	 */
	const addEntry = async (
		type: string,
		data: string,
		timestamp: number,
	): Promise<void> => {
		const entry: LogEntry = { type, data, timestamp };

		// Track this type
		availableTypes.add(type);

		// Store in LevelDB with timestamp-based key for ordering
		const key = generateKey(timestamp, idCounter++);
		await db.put(key, entry);

		emitter.emit("data", entry);
	};

	return {
		/**
		 * Clean up resources - should be called by the user of this instance when shutting down
		 * This ensures all data is saved and resources are properly released
		 */
		async cleanup(): Promise<void> {
			try {
				// Close the database connection
				await db.close();
				// Clear in-memory data
				availableTypes.clear();
				// Remove the temporary directory
				try {
					rmSync(tempDir.name, { recursive: true, force: true });
				} catch (e) {
					// Ignore errors during cleanup
				}
				console.log("DataBank cleanup completed.");
			} catch (error) {
				console.error("Error cleaning up DataBank resources:", error);
			}
		},

		/**
		 * Get recent messages for a newly connected client
		 * @param limit Optional limit of messages to return (defaults to 1000)
		 */
		async getRecentMessages(limit?: number): Promise<Array<LogEntry>> {
			const requestedLimit = limit || RECENT_MESSAGE_LIMIT;
			const entries: Array<LogEntry> = [];

			// Read entries in reverse order (newest first)
			for await (const [_, entry] of db.iterator({
				reverse: true,
				limit: requestedLimit,
			})) {
				entries.push(entry);
			}

			// Reverse to return in ascending order (oldest to newest)
			return entries.reverse();
		},

		/**
		 * Get all available messages (may be a very large dataset)
		 * Use with caution!
		 */
		async getAllMessages(): Promise<Array<LogEntry>> {
			const entries: Array<LogEntry> = [];

			for await (const [_, entry] of db.iterator({ reverse: true })) {
				entries.push(entry);
			}

			return entries.reverse();
		},

		/**
		 * Get the total count of all messages stored
		 */
		async getTotalMessageCount(): Promise<number> {
			let count = 0;
			for await (const _ of db.keys()) {
				count++;
			}
			return count;
		},

		/**
		 * Get the count of messages for a specific type
		 */
		async getMessageCountByType(type: string): Promise<number> {
			let count = 0;
			for await (const [_, entry] of db.iterator()) {
				if (entry.type === type) {
					count++;
				}
			}
			return count;
		},

		/**
		 * Get all unique message types stored
		 */
		getAvailableTypes(): string[] {
			return Array.from(availableTypes);
		},

		/**
		 * Get messages by type with an optional limit
		 */
		async getMessageByType(
			type: string,
			lastTimestamp?: number,
			limit?: number,
		): Promise<Array<LogEntry>> {
			const requestedLimit = limit || 20;
			const entries: Array<LogEntry> = [];

			// Iterate in reverse order (newest first)
			for await (const [_, entry] of db.iterator({ reverse: true })) {
				// Filter by type
				if (entry.type !== type) continue;

				// Filter by timestamp if provided
				if (lastTimestamp && entry.timestamp >= lastTimestamp) continue;

				entries.push(entry);

				// Stop when we reach the limit
				if (entries.length >= requestedLimit) break;
			}

			// Reverse to return in ascending order (oldest to newest)
			return entries.reverse();
		},

		/**
		 * Add custom data to the databank (not from the stream)
		 */
		addData(type: string, data: string): void {
			const timestamp = Date.now();
			// Fire and forget - we don't await here to maintain sync behavior
			addEntry(type, data, timestamp).catch((err) =>
				console.error("Error adding data to databank:", err),
			);
		},

		/**
		 * Subscribe to data events
		 */
		subscribe(callback: (data: LogEntry) => void): () => void {
			emitter.on("data", callback);
			return () => emitter.off("data", callback);
		},
	};
}
