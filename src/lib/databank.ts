import { EventEmitter } from "node:events";
import Loki, { type Collection } from "lokijs";
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
interface LogEntry {
	type: string;
	data: string;
	hash: number;
	timestamp: number;
}

export class DataBank extends EventEmitter {
	private buffer: Array<LogEntry> = [];
	private maxBufferSize: number = 10_000; // Default max buffer size
	private db: Loki;
	private collection: Collection<LogEntry>;
	private tempFile: tmp.FileResult | null = null;
	private availableTypes: Set<string> = new Set();

	constructor() {
		super();

		// Create temp file for LokiJS that will be auto-deleted when the process exits
		this.tempFile = tmp.fileSync({
			prefix: "lucidlines-db-",
			postfix: ".json",
			keep: false,
		});

		// Initialize LokiJS with the temp file
		this.db = new Loki(this.tempFile.name, {
			autoload: false,
			autosave: true,
			autosaveInterval: 5000, // Save every 5 seconds
			verbose: false,
		});

		// Create a collection for log entries
		this.collection = this.db.addCollection("logs", {
			indices: ["timestamp"],
			disableMeta: true, // Disable metadata for better performance
		});
	}

	/**
	 * Clean up resources - should be called by the user of this instance when shutting down
	 * This ensures all data is saved and resources are properly released
	 */
	public cleanup(): void {
		try {
			// Save any pending changes to disk before closing
			if (this.db) {
				this.db.close();
			}
			// Clear in-memory data
			this.buffer = [];
			this.availableTypes.clear();
			// The tmp package automatically removes the temp file when the process exits
			console.log("DataBank cleanup: temporary database file will be removed");
		} catch (error) {
			console.error("Error cleaning up DataBank resources:", error);
		}
	}

	/**
	 * Add data to the buffer and manage buffer size
	 * Uses splice for in-place array modification - most memory efficient approach
	 */
	private addToBuffer(
		type: string,
		data: string,
		timestamp: number,
		hash: number,
	): void {
		const entry: LogEntry = { type, data, timestamp, hash };

		// Track this type
		this.availableTypes.add(type);

		// Insert into LokiJS collection for long-term storage
		this.collection.insert(entry);

		// Add new entry to the end
		this.buffer.push(entry);

		// If buffer exceeds max capacity, remove oldest items from the beginning
		if (this.buffer.length > this.maxBufferSize) {
			// Remove excess items from the beginning (most memory efficient)
			// Calculate how many items to remove
			const removeCount = this.buffer.length - this.maxBufferSize;
			this.buffer.splice(0, removeCount);
		}
	}

	// getWritable method removed as we're using addData directly

	/**
	 * Get recent messages for a newly connected client
	 * @param limit Optional limit of messages to return (defaults to maxBufferSize)
	 */
	getRecentMessages(limit?: number): Array<LogEntry> {
		const requestedLimit = limit || this.maxBufferSize;

		// For small requests within buffer size, use the in-memory buffer for best performance
		if (requestedLimit <= this.buffer.length) {
			return [...this.buffer].slice(-requestedLimit);
		}

		// For larger requests, query the LokiJS collection
		return this.collection
			.chain()
			.find()
			.simplesort("timestamp", true) // Sort by timestamp in descending order
			.limit(requestedLimit)
			.data();
	}

	/**
	 * Get all available messages (may be a very large dataset)
	 * Use with caution!
	 */
	getAllMessages(): Array<LogEntry> {
		return this.collection.chain().find().simplesort("timestamp", true).data();
	}

	/**
	 * Get the total count of all messages stored
	 */
	getTotalMessageCount(): number {
		return this.collection.count();
	}

	/**
	 * Get the count of messages for a specific type
	 */
	getMessageCountByType(type: string): number {
		return this.collection.chain().find({ type }).count();
	}

	/**
	 * Get all unique message types stored
	 */
	getAvailableTypes(): string[] {
		return Array.from(this.availableTypes);
	}

	/**
	 * Get messages by type with an optional limit
	 */
	getMessageByType(
		type: string,
		lastTimestamp?: number,
		limit?: number,
	): Array<LogEntry> {
		const requestedLimit = limit || this.maxBufferSize;
		const query = this.collection.chain().find({ type });

		if (lastTimestamp) {
			query.where((obj) => obj.timestamp < lastTimestamp);
		}

		return query
			.simplesort("timestamp", true) // Sort by timestamp in descending order (newest first)
			.limit(requestedLimit)
			.data()
			.sort((a, b) => a.timestamp - b.timestamp); // Return in ascending order
	}

	/**
	 * Add custom data to the databank (not from the stream)
	 */
	addData(type: string, data: string): void {
		const timestamp = Date.now();
		const entryHash = hash({ type, data, timestamp });
		this.addToBuffer(type, data, timestamp, entryHash);
		this.emit("data", {
			type,
			data,
			timestamp,
			hash: entryHash,
		});
	}

	/**
	 * Subscribe to data events
	 */
	subscribe(
		callback: (data: { type: string; data: string; timestamp: number }) => void,
	): () => void {
		this.on("data", callback);
		return () => this.off("data", callback);
	}
}

// Export a singleton instance for the application
const databank = new DataBank();
export default databank;
