```typescript
import { start } from 'lucidlines';

const { nodeStream } = start({
  commands: [
    { name: 'web', command: 'npm run dev' },
    { name: 'api', command: 'npm run server' },
    { name: 'worker', command: 'npm run worker' }
  ]
  serverPort: 8080
});

// Restart a specific process by index
await nodeStream.restartProcess(0); // Restart web server

// Restart all processes
await nodeStream.restartAll();

// Stop all processes
await nodeStream.stop();
```