// Types for terminal log messages based on the actual data structure from the server
export interface LogMessage {
  type: string;   // Message type (e.g. 'stdout', 'stderr', etc.)
  data: string;   // The actual log content
  timestamp: number; // When the log was created
  hash: number; // Unique hash to identify the log message
}

// Terminal store using Svelte 5 runes
export const terminalStore = $state({
  logs: {} as Record<string, LogMessage[]>,
  logTypes: [] as string[],
  connectionError: null as string | null,

  // Actions to modify state
  addLog(log: LogMessage) {
    const logType = log.type || 'default';

    // Update logTypes if this is a new type
    if (!this.logTypes.includes(logType)) {
      this.logTypes = [...this.logTypes, logType];
    }

    // Add the log
    const currentLogs = this.logs[logType] || [];
    this.logs[logType] = [...currentLogs, log];
  },

  prependLog(log: LogMessage) {
    const logType = log.type || 'default';

    // Update logTypes if this is a new type
    if (!this.logTypes.includes(logType)) {
      this.logTypes = [...this.logTypes, logType];
    }

    // Prepend the log (for history messages)
    const currentLogs = this.logs[logType] || [];
    this.logs[logType] = [log, ...currentLogs];
  },

  setConnectionError(error: string | null) {
    this.connectionError = error;
  },

  clearLogs(logType?: string) {
    if (logType) {
      delete this.logs[logType];
    } else {
      this.logs = {};
    }
  }
});