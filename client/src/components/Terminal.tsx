import { useEffect, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useShallow } from 'zustand/react/shallow';
import { useTerminalStore } from '../store/terminalStore';
import { useDebounce } from 'use-simple-debounce';

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
  const isResizingRef = useRef(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const requestingHistoryRef = useRef(false);

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
  const debouncedLogProcessing = useDebounce();


  // new data arrived
  useEffect(() => {
    if(requestingHistoryRef.current && logs.length > 0) {
      requestingHistoryRef.current = false;
    }

    // using debouncedLogProcessing, with a low delay
    // the log processing (setItems) is debounced (delayed)
    // and the delay causes the component to update only once
    debouncedLogProcessing(() => {
      if (!logs.length) {
        setItems([]);
        return;
      }

      const parser = new AnsiUp();
      parser.use_classes = true;

      // setting items to virtual scroller
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
    },32);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 5,
  });

  // auto scroll when new data arrives
  // but only when isAutoScrollEnabled is true
  // (which is set to false when user scrolls up)
  // also, use a ref to track previous items length
  // to avoid triggering on every render
  const prevItemsLengthRef = useRef(items.length);
  useEffect(() => {

    if (items.length > prevItemsLengthRef.current && isAutoScrollEnabled) {
      requestAnimationFrame(() => {
        virtualizer?.scrollToOffset(virtualizer?.getTotalSize() + 9999); // because why not
      });
    }
    prevItemsLengthRef.current = items.length;
  }, [items.length, virtualizer, isAutoScrollEnabled]);
  
  // Scroll handling
  // because we auto scrolls
  // it makes this handleScroll runs..
  // with debouncedAutoScroll, the auto-scroll-button turns off and on,
  // making it feel like its alive
  const debouncedAutoScroll = useDebounce();
  const handleScroll = () => {

    if (!scrollRef.current || isResizingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;
    
    // Disable auto-scroll immediately on scroll
    setIsAutoScrollEnabled(false);

    // Re-enable auto-scroll if scrolled back to bottom (with debouncing)
    debouncedAutoScroll(() => {
      if (isAtBottom) {
        setIsAutoScrollEnabled(true);
        setRetainHistory(logType, false); // Keep only recent logs
      } else {
        setRetainHistory(logType, true); // Keep all history
      }
    }, 300);
  };

  // Resize handling
  // this one makes the terminal responsive
  // and also triggers auto-scroll if enabled
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      isResizingRef.current = true;
      setViewportHeight(Math.max(1, node.clientHeight));
      if (isAutoScrollEnabled) {
        virtualizer?.scrollToOffset(virtualizer.getTotalSize() + 9999); // because why not
      }
      // Reset the flag after a longer delay to account for measurement
      setTimeout(() => {
        isResizingRef.current = false;
      }, 500);
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
  }, [isAutoScrollEnabled]);

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
              setIsAutoScrollEnabled(true);
              requestAnimationFrame(() => {
                virtualizer.scrollToOffset(virtualizer.getTotalSize() + 9999);
              });
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
      <div ref={containerRef} className="terminal-viewer">
        {items.length === 0 ? (
          <div className="terminal-empty">Waiting for output…</div>
        ) : (
          <div
            ref={scrollRef}
            className="terminal-list scroll-container"
            style={{ height: viewportHeight }}
            onScroll={handleScroll}
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