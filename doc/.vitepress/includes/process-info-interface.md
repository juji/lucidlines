```typescript
interface ProcessInfo {
  name: string;
  command: string;
  process: ChildProcess;
  kill: () => void;
  restart: () => Promise<void>;
}
```