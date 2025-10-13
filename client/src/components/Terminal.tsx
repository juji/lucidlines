import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  websocketUrl?: string;
  defaultText?: string;
  dataType?: string;
  showAllData?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ 
  websocketUrl = 'ws://localhost:3000', 
  defaultText = 'Terminal initialized...\r\n',
  dataType = '',
  showAllData = false
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<XTerm | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    // Initialize terminal
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      convertEol: true, // Convert '\n' to '\r\n'
      fontFamily: 'monospace',
      fontSize: 14,
      lineHeight: 1.2, // Increase line height for better readability
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff', // Brighter white text for better contrast
        brightWhite: '#ffffff', // Make sure bright white is also fully bright
        // Increase brightness for all ANSI colors
        black: '#000000',
        red: '#ff5555',
        green: '#55ff55',
        yellow: '#ffff55',
        blue: '#5555ff',
        magenta: '#ff55ff',
        cyan: '#55ffff',
        white: '#f0f0f0',
        brightBlack: '#555555',
        brightRed: '#ff8888',
        brightGreen: '#88ff88',
        brightYellow: '#ffff88',
        brightBlue: '#8888ff',
        brightMagenta: '#ff88ff',
        brightCyan: '#88ffff',
      },
      allowTransparency: false, // Disable transparency for better text rendering
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);
    setTerminal(term);

    // Write default text
    // Ensure default text ends with proper line termination
    term.write(defaultText.endsWith('\r\n') ? defaultText : defaultText + '\r\n');

    // Connect to WebSocket
    const ws = new WebSocket(websocketUrl);
    
    ws.onopen = () => {
      term.write('WebSocket connected\r\n');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Filter messages by data type if specified
        if (dataType && data.name && data.name !== dataType && !showAllData) {
          return; // Skip messages not matching our dataType
        }
        
        // Handle different message types
        if (data.type === 'terminal' && data.content) {
          // Ensure terminal content gets proper line termination
          const content = data.content.toString();
          term.write(content.endsWith('\r\n') ? content : content + '\r\n');
        } else if (data.type === 'connection') {
          term.write(`Connected: ${data.message}\r\n`);
        } else if (data.type === 'history') {
          if (Array.isArray(data.messages)) {
            data.messages.forEach((msg: any) => {
              // Filter history messages by data type if specified
              if (dataType && msg.type && msg.type !== dataType && !showAllData) {
                return;
              }
              if (msg.data) {
                // Ensure each history message gets a carriage return and line feed
                term.write(msg.data + '\r\n');
              }
            });
          }
        } else if (data.data) {
          // Handle normal data messages from the databank
          // Force a carriage return and line feed after each write
          term.write(data.data + '\r\n');
        } else {
          // For other types of JSON data, display as string
          term.write(JSON.stringify(data) + '\r\n');
        }
      } catch (e) {
        // If not JSON, write directly
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      term.write('\r\nWebSocket connection closed\r\n');
    };

    ws.onerror = (error) => {
      term.write(`\r\nWebSocket error: ${error}\r\n`);
    };

    setSocket(ws);

    // Fit the terminal to its container
    fitAddon.fit();

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [websocketUrl, defaultText]);

  // Call fit on terminal resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit();
        }, 0);
      }
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }
    
    return () => {
      if (terminalRef.current) {
        resizeObserver.unobserve(terminalRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '300px',
        position: 'relative',
      }}
    />
  );
};

export default Terminal;