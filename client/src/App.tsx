import { useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'
import useWebSocket from './hooks/useWebSocket'

function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  
  // Initialize WebSocket connection using the hook
  // It will connect to WebSocket and update the Zustand store
  useWebSocket('ws://localhost:8080/ws');

  return (
    <div className="app-container">
      <header>
        <h1>LucidLines Terminal</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'terminal' ? 'active' : ''}
            onClick={() => setActiveTab('terminal')}
          >
            Terminal
          </button>
          <button 
            className={activeTab === 'weather' ? 'active' : ''}
            onClick={() => setActiveTab('weather')}
          >
            Weather
          </button>
          <button 
            className={activeTab === 'stocks' ? 'active' : ''}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
          <button 
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </div>
      </header>
      <main>
        {activeTab === 'terminal' && (
          <div className="terminal-container">
            <Terminal 
              logType="STOCKS"
              defaultText="Terminal initialized. Showing all data streams...\r\n" 
            />
          </div>
        )}
        {activeTab === 'weather' && (
          <div className="terminal-container">
            {/* <Terminal 
              logType="weather"
              defaultText="Connecting to weather data...\r\n" 
            /> */}
          </div>
        )}
        {activeTab === 'stocks' && (
          <div className="terminal-container">
            {/* <Terminal 
              logType="stocks"
              defaultText="Connecting to stock data...\r\n" 
            /> */}
          </div>
        )}
        {activeTab === 'logs' && (
          <div className="terminal-container">
            {/* <Terminal 
              logType="server"
              defaultText="Connecting to server logs...\r\n" 
            /> */}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
