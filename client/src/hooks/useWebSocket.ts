import { useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/terminalStore';

/**
 * A hook that connects to WebSocket and stores data to Zustand
 */
export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  
  // Get actions from the terminal store
  const { addLog, prependLog, setConnected, setConnectionError } = useTerminalStore();

  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket(url);
    socketRef.current = socket;

    // Connection opened
    socket.addEventListener('open', () => {
      setConnected(true);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        
        // Handle different message types
        if (data.type === 'log' && data.message) {
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
    });
    
    // Handle errors
    socket.addEventListener('error', () => {
      setConnectionError('WebSocket error occurred');
    });

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, [url]);

  // Only need to return the send function
  const send = (data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return { send };
}

export default useWebSocket;
