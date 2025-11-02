---
prev:
  text: Manajemen Proses
  link: /id/process-management.html
next:
  text: NodeStream
  link: /id/nodestream.html
---

# API DataBank

Sistem penyimpanan data pusat yang memisahkan produsen data dari konsumen.

<!--@include: ../.vitepress/includes/databank-usage.md-->

::: warning
DataBank secara otomatis dibuat dan dikelola oleh LucidLines terlepas dari konfigurasi. API yang didokumentasikan di sini untuk kasus penggunaan lanjutan di mana Anda memerlukan akses langsung ke data log secara programatik. Kebanyakan pengguna tidak perlu berinteraksi dengan DataBank secara langsung.

**Catatan:** Dalam contoh di atas, `serverPort` tidak disetel, yang berarti antarmuka web tidak berjalan. Meskipun DataBank masih mengumpulkan dan menyimpan semua output perintah, tidak ada yang mengkonsumsi atau menampilkannya. Tambahkan `serverPort` untuk mengaktifkan dasbor web, atau gunakan `databank.subscribe()` untuk memproses log secara programatik. Kami mengundang mereka yang berjiwa petualang untuk membuat antarmuka sendiri.
:::

## `addData(type, data)`

Menambahkan data ke penyimpanan DataBank. Ini dilakukan secara internal oleh pustaka `node-stream.ts`. Pengguna biasanya tidak menggunakan ini.

#### Parameter

- `type` (string) - Tipe/kategori data
- `data` (string) - Konten data yang akan disimpan

#### Contoh

```typescript
/* dengan:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
databank.addData('web', 'pesan log');
```

## `getRecentMessages(limit?)`

Mendapatkan pesan terbaru untuk klien yang baru terhubung.

#### Parameter

- `limit` (number, optional) - Jumlah maksimum pesan yang dikembalikan (default: 1000)

#### Mengembalikan

- `LogEntry[]` - Array entri log terbaru

#### Contoh

```typescript
const recent = databank.getRecentMessages(50);
```

## `getMessageByType(type, lastTimestamp?, limit?)`

Mendapatkan pesan untuk tipe tertentu.

#### Parameter

- `type` (string) - Tipe data untuk difilter
- `lastTimestamp` (number, optional) - Dapatkan pesan sebelum timestamp ini
- `limit` (number, optional) - Jumlah maksimum pesan yang dikembalikan (default: 20)

#### Mengembalikan

- `LogEntry[]` - Array entri log untuk tipe yang ditentukan

#### Contoh

```typescript
/* dengan:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
const appLogs = databank.getMessageByType('web', undefined, 100);
```

## `getAllMessages()`

Mendapatkan semua pesan yang disimpan (gunakan dengan hati-hati untuk dataset besar).

#### Mengembalikan

- `LogEntry[]` - Array semua entri log

#### Contoh

```typescript
const allMessages = databank.getAllMessages();
```

## `getTotalMessageCount()`

Mendapatkan jumlah total semua pesan yang disimpan.

#### Mengembalikan

- `number` - Jumlah total pesan

#### Contoh

```typescript
const total = databank.getTotalMessageCount();
```

## `getMessageCountByType(type)`

Mendapatkan jumlah pesan untuk tipe tertentu.

#### Parameter

- `type` (string) - Tipe data untuk dihitung

#### Mengembalikan

- `number` - Jumlah pesan untuk tipe yang ditentukan

#### Contoh

```typescript
/* dengan:
commands: [
  { name: 'web', command: 'npm run dev' }
]
*/
const appCount = databank.getMessageCountByType('web');
```

## `getAvailableTypes()`

Mendapatkan semua tipe data unik yang disimpan.

#### Mengembalikan

- `string[]` - Array tipe data yang tersedia

#### Contoh

```typescript
const types = databank.getAvailableTypes();
```

## `subscribe(callback)`

Berlangganan pembaruan data real-time.

#### Parameter

- `callback` (function) - Fungsi yang dipanggil saat data baru tiba

#### Mengembalikan

- `function` - Fungsi unsubscribe

#### Contoh

```typescript
const unsubscribe = databank.subscribe((entry: LogEntry) => {
  console.log(`${entry.type}: ${entry.data}`);
});

// Kemudian...
unsubscribe();
```

## `cleanup()`

Membersihkan resource DataBank (harus dipanggil saat shutdown).

#### Contoh

```typescript
databank.cleanup();
```

## Tipe

### LogEntry

<!--@include: ../.vitepress/includes/log-entry-interface.md-->