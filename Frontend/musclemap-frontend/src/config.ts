/**
 * config.ts
 * Central access point for all environment variables in the frontend.
 * Always import from here — never access import.meta.env directly in components.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const APP_VERSION = '1.0.0'
