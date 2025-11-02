```typescript
interface LogEntry {
  type: string;      // Process name (e.g., "web-server")
  data: string;      // Output line
  timestamp: number; // Unix timestamp
}
```