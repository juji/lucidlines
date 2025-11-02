```typescript
import { start } from 'lucidlines';

const { lucidEvent, stop, server, nodeStream, databank } = start({
  commands: [
    { name: 'web', command: 'npm run dev' },
    { name: 'api', command: 'npm run server' }
  ],

  // nullable, the server won't start if this is falsy
  // if that is the case,
  // you can listen to events using databank.subscribe
  serverPort: 3000,

});

// Listen to process lifecycle events
lucidEvent.on('start', (data) => {
  console.log(`[${data.index}] ${data.name} started`);
  // example: [0] web started
});

lucidEvent.on('kill', (data) => {
  console.log(`[${data.index}] ${data.name} killed`);
});

lucidEvent.on('forcekill', (data) => {
  console.log(`[${data.index}] ${data.name} force killed`);
});

// Handle graceful shutdown
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGHUP', () => handleShutdown('SIGHUP'));
process.on('SIGQUIT', () => handleShutdown('SIGQUIT'));

async function handleShutdown(signal?: string) {
  try {
    await stop();
    process.exit(0);
  } catch (error) {
    console.error(
      `Error during shutdown${signal ? ` (${signal})` : ""}:`,
      error,
    );
    process.exit(1);
  }
}
```