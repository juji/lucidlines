import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'virtual:group-icons.css'
import './custom.css'

// ts-ignoreing to ignore missing types
// @ts-ignore
import ImageViewer from '@miletorix/vitepress-image-viewer'
import '@miletorix/vitepress-image-viewer/style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    ImageViewer(app)

    // Synchronize code group tabs
    // @ts-ignore
    if (typeof window !== 'undefined') {
      // Run synchronization after route changes
      // @ts-ignore
      router.onAfterRouteChanged = () => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          synchronizeCodeGroups()
        }, 100)
      }

      // Also run on initial load
      setTimeout(() => {
        synchronizeCodeGroups()
      }, 100)
    }
  },
} satisfies Theme

// @ts-ignore
function synchronizeCodeGroups() {
  // @ts-ignore
  const labels = document.querySelectorAll('label[data-title]')

  labels.forEach((label: any) => {
    label.addEventListener('click', (e: any) => {
      // @ts-ignore
      const title = e.target.getAttribute('data-title')
      if (title) {
        // Find all labels with the same data-title and click them
        // @ts-ignore
        const matchingLabels = document.querySelectorAll(`label[data-title="${title}"]`)
        matchingLabels.forEach((matchingLabel: any) => {
          // @ts-ignore
          const input = document.getElementById(matchingLabel.htmlFor)
          if (input && input.type === 'radio') {
            input.checked = true
            // Trigger change event
            // @ts-ignore
            input.dispatchEvent(new Event('change', { bubbles: true }))
          }
        })
      }
    })
  })
}
