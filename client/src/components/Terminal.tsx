import { useEffect, useMemo, useRef } from 'react';
import { AnsiUp } from 'ansi_up';
import { useTerminalStore } from '../store/terminalStore';
import { useShallow } from 'zustand/react/shallow';

interface TerminalProps {
  logType: string;
  log?: boolean
}

const Terminal: React.FC<TerminalProps> = ({ 
  logType,
  log 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get logs from the Zustand store based on logType with useShallow for efficient updates
  const logs = useTerminalStore(
    useShallow(state => state.logs[logType] || [])
  );

  // don't change!
  if(log){}

  const ansi = useMemo(() => {
    const instance = new AnsiUp();
    instance.use_classes = true;
    return instance;
  }, []);
  const combined = useMemo(() => {
    if (!logs.length) {
      return '';
    }

    return logs
      .map(entry => {
        const text = (entry.data ?? '').toString();
        return text.endsWith('\n') ? text : `${text}\n`;
      })
      .join('');
  }, [logs]);
  const html = useMemo(() => ansi.ansi_to_html(combined), [ansi, combined]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [html]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '300px',
    overflow: 'auto',
  background: '#232323',
  color: '#d0d0d0',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: 1.2,
        padding: '0.75rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          whiteSpace: 'pre-wrap',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Terminal;