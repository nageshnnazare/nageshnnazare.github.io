import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme, toggleTheme } from '../useTheme'

// Appearance controls: a light/dark mode switch plus an accent switcher. The
// accent retints the indigo/cyan/emerald/violet theme by setting a data-accent
// attribute that overrides the Tailwind theme variables (see index.css); the
// mode flips a data-theme attribute. Both are persisted and applied pre-paint
// by a small bootstrap script in index.html.
const ACCENTS = [
  { id: 'indigo', color: '#6366f1', label: 'Indigo accent' },
  { id: 'cyan', color: '#06b6d4', label: 'Cyan accent' },
  { id: 'emerald', color: '#10b981', label: 'Emerald accent' },
  { id: 'violet', color: '#8b5cf6', label: 'Violet accent' },
]

export default function ThemeToggle({ className = '' }) {
  const theme = useTheme()
  const [accent, setAccent] = useState('indigo')

  useEffect(() => {
    const saved =
      (typeof localStorage !== 'undefined' && localStorage.getItem('accent')) ||
      document.documentElement.dataset.accent ||
      'indigo'
    setAccent(saved)
  }, [])

  const choose = (id) => {
    setAccent(id)
    if (id === 'indigo') {
      delete document.documentElement.dataset.accent
    } else {
      document.documentElement.dataset.accent = id
    }
    try {
      localStorage.setItem('accent', id)
    } catch {
      /* ignore private-mode storage errors */
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        className="flex items-center justify-center h-7 w-7 rounded-full text-gray-300 hover:text-white hover:bg-white/[0.1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div role="radiogroup" aria-label="Accent color" className="flex items-center gap-1.5">
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={accent === a.id}
            aria-label={a.label}
            title={a.label}
            onClick={() => choose(a.id)}
            className={`h-4 w-4 rounded-full transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
              accent === a.id ? 'ring-2 ring-white/70 scale-110' : 'ring-1 ring-white/20 hover:scale-110'
            }`}
            style={{ backgroundColor: a.color }}
          />
        ))}
      </div>
    </div>
  )
}
