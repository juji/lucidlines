import { useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'

function App() {
  const [activeTab, setActiveTab] = useState('terminal');

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
              websocketUrl="ws://localhost:8080/ws" 
              showAllData={true}
              defaultText="Terminal initialized. Showing all data streams...\r\n" 
            />
          </div>
        )}
        {activeTab === 'weather' && (
          <div className="terminal-container">
            <Terminal 
              websocketUrl="ws://localhost:8080/ws" 
              dataType="WEATHER"
              defaultText="Connecting to weather data...\r\n" 
            />
          </div>
        )}
        {activeTab === 'stocks' && (
          <div className="terminal-container">
            <Terminal 
              websocketUrl="ws://localhost:8080/ws" 
              dataType="STOCKS"
              defaultText="Connecting to stock data...\r\n" 
            />
          </div>
        )}
        {activeTab === 'logs' && (
          <div className="terminal-container">
            <Terminal 
              websocketUrl="ws://localhost:8080/ws" 
              dataType="SERVER"
              defaultText="Connecting to server logs...\r\n" 
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
