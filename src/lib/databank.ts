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
	const RECENT_MESSAGE_LIMIT = 1000; // Max number of recent messages to give initially

	const emitter = new EventEmitter();
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
	 * Add data to the databank
	 */
	const addEntry = (
		type: string,
		data: string,
		timestamp: number,
		hash: number,
	): void => {
		const entry: LogEntry = { type, data, timestamp, hash };

		// Track this type
		availableTypes.add(type);

		// Insert into LokiJS collection for storage
		collection.insert(entry);

		emitter.emit("data", {
			type,
			data,
			timestamp,
			hash,
		});
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
				availableTypes.clear();
				// The tmp package automatically removes the temp file when the process exits
				console.log("DataBank cleanup. Temporary files will be removed.");
			} catch (error) {
				console.error("Error cleaning up DataBank resources:", error);
			}
		},

		/**
		 * Get recent messages for a newly connected client
		 * @param limit Optional limit of messages to return (defaults to 20)
		 */
		getRecentMessages(limit?: number): Array<LogEntry> {
			const requestedLimit = limit || RECENT_MESSAGE_LIMIT;

			// Query the LokiJS collection
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
			const requestedLimit = limit || 20;
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
			addEntry(type, data, timestamp, entryHash);
		},

		/**
		 * Subscribe to data events
		 */
		subscribe(callback: (data: LogEntry) => void): () => void {
			emitter.on("data", callback);
			return () => emitter.off("data", callback);
		},
	};
})();

export default databank;
