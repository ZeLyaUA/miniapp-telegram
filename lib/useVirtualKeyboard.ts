'use client'

import { useEffect, useState } from 'react'

interface KeyboardState {
  isKeyboardOpen: boolean
  keyboardHeight: number
}

const KEYBOARD_THRESHOLD = 80

/**
 * Detects on-screen keyboard by watching `window.visualViewport`.
 * The keyboard is considered open when the visual viewport is at least
 * KEYBOARD_THRESHOLD shorter than `window.innerHeight`.
 */
export function useVirtualKeyboard(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({ isKeyboardOpen: false, keyboardHeight: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const diff = window.innerHeight - vv.height
      const open = diff > KEYBOARD_THRESHOLD
      setState(prev => {
        if (prev.isKeyboardOpen === open && Math.abs(prev.keyboardHeight - diff) < 1) return prev
        return { isKeyboardOpen: open, keyboardHeight: open ? Math.round(diff) : 0 }
      })
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return state
}
