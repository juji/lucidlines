import * as stream from 'stream';
import * as http from 'http';

/**
 * DataBank - A central store for streaming data that decouples
 * data producers from consumers (WebSocket clients).
 *
 * - Stores and manages data with a simple API
 * - Buffers recent messages for new clients using LokiJS (in-memory DB)
 * - Provides a clean event-based API for consumers
 * - Uses temporary file storage for large datasets that's cleaned up on exit
 */
interface LogEntry {
    type: string;
    data: string;
    hash: number;
    timestamp: number;
}

/**
 * Main entry point for LucidLines
 * Starts the server and configures the concurrently-stream
 */
declare function start(options: {
    serverPort?: number;
    frontEnd?: string | number;
    wsPath?: string;
    commands?: Array<{
        command: string;
        name: string;
    }>;
    dev?: boolean;
}): {
    server: {
        server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
        stop: () => void;
    };
    nodeStream: {
        result: Promise<void>;
        transformStream: stream.Transform;
        stop(): void;
    } | undefined;
    databank: {
        cleanup(): void;
        getRecentMessages(limit?: number): Array<LogEntry>;
        getAllMessages(): Array<LogEntry>;
        getTotalMessageCount(): number;
        getMessageCountByType(type: string): number;
        getAvailableTypes(): string[];
        getMessageByType(type: string, lastTimestamp?: number, limit?: number): Array<LogEntry>;
        addData(type: string, data: string): void;
        subscribe(callback: (data: {
            type: string;
            data: string;
            timestamp: number;
        }) => void): () => void;
    };
    stop: () => void;
};

export { start };
