'use client'

import { useEffect, useState } from 'react'

interface KeyboardState {
  isKeyboardOpen: boolean
  keyboardHeight: number
}

const KEYBOARD_THRESHOLD = 80

const NON_KEYBOARD_INPUT_TYPES = new Set([
  'button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'hidden',
  'color', 'range', 'image',
])

function isTextEntryElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type?.toLowerCase() ?? 'text'
    return !NON_KEYBOARD_INPUT_TYPES.has(type)
  }
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

/**
 * Detects whether the on-screen keyboard is (likely) open.
 *
 * Two signals are OR-ed together for reliability on iOS Telegram WebApp where
 * `visualViewport.resize` is racy or sometimes silent for textarea focus:
 *   - viewport shrunk by more than KEYBOARD_THRESHOLD pixels
 *   - any text-entry element currently has focus (focusin/focusout on document)
 */
export function useVirtualKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({ isKeyboardOpen: false, keyboardHeight: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let viewportShrunk = false
    let inputFocused = isTextEntryElement(document.activeElement)
    let keyboardHeight = 0

    const commit = () => {
      const open = viewportShrunk || inputFocused
      const height = viewportShrunk ? keyboardHeight : 0
      setState(prev => {
        if (prev.isKeyboardOpen === open && Math.abs(prev.keyboardHeight - height) < 1) return prev
        return { isKeyboardOpen: open, keyboardHeight: height }
      })
    }

    const handleViewport = () => {
      const vv = window.visualViewport
      if (!vv) return
      const diff = window.innerHeight - vv.height
      viewportShrunk = diff > KEYBOARD_THRESHOLD
      keyboardHeight = viewportShrunk ? Math.round(diff) : 0
      commit()
    }

    const handleFocusIn = (e: FocusEvent) => {
      if (isTextEntryElement(e.target as Element | null)) {
        inputFocused = true
        commit()
      }
    }

    const handleFocusOut = () => {
      // Use rAF so the new activeElement is resolved (focus can shift between inputs).
      requestAnimationFrame(() => {
        inputFocused = isTextEntryElement(document.activeElement)
        commit()
      })
    }

    handleViewport()
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', handleViewport)
      vv.addEventListener('scroll', handleViewport)
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      if (vv) {
        vv.removeEventListener('resize', handleViewport)
        vv.removeEventListener('scroll', handleViewport)
      }
    }
  }, [])

  return state
}
