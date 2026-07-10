/**
 * auth.ts
 * JWT token management in localStorage.
 * Stores and retrieves auth token and user info.
 */

const TOKEN_KEY = 'musclemap-auth-token'
const USER_KEY = 'musclemap-user'

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function saveUser(user: object): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getSavedUser(): any | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
