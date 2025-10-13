import { create } from 'zustand';

// Types for terminal log messages based on the actual data structure from the server
export interface LogMessage {
  type: string;   // Message type (e.g. 'stdout', 'stderr', etc.)
  data: string;   // The actual log content
  timestamp: number; // When the log was created
}

// Interface for the terminal store
interface TerminalState {
  // Logs grouped by their type (stdout, stderr, etc.)
  logs: Record<string, LogMessage[]>;

  // log types could be dynamic
  logTypes: string[];

  // Connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Actions to modify state
  addLog: (log: LogMessage) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  clearLogs: (logType?: string) => void;
}

// Create the store
export const useTerminalStore = create<TerminalState>((set) => ({
  // Initial state
  logs: {},
  logTypes: [],
  isConnected: false,
  connectionError: null,
  
  // Add a single log entry
  addLog: (log: LogMessage) => set((state) => {
    const logType = log.type || 'default';
    const currentLogs = state.logs[logType] || [];
    
    // Check if this is a new log type to update logTypes array
    const newLogTypes = !state.logs[logType] 
      ? [...state.logTypes, logType]  
      : state.logTypes;

    console.log('Adding log:', log);
    
    return {
      // Keep all existing state
      ...state,
      // Update logTypes if needed
      logTypes: newLogTypes,
      // Update logs with new log
      logs: {
        ...state.logs,
        [logType]: [...currentLogs, log]
      }
    };
  }),
  
  // Update connection status
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  
  // Update connection error
  setConnectionError: (error: string | null) => set({ connectionError: error }),
  
  // Clear logs for a specific type or all logs
  clearLogs: (logType?: string) => set((state) => {
    if (logType) {
      const updatedLogs = { ...state.logs };
      updatedLogs[logType] = [];
      return { logs: updatedLogs };
    } else {
      return { logs: {} };
    }
  })
}));