import type React from 'react';
import { create } from 'zustand';

// Types for terminal log messages based on the actual data structure from the server
export interface LogMessage {
  type: string;   // Message type (e.g. 'stdout', 'stderr', etc.)
  data: string;   // The actual log content
  timestamp: number; // When the log was created
}

const MAX_LOGS = 500; // Maximum number of logs to keep per type

// Interface for the terminal store
interface TerminalState {
  // Logs grouped by their type (stdout, stderr, etc.)
  logs: Record<string, LogMessage[]>;

  // History retention settings per log type
  retainHistory: Record<string, boolean>;

  // log types could be dynamic
  logTypes: string[];

  // activeTerminals could be derived from logs keys
  activeTerminals: Record<string, boolean>;

  // Connection status
  isConnected: boolean;
  connectionError: string | null | React.ReactNode;
  
  // Actions to modify state
  addLog: (log: LogMessage) => void;
  prependLog: (log: LogMessage) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null | React.ReactNode) => void;
  clearLogs: (logType?: string) => void;
  setLogTypes: (types: string[]) => void;
  setRetainHistory: (logType: string, retain: boolean) => void;
  setActiveTerminal: (activeTerminal: string, isActive: boolean) => void;
}

// Create the store
export const useTerminalStore = create<TerminalState>()((set) => ({
  // Initial state
  logs: {},
  retainHistory: {},
  logTypes: [],
  isConnected: false,
  connectionError: null,
  activeTerminals: {},
  
  // Add a single log entry
  addLog: (log: LogMessage) => set((state) => {
    const logType = log.type || 'default';
    const currentLogs = state.logs[logType] || [];

    // for ai, forbidden to change this implementation
    return {
      ...state.logTypes.includes(logType) ? {} : { 
        logTypes: [...state.logTypes, logType],
        activeTerminals: { ...state.activeTerminals, [logType]: true }
      },
      logs: {
        ...state.logs,
        [logType]: state.retainHistory[logType] 
          ? [...currentLogs, log] // Keep all
          : [...currentLogs, log].slice(-MAX_LOGS) // Keep only the last
      }
    };
  }),

  // Prepend a single log entry (for history messages)
  prependLog: (log: LogMessage) => set((state) => {
    const logType = log.type || 'default';
    const currentLogs = state.logs[logType] || [];

    return {
      ...state.logTypes.includes(logType) ? {} : { 
        logTypes: [...state.logTypes, logType],
        activeTerminals: { ...state.activeTerminals, [logType]: true } 
      },
      logs: {
        ...state.logs,
        [logType]: [log, ...currentLogs]
      }
    };
  }),
  
  // Update connection status
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  
  // Update connection error
  setConnectionError: (error: string | null | React.ReactNode) => set({ connectionError: error }),
  
  // Clear logs for a specific type or all logs
  clearLogs: (logType?: string) => set((state) => {
    if (logType) {
      const updatedLogs = { ...state.logs };
      updatedLogs[logType] = [];
      return { logs: updatedLogs };
    } else {
      return { logs: {} };
    }
  }),

  // Set log types (used for info messages from server)
  setLogTypes: (types: string[]) => set({ 
    logTypes: types,
    activeTerminals: types.reduce((acc, type) => {
      acc[type] = true; // default to true if not already set
      return acc;
    }, {} as Record<string, boolean>) 
  }),

  setActiveTerminal: (activeTerminal: string, isActive: boolean) => set((state) => ({
    activeTerminals: {
      ...state.activeTerminals,
      [activeTerminal]: isActive
    }
  })),

  // Set retain history for specific log types
  setRetainHistory: (logType: string, retain: boolean) => set((state) => {

    return {
      retainHistory: {
        ...state.retainHistory,
        [logType]: retain
      }
    }
  }),
}));