// import { useState, useEffect } from 'react'
import './app.css'
import Terminal from './components/terminal'
import useWebSocket from './hooks/use-web-socket'
import { useTerminalStore } from './store/terminal-store'
// import { useShallow } from 'zustand/react/shallow'
import HeaderControls from './components/header-controls'


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

  // Initialize WebSocket connection
  const { requestHistory } = useWebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`);

  return (
  <main className={Object.values(activeTerminals).filter(Boolean).length > 1 ? 'multi-terminal' : ''}>
    {logTypes.map((type) => (
      activeTerminals[type] && (
        <Terminal
          key={type.toLowerCase()}
          logType={type}
          // log={type === 'REACT'}
          title={type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
          onClose={() => setActiveTerminal(type, false)}
          requestHistory={requestHistory}
        />
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
