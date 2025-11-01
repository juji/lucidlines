
import './app.css'
import Terminal from './components/terminal'
import useWebSocket from './hooks/use-web-socket'
import { useTerminalStore } from './store/terminal-store'
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

  const activeTerminals = useTerminalStore(state => state.activeTerminals);
  const setActiveTerminal = useTerminalStore(state => state.setActiveTerminal);

  // Local state for terminal ordering
  const terminalOrderRef = useRef<string[]>(activeTerminals ? Object.keys(activeTerminals).filter(type => activeTerminals[type]) : []);
  const [ terminalOrder, setTerminalOrder ] = useState<string[]>(activeTerminals ? Object.keys(activeTerminals).filter(type => activeTerminals[type]) : []);

  // Initialize WebSocket connection
  const { requestHistory } = useWebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`);

  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);

  useEffect(() => {

    // const current Terminal
    const currentTerminal = Object.keys(activeTerminals).filter(type => activeTerminals[type]);

    // Find non-existing log types
    const newTypes = currentTerminal.filter(type => !terminalOrderRef.current.includes(type));

    // remove non existing from terminal order
    const filteredTerminalOrderRef = terminalOrderRef.current.filter(type => currentTerminal.includes(type));

    // this is the order
    const termOrder = [...filteredTerminalOrderRef, ...newTypes];
    terminalOrderRef.current = termOrder;
    setTerminalOrder(termOrder);

  }, [ activeTerminals ]);

  useEffect(() => {

    const activeCount = Object.values(activeTerminals).filter(Boolean).length;
    if (activeCount > 1 && containerRef.current) {

      try{

        swapyRef.current = createSwapy(containerRef.current, {
          animation: 'dynamic'
        });
        
        swapyRef.current.onSwapEnd((event: any) => {
          if(!event.hasChanged) return;
          const newOrder = event.slotItemMap.asArray.map((slotItem: any) => slotItem.item);
          terminalOrderRef.current = newOrder;

          // let animation run first
          setTimeout(() => {
            setTerminalOrder(newOrder);
          }, 333);
        });

      }catch(e){
        console.error('Error initializing Swapy:', e);
      }

    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, [terminalOrder]);

  return (
  <main
    key={JSON.stringify(terminalOrder)}
    ref={containerRef}
    className={`${Object.values(activeTerminals).filter(Boolean).length > 1 ? 'multi-terminal' : ''} ${terminalOrder.length % 2 === 1 ? 'odd-terminals' : ''}`}
  >
    {terminalOrder.map((type) => (
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
