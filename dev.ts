#!/usr/bin/env tsx

import concurrently from 'concurrently';

// Run client and server concurrently
const { result } = concurrently([
  { 
    command: 'cd client && npm run dev',
    name: 'CLIENT',
    prefixColor: 'blue'
  },
  { 
    command: 'npx tsx src/dev.ts',
    name: 'SERVER',
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthersOn: ['failure'],
  restartTries: 0,
});



// Handle process termination gracefully
process.on('SIGINT', () => {
  // Clean exit on Ctrl+C
  process.exit(0);
});

// Handle process completion silently
result.then(() => {}, () => {});