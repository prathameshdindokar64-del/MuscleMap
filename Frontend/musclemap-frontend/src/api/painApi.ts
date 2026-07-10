/**
 * api/painApi.ts
 * All HTTP calls to the MuscleMap backend.
 * Every function here corresponds to one backend endpoint.
 * Never call axios directly from components — always use these functions.
 */

import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '../config'
import type {
  AnalyzePainRequest,
  AnalyzePainResponse,
  HistoryEntry,
  Region,
  ApiError,
  User,
  AuthResponse,
} from '../types'

/**
 * Creates a typed error message from an Axios error.
 * Used by all API functions below.
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined
    return data?.error || error.message || 'Network error'
  }
  return 'An unexpected error occurred'
}

/**
 * Submits a pain assessment to the backend.
 * @param data - The assessment form data including region, pain type, and intensity
 * @returns The analysis result with muscles, exercises, risk level, and warnings
 * @throws Error with a human-readable message if the request fails
 */
export async function analyzePain(
  data: AnalyzePainRequest
): Promise<AnalyzePainResponse> {
  try {
    const response = await axios.post<AnalyzePainResponse>(
      `${API_BASE_URL}/api/analyze-pain`,
      data,
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/**
 * Fetches the last 10 pain assessments for a device.
 * @param deviceId - The UUID stored in localStorage for this device
 * @returns Array of history entries, newest first
 * @throws Error with a human-readable message if the request fails
 */
export async function getHistory(deviceId: string): Promise<HistoryEntry[]> {
  try {
    const response = await axios.get<HistoryEntry[]>(
      `${API_BASE_URL}/api/history`,
      { params: { deviceId } }
    )
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/**
 * Fetches all supported body regions from the backend.
 * @returns Array of region objects with id, name, and description
 * @throws Error with a human-readable message if the request fails
 */
export async function getRegions(): Promise<Region[]> {
  try {
    const response = await axios.get<Region[]>(`${API_BASE_URL}/api/regions`)
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/**
 * Health check — confirms backend is reachable.
 * @returns true if backend responds with 200
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await axios.get(`${API_BASE_URL}/api/health`)
    return true
  } catch {
    return false
  }
}

// ── AUTH ──

/** Register a new account */
export async function register(data: {
  email: string
  password: string
  name: string
}): Promise<AuthResponse> {
  try {
    const res = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, data)
    return res.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** Login with email and password */
export async function login(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  try {
    const res = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, data)
    return res.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

/** Get current user profile (requires token) */
export async function getProfile(token: string): Promise<{ user: User }> {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

// ── PDF EXPORT ──

/**
 * Triggers PDF download in the browser.
 * Sends assessment data to backend, receives PDF blob, saves file.
 */
export async function exportPdf(
  assessment: AnalyzePainResponse,
  userInfo: { name: string }
): Promise<void> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/export/pdf`,
      { assessment, userInfo },
      { responseType: 'blob' }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `musclemap-report-${Date.now()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error('Failed to generate PDF report')
  }
}
