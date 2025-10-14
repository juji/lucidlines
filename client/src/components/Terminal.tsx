import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnsiUp } from 'ansi_up';
import {
  VariableSizeList as List,
  type ListChildComponentProps,
  type VariableSizeList as VariableSizeListType,
} from 'react-window';
import { useShallow } from 'zustand/react/shallow';
import { useTerminalStore } from '../store/terminalStore';
import { useUIStore } from '../store/uiStore';

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
  const listRef = useRef<VariableSizeListType<RowData>>(null);
  const [viewportHeight, setViewportHeight] = useState(300);
  const fontSize = useUIStore(state => state.fontSize);
  const rowHeight = useMemo(() => Math.max(12, Math.ceil(fontSize * 1.2)), [fontSize]);

  const logs = useTerminalStore(
    useShallow(state => state.logs[logType] || [])
  );

  // don't change!
  if (log) {}

  const items = useMemo(() => {
    if (!logs.length) {
      return [] as RowData;
    }

    const parser = new AnsiUp();
    parser.use_classes = true;

    return logs.map(entry => {
      const raw = (entry.data ?? '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const normalized = raw.endsWith('\n') ? raw : `${raw}\n`;
      const html = parser.ansi_to_html(normalized);
      const lineCount = Math.max(1, normalized.split('\n').length);

      return {
        html: html === '' ? '&nbsp;' : html,
        lineCount,
      } satisfies RowData[number];
    });
  }, [logs]);

  const getItemSize = useCallback(
    (index: number) => {
      const item = items[index];
      const lines = item?.lineCount ?? 1;
      return lines * rowHeight;
    },
    [items, rowHeight]
  );

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

  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [items, rowHeight]);

  useEffect(() => {
    if (!listRef.current || items.length === 0) return;
    listRef.current.scrollToItem(items.length - 1, 'end');
  }, [items.length, viewportHeight]);

  const Row = useCallback(
    ({ index, style, data }: ListChildComponentProps<RowData>) => {
      const item = data[index];
      return (
        <div
          style={style}
          className="terminal-row"
          dangerouslySetInnerHTML={{ __html: item?.html ?? '&nbsp;' }}
        />
      );
    },
    []
  );

  const InnerElement = useMemo(
    () =>
      forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        ({ style, className, ...rest }, ref) => (
          <div
            ref={ref}
            className={className ? `terminal-list-inner ${className}` : 'terminal-list-inner'}
            style={{
              ...style,
              padding: '0.75rem',
              boxSizing: 'border-box',
            }}
            {...rest}
          />
        )
      ),
    []
  );

  return (
    <div ref={containerRef} className="terminal-viewer">
      {items.length === 0 ? (
        <div className="terminal-empty">Waiting for output…</div>
      ) : (
        <List
          ref={listRef}
          className="terminal-list"
          height={Math.max(1, viewportHeight)}
          itemCount={items.length}
          itemData={items}
          itemSize={getItemSize}
          estimatedItemSize={rowHeight}
          width="100%"
          innerElementType={InnerElement}
        >
          {Row}
        </List>
      )}
    </div>
  );
};

export default Terminal;