import { EventEmitter } from "node:events";
import Loki from "lokijs";
import { hash } from "object-code";
import * as tmp from "tmp";

/**
 * DataBank - A central store for streaming data that decouples
 * data producers from consumers (WebSocket clients).
 *
 * - Stores and manages data with a simple API
 * - Buffers recent messages for new clients using LokiJS (in-memory DB)
 * - Provides a clean event-based API for consumers
 * - Uses temporary file storage for large datasets that's cleaned up on exit
 */

// Define the type for log entries
export interface LogEntry {
	type: string;
	data: string;
	hash: number;
	timestamp: number;
}

// Create the singleton databank object
const databank = (() => {
	const emitter = new EventEmitter();
	const buffer: Array<LogEntry> = [];
	const maxBufferSize: number = 10_000; // Default max buffer size
	const availableTypes: Set<string> = new Set();

	// Create temp file for LokiJS that will be auto-deleted when the process exits
	const tempFile = tmp.fileSync({
		prefix: "lucidlines-db-",
		postfix: ".json",
		keep: false,
	});

	// Initialize LokiJS with the temp file
	const db = new Loki(tempFile.name, {
		autoload: false,
		autosave: true,
		autosaveInterval: 5000, // Save every 5 seconds
		verbose: false,
	});

	// Create a collection for log entries
	const collection = db.addCollection<LogEntry>("logs", {
		indices: ["timestamp", "type"],
		disableMeta: true, // Disable metadata for better performance
	});

	/**
	 * Add data to the buffer and manage buffer size
	 * Uses splice for in-place array modification - most memory efficient approach
	 */
	const addToBuffer = (
		type: string,
		data: string,
		timestamp: number,
		hash: number,
	): void => {
		const entry: LogEntry = { type, data, timestamp, hash };

		// Track this type
		availableTypes.add(type);

		// Insert into LokiJS collection for long-term storage
		collection.insert(entry);

		// Add new entry to the end
		buffer.push(entry);

		// If buffer exceeds max capacity, remove oldest items from the beginning
		if (buffer.length > maxBufferSize) {
			// Remove excess items from the beginning (most memory efficient)
			// Calculate how many items to remove
			const removeCount = buffer.length - maxBufferSize;
			buffer.splice(0, removeCount);
		}
	};

	return {
		/**
		 * Clean up resources - should be called by the user of this instance when shutting down
		 * This ensures all data is saved and resources are properly released
		 */
		cleanup(): void {
			try {
				// Save any pending changes to disk before closing
				if (db) {
					db.close();
				}
				// Clear in-memory data
				buffer.length = 0;
				availableTypes.clear();
				// The tmp package automatically removes the temp file when the process exits
				console.log(
					"DataBank cleanup: temporary database file will be removed",
				);
			} catch (error) {
				console.error("Error cleaning up DataBank resources:", error);
			}
		},

		/**
		 * Get recent messages for a newly connected client
		 * @param limit Optional limit of messages to return (defaults to maxBufferSize)
		 */
		getRecentMessages(limit?: number): Array<LogEntry> {
			const requestedLimit = limit || maxBufferSize;

			// For small requests within buffer size, use the in-memory buffer for best performance
			if (requestedLimit <= buffer.length) {
				return [...buffer].slice(-requestedLimit);
			}

			// For larger requests, query the LokiJS collection
			return collection
				.chain()
				.find()
				.simplesort("timestamp", true) // Sort by timestamp in descending order
				.limit(requestedLimit)
				.data()
				.sort((a, b) => a.timestamp - b.timestamp); // Return in ascending order;
		},

		/**
		 * Get all available messages (may be a very large dataset)
		 * Use with caution!
		 */
		getAllMessages(): Array<LogEntry> {
			return collection.chain().find().simplesort("timestamp", true).data();
		},

		/**
		 * Get the total count of all messages stored
		 */
		getTotalMessageCount(): number {
			return collection.count();
		},

		/**
		 * Get the count of messages for a specific type
		 */
		getMessageCountByType(type: string): number {
			return collection.chain().find({ type }).count();
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
		getMessageByType(
			type: string,
			lastTimestamp?: number,
			limit?: number,
		): Array<LogEntry> {
			const requestedLimit = limit || maxBufferSize;
			const query = collection.chain().find({ type });

			if (lastTimestamp) {
				query.where((obj) => obj.timestamp < lastTimestamp);
			}

			return query
				.simplesort("timestamp", true) // Sort by timestamp in descending order (newest first)
				.limit(requestedLimit)
				.data()
				.sort((a, b) => a.timestamp - b.timestamp); // Return in ascending order
		},

		/**
		 * Add custom data to the databank (not from the stream)
		 */
		addData(type: string, data: string): void {
			const timestamp = Date.now();
			const entryHash = hash({ type, data, timestamp });
			addToBuffer(type, data, timestamp, entryHash);
			emitter.emit("data", {
				type,
				data,
				timestamp,
				hash: entryHash,
			});
		},

		/**
		 * Subscribe to data events
		 */
		subscribe(
			callback: (data: {
				type: string;
				data: string;
				timestamp: number;
			}) => void,
		): () => void {
			emitter.on("data", callback);
			return () => emitter.off("data", callback);
		},
	};
})();

export default databank;
