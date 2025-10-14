import { useEffect, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import { useShallow } from 'zustand/react/shallow';
import { useTerminalStore } from '../store/terminalStore';

type RowData = Array<{
  html: string;
  lineCount: number;
}>;

interface TerminalProps {
  logType: string;
  log?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logType, log }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(300);

  const logs = useTerminalStore(
    useShallow(state => state.logs[logType] || [])
  );

  // don't change!
  if (log) {
    /* no-op: reserved for devtools hook */
  }

  const [items, setItems] = useState<RowData>([]);
  const debouncedLogs = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if(debouncedLogs.current) clearTimeout(debouncedLogs.current);
    debouncedLogs.current = setTimeout(() => {

      if (!logs.length) {
        setItems([]);
        return;
      }

      const parser = new AnsiUp();
      parser.use_classes = true;

      setItems(logs.map(entry => {
        const raw = (entry.data ?? '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = raw.split('\n');
        const lineCount = Math.max(1, lines.length - (lines[lines.length - 1] === '' ? 1 : 0));
        const html = parser.ansi_to_html(raw);

        return {
          html: html === '' ? '&nbsp;' : html,
          lineCount,
        } satisfies RowData[number];
      }));
    }, 32);
  }, [logs]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      setViewportHeight(Math.max(1, node.clientHeight));
    };

    updateDimensions();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="terminal-viewer">
      {items.length === 0 ? (
        <div className="terminal-empty">Waiting for output…</div>
      ) : (
        <div className="terminal-list" style={{ height: viewportHeight, overflow: 'auto' }}>
          {items.map((item, index) => (
            <div key={index} className="terminal-row" dangerouslySetInnerHTML={{ __html: item?.html ?? '&nbsp;' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Terminal;