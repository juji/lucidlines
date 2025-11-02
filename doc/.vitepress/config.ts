import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
    theme: {
      light: 'kanagawa-lotus',
      dark: 'github-dark'
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  },
  lastUpdated: true,
  title: 'LucidLines',
  description: 'Terminal streaming server with real-time process monitoring',
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