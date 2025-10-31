# NodeStream API

Process management and control for running multiple commands.

```typescript
import { start } from 'lucidlines';

const { nodeStream } = start({
  commands: [
    { name: 'web', command: 'npm run dev' },
    { name: 'api', command: 'npm run server' },
    { name: 'worker', command: 'npm run worker' }
  ]
});

// Restart a specific process by index
await nodeStream.restartProcess(0); // Restart web server

// Restart all processes
await nodeStream.restartAll();

// Stop all processes
await nodeStream.stop();
```

## `restartProcess(index)`

Restarts a specific process by index.

#### Parameters

- `index` (number) - Zero-based index of the process to restart

#### Returns

- `Promise<void>` - Resolves when the process has been restarted

## `restartAll()`

Restarts all processes.

#### Returns

- `Promise<void[]>` - Array of promises that resolve when all processes have been restarted

## `stop()`

Stops all processes.

#### Returns

- `Promise<void>` - Resolves when all processes have been stopped

## Types

### ProcessInfo

```typescript
interface ProcessInfo {
  name: string;
  command: string;
  process: ChildProcess;
  kill: () => void;
  restart: () => Promise<void>;
}
```