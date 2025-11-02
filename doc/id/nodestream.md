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

<!--@include: ../.vitepress/includes/nodestream-usage.md-->

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

<!--@include: ../.vitepress/includes/process-info-interface.md-->