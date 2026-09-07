import { onMounted, onUnmounted, ref } from 'vue'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface SpatialNavOptions {
  containerSelector?: string
  focusableSelector?: string
  defaultFocusSelector?: string
  onBack?: () => void
  onEnter?: (element: HTMLElement) => void
  autoFocus?: boolean
}

export function useSpatialNav(options: SpatialNavOptions = {}) {
  const {
    containerSelector = '#app',
    focusableSelector = 'button:not([disabled]), input:not([disabled]), [tabindex="0"], a[href], [data-nav-item]',
    defaultFocusSelector,
    onBack,
    onEnter,
    autoFocus = true,
  } = options

  const currentFocusedElement = ref<HTMLElement | null>(null)

  function getFocusableElements(): HTMLElement[] {
    const container = document.querySelector(containerSelector) || document.body
    const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))

    return elements.filter((el) => {
      // Must be visible and not hidden
      const style = window.getComputedStyle(el)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        !el.hasAttribute('disabled')
      )
    })
  }

  function getCenter(rect: DOMRect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  function findNextElement(currentEl: HTMLElement, direction: Direction): HTMLElement | null {
    const focusables = getFocusableElements()
    const currentRect = currentEl.getBoundingClientRect()
    const currentCenter = getCenter(currentRect)

    let bestCandidate: HTMLElement | null = null
    let minDistance = Infinity

    for (const candidate of focusables) {
      if (candidate === currentEl) continue

      const candidateRect = candidate.getBoundingClientRect()
      const candidateCenter = getCenter(candidateRect)

      const dx = candidateCenter.x - currentCenter.x
      const dy = candidateCenter.y - currentCenter.y

      // Direction check
      let isInDirection = false
      let primaryDiff = 0
      let secondaryDiff = 0

      switch (direction) {
        case 'right':
          isInDirection = candidateRect.left >= currentRect.left + 5 && dx > 0
          primaryDiff = dx
          secondaryDiff = Math.abs(dy)
          break
        case 'left':
          isInDirection = candidateRect.right <= currentRect.right - 5 && dx < 0
          primaryDiff = Math.abs(dx)
          secondaryDiff = Math.abs(dy)
          break
        case 'down':
          isInDirection = candidateRect.top >= currentRect.top + 5 && dy > 0
          primaryDiff = dy
          secondaryDiff = Math.abs(dx)
          break
        case 'up':
          isInDirection = candidateRect.bottom <= currentRect.bottom - 5 && dy < 0
          primaryDiff = Math.abs(dy)
          secondaryDiff = Math.abs(dx)
          break
      }

      if (!isInDirection) continue

      // Weight primary distance vs secondary deviation (directional funnel)
      const distance = primaryDiff * 1.0 + secondaryDiff * 2.5

      if (distance < minDistance) {
        minDistance = distance
        bestCandidate = candidate
      }
    }

    return bestCandidate
  }

  function focusElement(el: HTMLElement | null) {
    if (!el) return
    currentFocusedElement.value = el
    el.focus()
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }

  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key
    const activeEl = document.activeElement as HTMLElement | null

    // D-Pad navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault()

      let dir: Direction = 'right'
      if (key === 'ArrowUp') dir = 'up'
      if (key === 'ArrowDown') dir = 'down'
      if (key === 'ArrowLeft') dir = 'left'
      if (key === 'ArrowRight') dir = 'right'

      if (!activeEl || activeEl === document.body) {
        const first = getFocusableElements()[0] || null
        focusElement(first)
        return
      }

      const next = findNextElement(activeEl, dir)
      if (next) {
        focusElement(next)
      }
      return
    }

    // Android TV Back Button (Escape or BrowserBack)
    if (key === 'Escape' || key === 'Backspace' || key === 'BrowserBack') {
      // If inside an input and pressing backspace, allow normal backspace
      if (key === 'Backspace' && activeEl?.tagName === 'INPUT') {
        return
      }

      if (onBack) {
        event.preventDefault()
        onBack()
      }
      return
    }

    // Enter / D-Pad Center Select
    if (key === 'Enter') {
      if (activeEl && onEnter) {
        onEnter(activeEl)
      }
    }
  }

  function focusInitial() {
    setTimeout(() => {
      if (defaultFocusSelector) {
        const defaultEl = document.querySelector<HTMLElement>(defaultFocusSelector)
        if (defaultEl) {
          focusElement(defaultEl)
          return
        }
      }

      const elements = getFocusableElements()
      if (elements.length > 0 && elements[0]) {
        focusElement(elements[0])
      }
    }, 150)
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    if (autoFocus) {
      focusInitial()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    currentFocusedElement,
    focusInitial,
    focusElement,
    getFocusableElements,
  }
}
