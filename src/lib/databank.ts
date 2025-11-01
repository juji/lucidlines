import { EventEmitter } from "node:events";
import Database from "better-sqlite3";
import * as tmp from "tmp";

/**
 * DataBank - A central store for streaming data that decouples
 * data producers from consumers (WebSocket clients).
 *
 * - Stores and manages data with a simple API
 * - Buffers recent messages for new clients using SQLite (persistent DB)
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
	const RECENT_MESSAGE_LIMIT = 1000; // Max number of recent messages to give initially

	const emitter = new EventEmitter();
	const availableTypes: Set<string> = new Set();

	// Create temp file for SQLite that will be auto-deleted when the process exits
	const tempFile = tmp.fileSync({
		prefix: "lucidlines-db-",
		postfix: ".db",
		keep: false,
	});

	// Initialize SQLite database
	const db = new Database(tempFile.name);

	// Enable WAL mode for better concurrent performance
	db.pragma("journal_mode = WAL");

	// Create table for log entries
	db.exec(`
		CREATE TABLE IF NOT EXISTS logs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT NOT NULL,
			data TEXT NOT NULL,
			timestamp INTEGER NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_timestamp ON logs(timestamp);
		CREATE INDEX IF NOT EXISTS idx_type_timestamp ON logs(type, timestamp);
	`);

	// Prepare statements for better performance
	const insertStmt = db.prepare(
		"INSERT INTO logs (type, data, timestamp) VALUES (?, ?, ?)",
	);
	const countAllStmt = db.prepare("SELECT COUNT(*) as count FROM logs");
	const countByTypeStmt = db.prepare(
		"SELECT COUNT(*) as count FROM logs WHERE type = ?",
	);
	const getRecentStmt = db.prepare(
		"SELECT type, data, timestamp FROM logs ORDER BY timestamp DESC LIMIT ?",
	);
	const getAllStmt = db.prepare(
		"SELECT type, data, timestamp FROM logs ORDER BY timestamp DESC",
	);
	const getByTypeStmt = db.prepare(
		"SELECT type, data, timestamp FROM logs WHERE type = ? ORDER BY timestamp DESC LIMIT ?",
	);
	const getByTypeWithTimestampStmt = db.prepare(
		"SELECT type, data, timestamp FROM logs WHERE type = ? AND timestamp < ? ORDER BY timestamp DESC LIMIT ?",
	);

	/**
	 * Add data to the databank
	 */
	const addEntry = (type: string, data: string, timestamp: number): void => {
		const entry: LogEntry = { type, data, timestamp };

		// Track this type
		availableTypes.add(type);

		// Insert into SQLite database
		insertStmt.run(type, data, timestamp);

		emitter.emit("data", entry);
	};

	return {
		/**
		 * Clean up resources - should be called by the user of this instance when shutting down
		 * This ensures all data is saved and resources are properly released
		 */
		cleanup(): void {
			try {
				// Close the database connection
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
		 * @param limit Optional limit of messages to return (defaults to 1000)
		 */
		getRecentMessages(limit?: number): Array<LogEntry> {
			const requestedLimit = limit || RECENT_MESSAGE_LIMIT;
			const rows = getRecentStmt.all(requestedLimit) as Array<LogEntry>;
			// Reverse to return in ascending order (oldest to newest)
			return rows.reverse();
		},

		/**
		 * Get all available messages (may be a very large dataset)
		 * Use with caution!
		 */
		getAllMessages(): Array<LogEntry> {
			return getAllStmt.all() as Array<LogEntry>;
		},

		/**
		 * Get the total count of all messages stored
		 */
		getTotalMessageCount(): number {
			const result = countAllStmt.get() as { count: number };
			return result.count;
		},

		/**
		 * Get the count of messages for a specific type
		 */
		getMessageCountByType(type: string): number {
			const result = countByTypeStmt.get(type) as { count: number };
			return result.count;
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

			let rows: Array<LogEntry>;
			if (lastTimestamp) {
				rows = getByTypeWithTimestampStmt.all(
					type,
					lastTimestamp,
					requestedLimit,
				) as Array<LogEntry>;
			} else {
				rows = getByTypeStmt.all(type, requestedLimit) as Array<LogEntry>;
			}

			// Reverse to return in ascending order (oldest to newest)
			return rows.reverse();
		},

		/**
		 * Add custom data to the databank (not from the stream)
		 */
		addData(type: string, data: string): void {
			const timestamp = Date.now();
			addEntry(type, data, timestamp);
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
