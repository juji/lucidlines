import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'

// ts-ignoreing to ignore missing types
// @ts-ignore
import ImageViewer from '@miletorix/vitepress-image-viewer'
import '@miletorix/vitepress-image-viewer/style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    ImageViewer(app)
  },
} satisfies Theme
