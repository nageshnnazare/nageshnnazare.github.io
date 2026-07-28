import { useSyncExternalStore } from 'react'

// Tiny external store for the light/dark mode so any component (React or the
// 3D canvas) can read it and re-render on change. The actual switching is a
// `data-theme` attribute on <html> that CSS keys off of; this just mirrors it
// into React and persists the choice.
const listeners = new Set()

export function getTheme() {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark'
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem('theme', t)
  } catch {
    /* ignore private-mode storage errors */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t === 'light' ? '#e9edfb' : '#050510')
  listeners.forEach((l) => l())
}

export function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light')
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'dark')
}
