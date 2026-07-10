import { useTheme } from '../../context/ThemeContext'

/** Icon-only button to switch between dark and light themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDarkTheme = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="glass h-10 w-10 rounded-full transition"
      style={{
        borderColor: 'var(--glass-border)',
        color: 'var(--text-primary)',
      }}
      aria-label="Toggle theme"
    >
      <span className="inline-block transition duration-200">{isDarkTheme ? '☀️' : '🌙'}</span>
    </button>
  )
}
