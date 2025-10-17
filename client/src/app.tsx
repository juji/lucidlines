import { useState, useEffect } from 'react'
import './app.css'
import Terminal from './components/terminal'
import useWebSocket from './hooks/use-web-socket'
import { useTerminalStore } from './store/terminal-store'
import { useShallow } from 'zustand/react/shallow'
import HeaderControls from './components/header-controls'

// Memoize the component to prevent unnecessary re-renders
const App = function App() {
  // Get log types from the store using useShallow
  const logTypes = useTerminalStore(
    useShallow(state => state.logTypes)
    // state => state.logTypes
  );
  
  // All terminals are active by default (can be toggled)
  const [activeTerminals, setActiveTerminals] = useState<Record<string, boolean>>({});
  
  // Initialize WebSocket connection
  const { requestHistory } = useWebSocket('ws://localhost:8080/ws');
  
  // Set all terminals to active by default when log types change
  useEffect(() => {
    setActiveTerminals(prev => {
      const newState = {...prev};
      logTypes.forEach(type => {
        if (newState[type.toLowerCase()] === undefined) {
          newState[type.toLowerCase()] = true;
        }
      });
      return newState;
    });
  }, [logTypes.join(',')]);
  
  // Toggle terminal visibility
  const toggleTerminal = (id: string) => {
    setActiveTerminals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="tabs">
          {logTypes.map(type => (
            <button 
              key={type.toLowerCase()}
              className={activeTerminals[type.toLowerCase()] ? 'active' : ''}
              onClick={() => toggleTerminal(type.toLowerCase())}
            >
              {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <HeaderControls />
      </header>
      <main className={Object.values(activeTerminals).filter(Boolean).length > 1 ? 'multi-terminal' : ''}>
        {logTypes.map((type) => (
          activeTerminals[type.toLowerCase()] && (
            <Terminal
              key={type.toLowerCase()}
              logType={type}
              log={type === 'REACT'}
              title={type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
              onClose={() => toggleTerminal(type.toLowerCase())}
              requestHistory={requestHistory}
            />
          )
        ))}
      </main>
    </div>
  )
};

// Export the memoized component
export default App
