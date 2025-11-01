// import { useState, useEffect } from 'react'
import './app.css'
import Terminal from './components/terminal'
import useWebSocket from './hooks/use-web-socket'
import { useTerminalStore } from './store/terminal-store'
// import { useShallow } from 'zustand/react/shallow'
import HeaderControls from './components/header-controls'
import { createSwapy } from 'swapy'
import { useEffect, useRef, useState } from 'react'


const ConnectionError = () => {

  const connectionError = useTerminalStore(state => state.connectionError);

  if(!connectionError){
    return null;
  }

  return (
    <div className="connection-error">
      {connectionError}
    </div>
  )

}

const ActiveTerminals = () => {

  const logTypes = useTerminalStore(state => state.logTypes);
  const activeTerminals = useTerminalStore(state => state.activeTerminals);
  const setActiveTerminal = useTerminalStore(state => state.setActiveTerminal);

  // Local state for terminal ordering
  const [terminalOrder, setTerminalOrder] = useState<string[]>([]);

  // Initialize WebSocket connection
  const { requestHistory } = useWebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`);

  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);
  const logTypesRef = useRef(logTypes);

  // Initialize terminal order when logTypes change
  useEffect(() => {
    const nonExistingTypes = logTypes.filter(type => !terminalOrder.includes(type));
    if (nonExistingTypes.length > 0) {
      const newOrder = [...terminalOrder, ...nonExistingTypes];
      setTerminalOrder(newOrder);
      logTypesRef.current = newOrder;
    }
  }, [logTypes]);

  useEffect(() => {
    const activeCount = Object.values(activeTerminals).filter(Boolean).length;
    if (activeCount > 1 && containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: 'dynamic'
      });

      swapyRef.current.onSwap((event: any) => {
        const newOrder = event.newSlotItemMap.asArray.map((slotItem: any) => slotItem.item);
        const reorderedTypes = newOrder
          .map((itemId: string) => logTypesRef.current.find(type => type.toLowerCase() === itemId))
          .filter(Boolean) as string[];
        
        setTerminalOrder(reorderedTypes);
      });
    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [activeTerminals]);

  // Use terminalOrder for rendering, fallback to logTypes
  const displayOrder = terminalOrder.length > 0 ? terminalOrder : logTypes;

  return (
  <main 
    ref={containerRef}
    className={Object.values(activeTerminals).filter(Boolean).length > 1 ? 'multi-terminal' : ''}
  >
    {displayOrder.map((type) => (
      activeTerminals[type] && (
        <div key={type.toLowerCase()} data-swapy-slot={`${type}`}>
          <div className="terminal-wrapper" data-swapy-item={type}>
            <Terminal
              logType={type}
              // log={type === 'REACT'}
              title={type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
              onClose={() => setActiveTerminal(type, false)}
              requestHistory={requestHistory}
            />
          </div>
        </div>
      )
    ))}
  </main>
  )
  
}

const Buttons = () => {

  const logTypes = useTerminalStore(state => state.logTypes);
  const activeTerminals = useTerminalStore(state => state.activeTerminals);
  const setActiveTerminal = useTerminalStore(state => state.setActiveTerminal);

  return (
    <div className="tabs">
      {logTypes.map(type => (
        <button 
          key={type.toLowerCase()}
          className={activeTerminals[type] ? 'active' : ''}
          onClick={() => setActiveTerminal(type, !activeTerminals[type])}
        >
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
const App = function App() {
  // // Get log types from the store using useShallow

  return (
    <div className="app-container">
      <header className="app-header">
        <Buttons />
        <HeaderControls />
      </header>
      <ActiveTerminals />
      <ConnectionError />
    </div>
  )
};

// Export the memoized component
export default App
