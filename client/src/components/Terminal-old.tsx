import { useCallback, useEffect, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(300);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const requestingHistoryRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const forceScrollToBottom = useCallback(() => {

    if (isAutoScrollEnabled) {
      setRetainHistory(logType, false);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }else{
      setRetainHistory(logType, true);
    }

  },[ isAutoScrollEnabled ])

  const [items, setItems] = useState<RowData>([]);

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

    // Filter logs based on search term
    const filteredLogs = searchTerm
      ? logs.filter((log: LogMessage) => log.data.toLowerCase().includes(searchTerm.toLowerCase()))
      : logs;

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
  }, [logs, searchTerm]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 5,
  });

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

  // Request history function
  const requestHistoryLocal = () => {
    if (requestingHistoryRef.current || !requestHistory) return;
    requestingHistoryRef.current = true;
    
    const oldestLog = logs[0];
    if (oldestLog) {
      requestHistory(logType, oldestLog.timestamp);
    }
  };

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
      <div className="terminal-search">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div ref={containerRef} className="terminal-viewer">
        {items.length === 0 ? (
          <div className="terminal-empty">Waiting for output…</div>
        ) : (
          <div
            ref={scrollRef}
            className="terminal-list scroll-container"
            style={{ height: viewportHeight }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = items[virtualItem.index];
                return (
                  <div
                    key={virtualItem.index}
                    ref={virtualizer.measureElement}
                    data-index={virtualItem.index}
                    className="terminal-row"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: item?.html ?? '&nbsp;' }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;