import { useEffect, useRef, useCallback } from 'react';
import { useTerminalStore } from '../store/terminal-store';

/**
 * A hook that connects to WebSocket and stores data to Zustand
 */
export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  
  // Get actions from the terminal store
  const { addLog, prependLog, setConnected, setConnectionError, setLogTypes } = useTerminalStore();
  const connectionCount = useRef(0);

  // Function to request historical messages
  const requestHistory = useCallback((logType: string, lastTimestamp?: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "history",
        logType,
        lastTimestamp
      }));
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = Infinity;
    let reconnectDelay = 1000;
    let isConnecting = false;
    let connectionStartTime: number | null = null;

    const connect = () => {
      if (isConnecting) return; // Prevent multiple simultaneous connections
      isConnecting = true;

      // Clear any existing timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      // Close existing socket if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      // Create WebSocket connection
      const socket = new WebSocket(url);
      socketRef.current = socket;

      // Connection opened
      socket.addEventListener('open', () => {
        connectionStartTime = Date.now();
        setConnected(true);
        connectionCount.current += 1;

        if(connectionCount.current > 1){
          window.location.reload();
        }

        reconnectAttempts = 0; // Reset attempts on successful connection
        isConnecting = false;
        console.log(`WebSocket connected (connection #${connectionCount.current})`);
      });

      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          
          // Handle different message types
          if (data.type === 'info' && data.message) {
            // Handle info message with available types
            const info = data.message;
            if (info.types && Array.isArray(info.types)) {
              // Update terminal store with available types
              setLogTypes(info.types);
            }
          } else if (data.type === 'log' && data.message) {
            // The actual log data is in the message field
            const logData = data.message;
            
            // Only store if it has the required fields
            if (logData.type && logData.data !== undefined) {
              // Add to store directly
              addLog(logData);
            }
          } else if (data.type === 'history' && data.messages) {
            // Handle history messages (array of log messages) - prepend to show older messages first
            if (Array.isArray(data.messages)) {
              let n = data.messages.length;
              while ((--n) > -1) {
                const logData = data.messages[n];
                // Only store if it has the required fields
                if (logData.type && logData.data !== undefined) {
                  prependLog(logData);
                }
              }
            }
          } else {
            // Log other message types but don't store them
            console.log('Non-log message received:', data.type);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          setConnectionError('Failed to parse WebSocket message');
        }
      });

      // Connection closed
      socket.addEventListener('close', () => {
        setConnected(false);
        isConnecting = false;
        
        // Attempt to reconnect if under max attempts, not a normal closure, and connection lasted at least 1 second
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts += 1;
          reconnectTimeout = setTimeout(() => {
            setConnectionError(`WebSocket connection closed. Attempting to reconnect (${reconnectAttempts}). Close this page if you're done.. Good job!`);
            connect();
          }, reconnectDelay);
        }
      });
      
      // Handle errors
      socket.addEventListener('error', () => {
        setConnectionError('WebSocket error occurred');
        isConnecting = false;
        console.error('WebSocket error occurred');
      });
    };

    connect();

    // Clean up on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, addLog, prependLog, setConnected, setConnectionError, setLogTypes]);

  return { requestHistory };
}

export default useWebSocket;
