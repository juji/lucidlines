```typescript
interface StartOptions {
  serverPort?: number;        // Server port
  frontEnd?: string | number; // Frontend path or port
  commands?: Array<{          // Commands to run
    command: string;
    name: string;
  }>;
  dev?: boolean;              // Development mode
}
```