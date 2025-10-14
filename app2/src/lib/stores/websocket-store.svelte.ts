// WebSocket store for managing real-time log connections
import { terminalStore } from './terminal-store.svelte';

export const websocketStore = $state({
  socket: null as WebSocket | null,
  isConnected: false,
  isConnecting: false,
  connectionError: null as string | null,
  wsInitialized: false,

  // Initialize WebSocket connection
  connect(url: string = 'ws://localhost:8080/ws') {
    if (this.wsInitialized || (this.socket?.readyState === WebSocket.OPEN)) {
      return; // Already initialized or connected
    }

    this.wsInitialized = true;
    this.isConnecting = true;
    this.connectionError = null;

    try {
      this.socket = new WebSocket(url);

      this.socket.addEventListener('open', () => {
        this.isConnected = true;
        this.isConnecting = false;
        terminalStore.setConnectionError(null);
      });

      this.socket.addEventListener('message', (event) => {

        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'info' && data.message) {
            // Handle info message with available types
            const info = data.message;
            if (info.types && Array.isArray(info.types)) {
              // Update terminal store with available types
              terminalStore.logTypes = info.types;
            }
          } else if (data.type === 'log' && data.message) {
            // The actual log data is in the message field
            const logData = data.message;

            // Only store if it has the required fields
            if (logData.type && logData.data !== undefined) {
              // Add to store directly
              terminalStore.addLog(logData);
            }
          } else if (data.type === 'history' && data.messages) {
            // Handle history messages (array of log messages) - prepend to show older messages first
            if (Array.isArray(data.messages)) {
              let n = data.messages.length;
              while ((--n) > -1) {
                const logData = data.messages[n];
                // Only store if it has the required fields
                if (logData.type && logData.data !== undefined) {
                  terminalStore.prependLog(logData);
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          terminalStore.setConnectionError('Failed to parse WebSocket message');
        }
      });

      this.socket.addEventListener('close', () => {
        this.isConnected = false;
        this.isConnecting = false;
      });

      this.socket.addEventListener('error', (event) => {
        this.connectionError = 'WebSocket connection failed';
        this.isConnected = false;
        this.isConnecting = false;
        terminalStore.setConnectionError('WebSocket connection failed');
      });

    } catch (error) {
      this.connectionError = 'Failed to create WebSocket connection';
      this.isConnecting = false;
    }
  },

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.wsInitialized = false;
  },

  // Request historical messages
  requestHistory(logType: string, lastTimestamp?: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "history",
        logType,
        lastTimestamp
      }));
    }
  },

  // Reconnect (useful for manual reconnection)
  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 1000); // Small delay before reconnecting
  }
});