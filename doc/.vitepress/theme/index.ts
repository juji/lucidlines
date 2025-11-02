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
      // Run on initial load and after route changes
      const initSync = () => setTimeout(synchronizeCodeGroups, 100)
      initSync()
      // @ts-ignore
      router.onAfterRouteChanged = initSync
    }
  },
} satisfies Theme

// @ts-ignore
function synchronizeCodeGroups() {
  // Remove existing listeners to prevent duplicates
  // @ts-ignore
  document.querySelectorAll('label[data-title]').forEach(label => {
    // @ts-ignore
    label.removeEventListener('click', handleLabelClick)
  })

  // Add listeners to all code group labels
  // @ts-ignore
  document.querySelectorAll('label[data-title]').forEach(label => {
    // @ts-ignore
    label.addEventListener('click', handleLabelClick)
  })

  // Restore selection from localStorage
  // @ts-ignore
  const savedSelection = localStorage.getItem('vitepress-code-group-selection')
  if (savedSelection) {
    // Apply the saved selection to all code groups
    setTimeout(() => {
      applySelection(savedSelection)
    }, 50) // Small delay to ensure DOM is ready
  }
}

// @ts-ignore
function applySelection(selectedTitle) {
  // Find all sync group containers and apply selection within each group
  // @ts-ignore
  document.querySelectorAll('[data-sync-group]').forEach(syncGroupDiv => {
    const selector = `label[data-title="${selectedTitle}"]`
    // @ts-ignore
    const labels = syncGroupDiv.querySelectorAll(selector)

    labels.forEach((label: any) => {
      // @ts-ignore
      const input = document.getElementById(label.htmlFor)
      if (input && input.type === 'radio' && !input.checked) {
        // Check the radio button
        input.checked = true

        // Find the corresponding content block and activate it
        activateContentBlock(input)
      }
    })
  })
}

// @ts-ignore
function handleLabelClick(e) {
  // @ts-ignore
  const clickedTitle = e.target.getAttribute('data-title')
  if (!clickedTitle) return

  // Find the sync group from the wrapper div
  // @ts-ignore
  const syncGroupDiv = e.target.closest('[data-sync-group]')
  // @ts-ignore
  const syncGroup = syncGroupDiv ? syncGroupDiv.getAttribute('data-sync-group') : null

  // Save the selected package manager to localStorage
  // @ts-ignore
  localStorage.setItem('vitepress-code-group-selection', clickedTitle)

  // Let the original click proceed, then synchronize the others
  setTimeout(() => {
    // If we have a sync group, only synchronize within that group
    const selector = syncGroup
      ? `[data-sync-group="${syncGroup}"] label[data-title="${clickedTitle}"]`
      : `label[data-title="${clickedTitle}"]`

    // @ts-ignore
    document.querySelectorAll(selector).forEach(label => {
      // @ts-ignore
      if (label !== e.target) {
        // @ts-ignore
        const input = document.getElementById(label.htmlFor)
        if (input && input.type === 'radio' && !input.checked) {
          // Check the radio button
          input.checked = true

          // Find the corresponding content block and activate it
          activateContentBlock(input)
        }
      }
    })
  }, 0)
}

// @ts-ignore
function activateContentBlock(input) {
  // Find the tabs container (parent of input)
  // @ts-ignore
  const tabsContainer = input.closest('.tabs')
  if (!tabsContainer) return

  // Go up one level to find the main container (parent of .tabs)
  // @ts-ignore
  const mainContainer = tabsContainer.parentElement
  if (!mainContainer) return

  // Find the blocks container
  // @ts-ignore
  const blocksContainer = mainContainer.querySelector('.blocks')
  if (!blocksContainer) return

  // Find the index of the input among its siblings
  // @ts-ignore
  const inputs = tabsContainer.querySelectorAll('input[type="radio"]')
  let inputIndex = -1
  inputs.forEach((inp: any, index: number) => {
    // @ts-ignore
    if (inp === input) {
      inputIndex = index
    }
  })

  if (inputIndex === -1) return

  // Remove active class from all blocks in this container
  // @ts-ignore
  blocksContainer.querySelectorAll('*').forEach((element: any) => {
    // @ts-ignore
    element.classList.remove('active')
  })

  // Add active class to the corresponding block
  // @ts-ignore
  const targetBlock = blocksContainer.children[inputIndex]
  if (targetBlock) {
    // @ts-ignore
    targetBlock.classList.add('active')
  }
}
