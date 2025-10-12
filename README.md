# LucidLines

```
!! On active development
```

A CLI utility that pipes the outputs of your paralel tasks to a browser, for better viewing.

> concurently, with browser output.

```bash
npm i -D lucidlines
```

## Initialize

```bash
npx lucidlines init
```

Will create initial config file .lucidlines.json5

```
[
  {
    name: "process 1",
    cmd: "echo 'this is what i need'"
  },
  {
    name: "frontend",
    cmd: "npm run dev",
    workDir: "./frontend"
  },
  {
    name: "backend",
    cmd: "npm run dev",
    workDir: "./backend"
  }
]
```

## Run

```bash
npx lucidlines
```

## Using the WebSocket Server Directly

LucidLines includes a standalone WebSocket server that can be used for real-time communication between your applications.

### From the command line

```bash
# Development mode: proxies HTTP requests to a dev server
npx lucidlines server --dev --port=8080 --frontendPort=5173

# Production mode: serves static files from a directory
npx lucidlines server --port=8080 --dir=./client/dist
```

### In your code

```typescript
import { start } from 'lucidlines';

// Development mode
const server = start({
  port: 8080,
  frontendPort: 5173, // Vite's default port
});

// OR

// Production mode
const server = start({
  port: 8080,
  frontEndDir: './client/dist',
});

// Stop the server when done
// server.stop();
```

### WebSocket Client Example

```javascript
// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080/ws');

// Handle connection open
ws.onopen = () => {
  console.log('Connected to LucidLines server');
  
  // Send a message
  ws.send(JSON.stringify({
    type: 'chat',
    message: 'Hello from client'
  }));
};

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle connection close
ws.onclose = () => {
  console.log('Disconnected from LucidLines server');
};
```

## 