---
prev:
  text: DataBank
  link: /id/databank.html
---

# API WebSocket

Referensi detail untuk protokol komunikasi WebSocket.

## Koneksi

### Endpoint

```
ws://localhost:8080/ws
```

Path WebSocket dapat dikonfigurasi melalui opsi `wsPath`.

### Siklus Hidup Koneksi

1. **Connect** - Klien membuat koneksi WebSocket
2. **Handshake** - Server mengakui koneksi
3. **Streaming** - Pertukaran data real-time
4. **Disconnect** - Koneksi ditutup

## Tipe Pesan

### Pesan Server ke Klien

#### Output Proses

Dikirim setiap kali proses menghasilkan output.

```json
{
  "type": "process",
  "name": "web-server",
  "output": "Server listening on port 3000\n",
  "timestamp": 1638360000000
}
```

#### Status Proses

Dikirim ketika status proses berubah.

```json
{
  "type": "status",
  "name": "web-server",
  "status": "running",
  "pid": 12345,
  "timestamp": 1638360000000
}
```

#### Pesan Error

Dikirim ketika terjadi kesalahan.

```json
{
  "type": "error",
  "message": "Failed to start process",
  "process": "web-server",
  "timestamp": 1638360000000
}
```

#### Info Server

Dikirim pada koneksi awal.

```json
{
  "type": "info",
  "version": "1.0.0",
  "processes": [
    {
      "name": "web-server",
      "status": "running",
      "command": "npm run dev"
    }
  ],
  "timestamp": 1638360000000
}
```

### Pesan Klien ke Server

#### Ping/Pong

Ping/pong WebSocket standar untuk kesehatan koneksi.

#### Pesan Perintah

```json
{
  "type": "command",
  "action": "restart",
  "target": "web-server"
}
```

```json
{
  "type": "command",
  "action": "restart-all"
}
```

## Format Pesan

### Field Umum

Semua pesan menyertakan:

- `type` (string) - Identifier tipe pesan
- `timestamp` (number) - Timestamp Unix dalam milidetik

### Tipe Data

- **output** (string) - Output terminal, mungkin berisi kode escape ANSI
- **status** (string) - Status proses: "running", "stopped", "error", "starting"
- **pid** (number) - ID proses ketika berjalan
- **name** (string) - Identifier nama proses

## Implementasi Klien

### Contoh JavaScript

```javascript
class LucidLinesClient {
  constructor(url = 'ws://localhost:8080/ws') {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Terhubung ke LucidLines');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('Terputus dari LucidLines');
    };

    this.ws.onerror = (error) => {
      console.error('Error WebSocket:', error);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'process':
        this.onProcessOutput(message.name, message.output);
        break;
      case 'status':
        this.onProcessStatus(message.name, message.status);
        break;
      case 'error':
        this.onError(message.message, message.process);
        break;
      case 'info':
        this.onServerInfo(message);
        break;
    }
  }

  // Override metode ini di subclass
  onProcessOutput(name, output) {
    console.log(`${name}: ${output}`);
  }

  onProcessStatus(name, status) {
    console.log(`${name} sedang ${status}`);
  }

  onError(message, process) {
    console.error(`Error di ${process}: ${message}`);
  }

  onServerInfo(info) {
    console.log('Terhubung ke LucidLines', info.version);
  }

  restartProcess(name) {
    this.send({
      type: 'command',
      action: 'restart',
      target: name
    });
  }

  restartAll() {
    this.send({
      type: 'command',
      action: 'restart-all'
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  close() {
    this.ws.close();
  }
}
```

### Contoh React Hook

```javascript
import { useEffect, useRef, useState } from 'react';

export function useLucidLines(url = 'ws://localhost:8080/ws') {
  const [processes, setProcesses] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'info') {
        setProcesses(message.processes);
      } else if (message.type === 'status') {
        setProcesses(prev =>
          prev.map(proc =>
            proc.name === message.name
              ? { ...proc, status: message.status }
              : proc
          )
        );
      }
    };

    return () => ws.close();
  }, [url]);

  const restartProcess = (name) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        action: 'restart',
        target: name
      }));
    }
  };

  const restartAll = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        action: 'restart-all'
      }));
    }
  };

  return { processes, connected, restartProcess, restartAll };
}
```

## Penanganan Error

### Error Koneksi

- Tangani kegagalan koneksi WebSocket
- Implementasikan logika reconnection
- Tampilkan feedback pengguna yang sesuai

### Error Pesan

- Validasi format pesan yang masuk
- Tangani tipe pesan yang tidak dikenal dengan baik
- Log error untuk debugging

## Praktik Terbaik

### Manajemen Koneksi

- Implementasikan exponential backoff untuk reconnection
- Tangani gangguan jaringan dengan baik
- Bersihkan resource saat component unmount

### Performa

- Batasi pemrosesan pesan dalam skenario frekuensi tinggi
- Gunakan struktur data efisien untuk state proses
- Debounce pembaruan status yang cepat

### Keamanan

- Validasi origin WebSocket dalam produksi
- Gunakan koneksi WebSocket aman (WSS) jika memungkinkan
- Sanitasi output proses sebelum rendering