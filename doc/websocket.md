# WebSocket API

Detailed reference for the WebSocket communication protocol.

## Connection

### Endpoint

```
ws://localhost:8080/ws
```

The WebSocket path can be configured via the `wsPath` option.

### Connection Lifecycle

1. **Connect** - Client establishes WebSocket connection
2. **Handshake** - Server acknowledges connection
3. **Streaming** - Real-time data exchange
4. **Disconnect** - Connection closed

## Message Types

### Server to Client Messages

#### Process Output

Sent whenever a process produces output.

```json
{
  "type": "process",
  "name": "web-server",
  "output": "Server listening on port 3000\n",
  "timestamp": 1638360000000
}
```

#### Process Status

Sent when process status changes.

```json
{
  "type": "status",
  "name": "web-server",
  "status": "running",
  "pid": 12345,
  "timestamp": 1638360000000
}
```

#### Error Message

Sent when errors occur.

```json
{
  "type": "error",
  "message": "Failed to start process",
  "process": "web-server",
  "timestamp": 1638360000000
}
```

#### Server Info

Sent on initial connection.

```json
{
  "type": "info",
  "version": "1.0.0",
  "processes": [
    {
      "name": "web-server",
      "status": "running",
      "command": "npm run dev"
    }
  ],
  "timestamp": 1638360000000
}
```

### Client to Server Messages

#### Ping/Pong

Standard WebSocket ping/pong for connection health.

#### Command Messages

```json
{
  "type": "command",
  "action": "restart",
  "target": "web-server"
}
```

```json
{
  "type": "command",
  "action": "restart-all"
}
```

## Message Format

### Common Fields

All messages include:

- `type` (string) - Message type identifier
- `timestamp` (number) - Unix timestamp in milliseconds

### Data Types

- **output** (string) - Terminal output, may contain ANSI escape codes
- **status** (string) - Process status: "running", "stopped", "error", "starting"
- **pid** (number) - Process ID when running
- **name** (string) - Process name identifier

## Client Implementation

### JavaScript Example

```javascript
class LucidLinesClient {
  constructor(url = 'ws://localhost:8080/ws') {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Connected to LucidLines');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from LucidLines');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'process':
        this.onProcessOutput(message.name, message.output);
        break;
      case 'status':
        this.onProcessStatus(message.name, message.status);
        break;
      case 'error':
        this.onError(message.message, message.process);
        break;
      case 'info':
        this.onServerInfo(message);
        break;
    }
  }

  // Override these methods in subclasses
  onProcessOutput(name, output) {
    console.log(`${name}: ${output}`);
  }

  onProcessStatus(name, status) {
    console.log(`${name} is ${status}`);
  }

  onError(message, process) {
    console.error(`Error in ${process}: ${message}`);
  }

  onServerInfo(info) {
    console.log('Connected to LucidLines', info.version);
  }

  restartProcess(name) {
    this.send({
      type: 'command',
      action: 'restart',
      target: name
    });
  }

  restartAll() {
    this.send({
      type: 'command',
      action: 'restart-all'
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  close() {
    this.ws.close();
  }
}
```

### React Hook Example

```javascript
import { useEffect, useRef, useState } from 'react';

export function useLucidLines(url = 'ws://localhost:8080/ws') {
  const [processes, setProcesses] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'info') {
        setProcesses(message.processes);
      } else if (message.type === 'status') {
        setProcesses(prev =>
          prev.map(proc =>
            proc.name === message.name
              ? { ...proc, status: message.status }
              : proc
          )
        );
      }
    };

    return () => ws.close();
  }, [url]);

  const restartProcess = (name) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        action: 'restart',
        target: name
      }));
    }
  };

  const restartAll = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        action: 'restart-all'
      }));
    }
  };

  return { processes, connected, restartProcess, restartAll };
}
```

## Error Handling

### Connection Errors

- Handle WebSocket connection failures
- Implement reconnection logic
- Show appropriate user feedback

### Message Errors

- Validate incoming message format
- Handle unknown message types gracefully
- Log errors for debugging

## Best Practices

### Connection Management

- Implement exponential backoff for reconnection
- Handle network interruptions gracefully
- Clean up resources on component unmount

### Performance

- Limit message processing in high-frequency scenarios
- Use efficient data structures for process state
- Debounce rapid status updates

### Security

- Validate WebSocket origins in production
- Use secure WebSocket connections (WSS) when possible
- Sanitize process output before rendering