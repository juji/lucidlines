```typescript
interface StartResult {
  server?: Server;           // HTTP server instance
  nodeStream: NodeStream;    // Process manager
  databank: DataBank;        // Data storage and retrieval system, you might not need this
  lucidEvent: LucidEvent;    // Event emitter for process lifecycle events
  stop: () => Promise<void>; // Cleanup function
}
```