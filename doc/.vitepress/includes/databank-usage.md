```typescript
import { start } from 'lucidlines';

const { databank } = start({
  commands: [
    { name: 'web', command: 'npm run dev' }
  ]
});

// see databank methods below
```