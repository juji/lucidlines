---
next:
  text: Opsi Konfigurasi
  link: /id/configuration.html
---

# LucidLines

LucidLines adalah alat CLI yang menjalankan beberapa perintah terminal secara bersamaan dan mengalirkan outputnya ke antarmuka web modern. Sempurna untuk alur kerja pengembangan, memantau beberapa layanan, atau skenario apa pun di mana Anda perlu menonton output perintah beberapa secara bersamaan.

![Antarmuka Web LucidLines](/screenshot.png)

## Instalasi & Setup

::: code-group

```bash [npm]
# Instal LucidLines
npm install -D lucidlines

# Inisialisasi konfigurasi
npx lucidlines init
```

```bash [pnpm]
# Instal LucidLines
pnpm add -D lucidlines

# Inisialisasi konfigurasi
pnpx lucidlines init
```

```bash [bun]
# Instal LucidLines
bun add -D lucidlines

# Inisialisasi konfigurasi
bunx lucidlines init
```

```bash [yarn]
# Instal LucidLines
yarn add -D lucidlines

# Inisialisasi konfigurasi
yarn dlx lucidlines init
```

```bash [deno]
# Instal LucidLines
deno install -D npm:lucidlines

# Inisialisasi konfigurasi
deno run npm:lucidlines init
```

:::

Ini akan membuat file konfigurasi `.lucidlines.json5` di proyek Anda dan menambahkan skrip ke `package.json`:

```json
{
  "scripts": {
    "lucidlines": "lucidlines"
  }
}
```

## Konfigurasi

File `.lucidlines.json5` berisi definisi proses dan pengaturan Anda. Setelah inisialisasi, edit file ini untuk menambahkan perintah Anda:

```json5
{
  // Port server
  port: 8080,

  // Aktifkan mode pengembangan dengan logging konsol
  dev: true,

  // Daftar perintah untuk dijalankan
  commands: [
    {
      // Nama tampilan untuk proses
      name: "frontend",

      // Perintah untuk dieksekusi
      command: "npm run dev"
    },
    {
      name: "backend",
      command: "npm run server"
    }
  ]
}
```

## Memulai LucidLines

Setelah konfigurasi Anda disiapkan, mulai LucidLines menggunakan salah satu metode ini:

::: code-group

```bash [npm]
npx lucidlines
# atau
npm run lucidlines
```

```bash [pnpm]
pnpx lucidlines
# atau
pnpm run lucidlines
```

```bash [bun]
bunx lucidlines
# atau
bun run lucidlines
```

```bash [yarn]
yarn dlx lucidlines
# atau
yarn run lucidlines
```

```bash [deno]
deno run npm:lucidlines
```

:::

Ini akan memulai semua proses yang didefinisikan dalam file `.lucidlines.json5` Anda, output contoh:

![Pratinjau LucidLines Dimulai](/lucidlines-cli.png)

### Antarmuka Web

Setelah dimulai, buka browser Anda ke `http://localhost:8080` (atau port yang dikonfigurasi) untuk mengakses dasbor web.

## Kontrol Keyboard

Saat menjalankan LucidLines, Anda dapat menggunakan pintasan keyboard ini:

- `1`, `2`, `3`, dll. - Mulai ulang proses individual
- `r` - Mulai ulang semua proses
- `ctrl+c` - Keluar dari aplikasi