import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'LucidLines',
      description: 'Terminal streaming server with real-time process monitoring',
      themeConfig: {
        sidebar: {
          '/': [
            { 
              text: 'Home',
              items: [
                { text: 'Installation & Setup', link: '/#installation-setup' },
                { text: 'Configuration', link: '/#configuration' },
                { text: 'Starting LucidLines', link: '/#starting-lucidlines' },
                { text: 'Keyboard Controls', link: '/#keyboard-controls' },
              ]
            },
            {
              text: 'Guide',
              items: [
                { text: 'Configuration Options', link: '/configuration' },
                { text: 'Command Line Interface', link: '/cli' },
                { text: 'Process Management', link: '/process-management' },
                { text: 'Web Interface', link: '/web-interface' }
              ]
            },
            {
              text: 'API',
              items: [
                { text: 'Core API', link: '/core' },
                { text: 'NodeStream API', link: '/nodestream' },
                { text: 'DataBank API', link: '/databank' }
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/juji/lucidlines' },
          { icon: 'npm', link: 'https://www.npmjs.com/package/lucidlines' }
        ]
      }
    },
    id: {
      label: 'Bahasa Indonesia',
      lang: 'id',
      title: 'LucidLines',
      description: 'Server streaming terminal dengan pemantauan proses real-time',
      themeConfig: {
        sidebar: {
          '/id/': [
            { 
              text: 'Beranda',
              items: [
                { text: 'Instalasi & Setup', link: '/id/#instalasi-setup' },
                { text: 'Konfigurasi', link: '/id/#konfigurasi' },
                { text: 'Memulai LucidLines', link: '/id/#memulai-lucidlines' },
                { text: 'Kontrol Keyboard', link: '/id/#kontrol-keyboard' },
              ]
            },
            {
              text: 'Panduan',
              items: [
                { text: 'Opsi Konfigurasi', link: '/id/configuration' },
                { text: 'Antarmuka Baris Perintah', link: '/id/cli' },
                { text: 'Manajemen Proses', link: '/id/process-management' },
                { text: 'Antarmuka Web', link: '/id/web-interface' }
              ]
            },
            {
              text: 'API',
              items: [
                { text: 'API Inti', link: '/id/core' },
                { text: 'API NodeStream', link: '/id/nodestream' },
                { text: 'API DataBank', link: '/id/databank' }
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/juji/lucidlines' },
          { icon: 'npm', link: 'https://www.npmjs.com/package/lucidlines' }
        ]
      }
    }
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
    theme: {
      light: 'min-light',
      dark: 'github-dark'
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  },
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }]
  ],
  themeConfig: {
    logo: '/apple-touch-icon.png',
    editLink: {
      pattern: 'https://github.com/juji/lucidlines/edit/doc/doc/:path'
    },
    search: {
      provider: 'local'
    },
    sidebar: {
      '/': [
        { 
          text: 'Home',
          items: [
            { text: 'Installation & Setup', link: '/#installation-setup' },
            { text: 'Configuration', link: '/#configuration' },
            { text: 'Starting LucidLines', link: '/#starting-lucidlines' },
            { text: 'Keyboard Controls', link: '/#keyboard-controls' },
          ]
        },
        {
          text: 'Guide',
          items: [
            { text: 'Configuration Options', link: '/configuration' },
            { text: 'Command Line Interface', link: '/cli' },
            { text: 'Process Management', link: '/process-management' },
            { text: 'Web Interface', link: '/web-interface' }
          ]
        },
        {
          text: 'API',
          items: [
            { text: 'Core API', link: '/core' },
            { text: 'NodeStream API', link: '/nodestream' },
            { text: 'DataBank API', link: '/databank' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/juji/lucidlines' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/lucidlines' }
    ]
  }
})