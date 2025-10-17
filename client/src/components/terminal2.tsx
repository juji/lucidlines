import { useCallback, useEffect, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useShallow } from 'zustand/react/shallow';
import { useTerminalStore, type LogMessage } from '../store/terminal-store';

type RowData = Array<{
  html: string;
  lineCount: number;
}>;

interface TerminalProps {
  logType: string;
  log?: boolean;
  title: string;
  onClose?: () => void;
  requestHistory?: (logType: string, lastTimestamp?: number) => void;
}

const Terminal: React.FC<TerminalProps> = ({ logType, log, title, onClose, requestHistory }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [viewportHeight, setViewportHeight] = useState(300);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const requestingHistoryRef = useRef(false);
  // Search temporarily disabled — keep the state commented out while hiding the UI
  // const [searchTerm, setSearchTerm] = useState('');

  const logs = useTerminalStore(
    useShallow(state => state.logs[logType] || [])
  );

  const setRetainHistory = useTerminalStore(
    useShallow(state => state.setRetainHistory)
  );

  // don't change!
  if (log) {
    /* no-op: reserved for devtools hook */
  }

  const [items, setItems] = useState<RowData>([]);
  // const [visibleRange, setVisibleRange] = useState<{ startIndex: number; endIndex: number }>({ startIndex: 0, endIndex: 0 });

  const forceScrollToBottom = useCallback(() => {
    if (isAutoScrollEnabled) {
      virtuosoRef.current?.scrollToIndex(items.length - 1);
    }
  }, [isAutoScrollEnabled, items.length]);

  useEffect(() => {
    setRetainHistory(logType, !isAutoScrollEnabled);
  },[isAutoScrollEnabled])

  // useEffect(() => {
  //   console.log(visibleRange, items.length - 1)
  // },[ visibleRange ]);

  // new data arrived
  useEffect(() => {
    if(requestingHistoryRef.current && logs.length > 0) {
      requestingHistoryRef.current = false;
    }

    if (!logs.length) {
      setItems([]);
      return;
    }

    const parser = new AnsiUp();
    parser.use_classes = true;

    // Search is disabled for now — show all logs
    const filteredLogs = logs;

    // setting items to virtual scroller
    setItems(filteredLogs.map((entry: LogMessage) => {
      const raw = (entry.data ?? '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = raw.split('\n');
      const lineCount = Math.max(1, lines.length - (lines[lines.length - 1] === '' ? 1 : 0));
      const html = parser.ansi_to_html(raw);

      return {
        html: html === '' ? '&nbsp;' : html,
        lineCount,
      } satisfies RowData[number];
    }));

    forceScrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Request history function
  const requestHistoryLocal = () => {
    if (requestingHistoryRef.current || !requestHistory) return;
    requestingHistoryRef.current = true;
    
    const oldestLog = logs[0];
    if (oldestLog) {
      requestHistory(logType, oldestLog.timestamp);
    }
  };

  const itemContent = useCallback((index: number) => {
    const item = items[index];
    return (
      <div
        className="terminal-row"
        dangerouslySetInnerHTML={{ __html: item?.html ?? '&nbsp;' }}
      />
    );
  }, [items]);

  // Resize handling
  // this one makes the terminal responsive
  // and also triggers auto-scroll if enabled
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      setViewportHeight(Math.max(1, node.clientHeight));
      forceScrollToBottom();
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
  }, [forceScrollToBottom]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>{title}</h3>
        <div className="terminal-controls">
          <button
            className="history-button"
            onClick={requestHistoryLocal}
            title="Load older logs"
          >
            history
          </button>
          <button
            className={`auto-scroll-button ${isAutoScrollEnabled ? 'active' : ''}`}
            onClick={() => {
              setIsAutoScrollEnabled(!isAutoScrollEnabled);
            }}
            title={isAutoScrollEnabled ? 'Auto-scroll enabled' : 'Click to enable auto-scroll'}
          >
            ↓
          </button>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>
      {/* Search input disabled for now */}
      {/*
      <div className="terminal-search">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      */}
      <div ref={containerRef} className="terminal-viewer">
        {items.length === 0 ? (
          <div className="terminal-empty">Waiting for output…</div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={items}
            itemContent={itemContent}
            height={viewportHeight}
            overscan={5}
            // rangeChanged={setVisibleRange}
            className="terminal-list scroll-container"
          />
        )}
      </div>
    </div>
  );
};

export default Terminal;