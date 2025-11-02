---
prev:
  text: DataBank
  link: /id/databank.html
next:
  text: Inti
  link: /id/core.html
---

# API NodeStream

Manajemen dan kontrol proses untuk menjalankan beberapa perintah.

```typescript
import { start } from 'lucidlines';

const { nodeStream } = start({
  commands: [
    { name: 'web', command: 'npm run dev' },
    { name: 'api', command: 'npm run server' },
    { name: 'worker', command: 'npm run worker' }
  ]
  serverPort: 8080
});

// Mulai ulang proses tertentu berdasarkan indeks
await nodeStream.restartProcess(0); // Mulai ulang web server

// Mulai ulang semua proses
await nodeStream.restartAll();

// Hentikan semua proses
await nodeStream.stop();
```

## `restartProcess(index)`

Memulai ulang proses tertentu berdasarkan indeks.

#### Parameter

- `index` (number) - Indeks berbasis nol dari proses yang akan dimulai ulang

#### Mengembalikan

- `Promise<void>` - Resolves ketika proses telah dimulai ulang

## `restartAll()`

Memulai ulang semua proses.

#### Mengembalikan

- `Promise<void[]>` - Array promise yang resolve ketika semua proses telah dimulai ulang

## `stop()`

Menghentikan semua proses.

#### Mengembalikan

- `Promise<void>` - Resolves ketika semua proses telah dihentikan

## Tipe

### ProcessInfo

```typescript
interface ProcessInfo {
  name: string;
  command: string;
  process: ChildProcess;
  kill: () => void;
  restart: () => Promise<void>;
}
```