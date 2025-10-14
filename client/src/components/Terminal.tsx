import { useEffect, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useShallow } from 'zustand/react/shallow';
import { useTerminalStore } from '../store/terminalStore';

type RowData = Array<{
  html: string;
  lineCount: number;
}>;

interface TerminalProps {
  logType: string;
  log?: boolean;
  title: string;
  onClose?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logType, log, title, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(300);
  const isResizingRef = useRef(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

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

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 5,
  });

  const prevItemsLengthRef = useRef(items.length);
  useEffect(() => {
    if (items.length > prevItemsLengthRef.current && isAutoScrollEnabled) {
      requestAnimationFrame(() => {
        virtualizer.scrollToOffset(virtualizer.getTotalSize() + 9999); // because why not
      });
    }
    prevItemsLengthRef.current = items.length;
  }, [items.length, virtualizer, isAutoScrollEnabled]);

  const handleScroll = () => {
    if (!scrollRef.current || isResizingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    setIsAutoScrollEnabled(isAtBottom);
  };

  

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>{title}</h3>
        <div className="terminal-controls">
          <button
            className={`auto-scroll-button ${isAutoScrollEnabled ? 'active' : ''}`}
            onClick={() => {
              setIsAutoScrollEnabled(true);
              requestAnimationFrame(() => {
                virtualizer.scrollToOffset(virtualizer.getTotalSize());
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
            className="terminal-list"
            style={{
              height: viewportHeight,
              overflow: 'auto',
            }}
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