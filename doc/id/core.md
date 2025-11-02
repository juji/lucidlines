---
prev:
  text: NodeStream
  link: /id/nodestream.html
next:
  text: CLI
  link: /id/cli.html
---

# API Inti

Titik masuk utama untuk memulai LucidLines secara programatik.

## `start(options)`

Memulai server dan proses LucidLines.

```typescript
import { start } from 'lucidlines';

const { lucidEvent, stop, server, nodeStream, databank } = start({
  commands: [
    { name: 'web', command: 'npm run dev' },
    { name: 'api', command: 'npm run server' }
  ],

  // nullable, server tidak akan dimulai jika ini falsy
  // jika demikian,
  // Anda dapat mendengarkan event menggunakan databank.subscribe
  serverPort: 3000,

});

// Dengarkan event siklus hidup proses
lucidEvent.on('start', (data) => {
  console.log(`[${data.index}] ${data.name} started`);
  // contoh: [0] web started
});

lucidEvent.on('kill', (data) => {
  console.log(`[${data.index}] ${data.name} killed`);
});

lucidEvent.on('forcekill', (data) => {
  console.log(`[${data.index}] ${data.name} force killed`);
});

// Tangani shutdown graceful
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
      `Error selama shutdown${signal ? ` (${signal})` : ""}:`,
      error,
    );
    process.exit(1);
  }
}
```

#### Parameter

```typescript
interface StartOptions {
  serverPort?: number;        // Port server (default: 8080)
  frontEnd?: string | number; // Path atau port frontend
  commands?: Array<{          // Perintah untuk dijalankan
    command: string;
    name: string;
  }>;
  dev?: boolean;              // Mode pengembangan
}
```

#### Mengembalikan

```typescript
interface StartResult {
  server?: Server;           // Instance server HTTP
  nodeStream: NodeStream;    // Manajer proses
  databank: DataBank;        // Sistem penyimpanan dan pengambilan data, Anda mungkin tidak memerlukan ini
  lucidEvent: LucidEvent;    // Event emitter untuk event siklus hidup proses
  stop: () => Promise<void>; // Fungsi cleanup
}
```

#### Tipe

```typescript
interface Command {
  name: string;    // Nama proses
  command: string; // Perintah shell untuk dijalankan
}
```