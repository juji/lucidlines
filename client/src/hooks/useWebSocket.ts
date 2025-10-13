import { useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/terminalStore';

/**
 * A hook that connects to WebSocket and stores data to Zustand
 */
export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  
  // Don't destructure store actions to avoid dependency issues
  // Instead, we'll access them directly via getState() in the effect

  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket(url);
    socketRef.current = socket;
    
    // Get store actions via getState to prevent stale closures and dependencies
    const getStoreActions = () => useTerminalStore.getState();

    // Connection opened
    socket.addEventListener('open', () => {
      getStoreActions().setConnected(true);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Only store messages with type 'log' in Zustand
        if (data.type === 'log' && data.messages) {
          // The actual log data is in the messages field
          const logData = data.messages;
          
          // Only store if it has the required fields
          if (logData.type && logData.data !== undefined) {
            // Add to store directly using getState to get fresh reference
            getStoreActions().addLog(logData);
          }
        } else {
          // Log other message types but don't store them
          console.log('Non-log message received:', data.type);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
        getStoreActions().setConnectionError('Failed to parse WebSocket message');
      }
    });

    // Connection closed
    socket.addEventListener('close', () => {
      getStoreActions().setConnected(false);
    });
    
    // Handle errors
    socket.addEventListener('error', () => {
      getStoreActions().setConnectionError('WebSocket error occurred');
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
