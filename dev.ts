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
const processedLines = new Set();

// Create a custom writable stream that transforms output to JSON
const transformStream = new Transform({
  transform(chunk, _, callback) {
    try {
      // Get the text and split by newlines
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;  // Skip empty lines
        
        // Simplest possible extraction - just get the command name between brackets
        const match = line.match(/\[([A-Z]+)\]/);
        
        if (match) {
          const name = match[1];
          // Get content after the bracket
          const output = line.substring(line.indexOf(']') + 1).trim();
          
          // Skip duplicates and empty outputs
          const key = `${name}:${output}`;
          if (!output || processedLines.has(key)) continue;
          
          processedLines.add(key);
          // Output clean JSON
          this.push(`{"name":"${name}","output":"${output.replace(/"/g, '\\"')}"}\n`);
        }
      }
      
      callback();
    } catch (err) {
      callback();
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