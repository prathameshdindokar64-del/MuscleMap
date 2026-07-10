/**
 * utils/deviceId.ts
 * Manages a persistent device identifier stored in localStorage.
 *
 * Why: The app tracks assessment history per device without requiring
 * user login. A UUID is generated once and stored permanently in the
 * browser. All history API calls include this ID so the backend can
 * return results specific to this device.
 *
 * EXTENSIBILITY: When user authentication is added, replace getOrCreateDeviceId()
 * usage with the authenticated user's ID from the auth token.
 */

import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'musclemap-device-id'

/**
 * Returns the existing device ID from localStorage, or generates and
 * stores a new UUID if none exists.
 * @returns A UUID string that persists across browser sessions
 */
export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing

  const newId = uuidv4()
  localStorage.setItem(STORAGE_KEY, newId)
  return newId
}

/**
 * Clears the device ID from localStorage.
 * Use only for testing or if the user requests data deletion.
 */
export function clearDeviceId(): void {
  localStorage.removeItem(STORAGE_KEY)
}
