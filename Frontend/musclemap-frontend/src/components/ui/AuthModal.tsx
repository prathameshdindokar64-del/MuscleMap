/**
 * AuthModal.tsx
 * Glassmorphic login / register overlay.
 * Triggered by the "Sign In" button in the Header.
 */

import { useState } from 'react'
import { login, register } from '../../api/painApi'
import { useAuth } from '../../context/AuthContext'

interface AuthModalProps {
  onClose: () => void
  onSuccess?: (name: string) => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { setAuth } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let res
      if (tab === 'login') {
        res = await login({ email, password })
      } else {
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        res = await register({ email, password, name })
      }
      setAuth(res.token, res.user)
      onSuccess?.(res.user.name)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    backdropFilter: 'blur(8px)',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-strong"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          margin: '0 16px',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '20px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close auth modal"
        >
          ×
        </button>

        {/* Logo */}
        <p style={{ textAlign: 'center', fontSize: '28px', marginBottom: '4px' }}>🫀</p>
        <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
          MuscleMap
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--glass-bg)', borderRadius: '12px', padding: '4px' }}>
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(null) }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: tab === t ? 'var(--accent-color, #0d9488)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={tab === 'register' ? 'Password (min 8 chars)' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-accent"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
