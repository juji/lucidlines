import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useTerminalStore } from '../store/terminalStore';
import { useShallow } from 'zustand/react/shallow';

interface TerminalProps {
  defaultText?: string;
  logType: string;
}

const Terminal: React.FC<TerminalProps> = ({ 
  defaultText = 'Terminal initialized...\r\n',
  logType,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const processedMessages = useRef<Set<string>>(new Set());
  
  // Get logs from the Zustand store based on logType with useShallow for efficient updates
  const logs = useTerminalStore(
    useShallow(state => state.logs[logType] || [])
  );

  // Initialize terminal
  useEffect(() => {
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
    terminalInstance.current = term;

    term.open(terminalRef.current);

    // Write default text
    // Ensure default text ends with proper line termination
    term.write(defaultText.endsWith('\r\n') ? defaultText : defaultText + '\r\n');

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
      term.dispose();
    };
  }, [defaultText]);
  
  // Process logs from Zustand store and display in terminal
  useEffect(() => {
    if (!terminalInstance.current || !logs.length) return;
    
    // Get only the new logs we haven't processed yet
    const newLogs = logs.filter(log => {
      const logId = `${log.type}_${log.timestamp || Date.now()}_${JSON.stringify(log)}`;
      return !processedMessages.current.has(logId);
    });
    
    // Process only new logs
    newLogs.forEach(log => {
      // Create a unique ID for this log to avoid duplicates
      const logId = `${log.type}_${log.timestamp || Date.now()}_${JSON.stringify(log)}`;
      processedMessages.current.add(logId);
      
      // The log data structure is simple: { type, data, timestamp }
      // Just write the data to the terminal
      if (log.data) {
        const content = log.data.toString();
        terminalInstance.current?.write(content.endsWith('\r\n') ? content : content + '\r\n');
      } else {
        // Fallback: For any unexpected format, display as string
        terminalInstance.current?.write(JSON.stringify(log) + '\r\n');
      }
    });
  }, [logs]); // useShallow ensures this only runs when actual log content changes

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