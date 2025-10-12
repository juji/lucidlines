#!/usr/bin/env tsx

import concurrently from 'concurrently';
import { Transform } from 'stream';



// Store the current process name
let currentName = "SYSTEM";

const normalTransformStream = new Transform({
  transform(chunk, _, callback) {
    this.push(chunk);
    callback();
  }
});

normalTransformStream.pipe(process.stdout);

// Set to store already processed lines
let buffer = '';

// Create a custom writable stream that transforms output to JSON
const transformStream = new Transform({
  transform(chunk, _, callback) {
    try {

      buffer += chunk.toString();

      // check if buffer contains new line
      if (!buffer.includes('\n')) {
        callback();
        return;
      }
        
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {

        // Simplest possible extraction - just get the command name between brackets
        const match = line.match(/\[([A-Z]+)\]/);
        if(!match) continue;

        const name = match[1];
        const output = line.substring(line.indexOf(']') + 1);

        // Remove ANSI escape sequences only from the beginning of the output
        const cleanOutput = output.replace(/^\s*\u001b\[\d+m/, '');

        this.push(
          JSON.stringify({ name, output: cleanOutput }) + '\n'
        );

      }

      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
});

transformStream.pipe(process.stdout);

// Run client and server concurrently
const { result } = concurrently([
  { 
    command: 'cd client && npm run dev',
    name: 'CLIENT',
  },
  { 
    command: 'npx tsx src/dev.ts',
    name: 'SERVER',
  }
], {
  prefix: 'name',
  killOthersOn: ['failure'],
  restartTries: 0,
  outputStream: transformStream
  // outputStream: normalTransformStream
});



// Handle process termination gracefully
process.on('SIGINT', () => {
  // Clean exit on Ctrl+C
  process.exit(0);
});

// Handle process completion silently
result.then(() => {}, () => {});