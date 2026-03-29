// src/hooks/useAuth.js
import { useState, useCallback } from 'react'

const TOKEN_KEY = 'vishnya_access_token'
const EXPIRY_KEY = 'vishnya_token_expiry'

export function useAuth() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0)
    return stored && Date.now() < expiry ? stored : null
  })

  const saveToken = useCallback((accessToken, expiresIn) => {
    const expiry = Date.now() + expiresIn * 1000 - 60_000 // 1 min safety margin
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(EXPIRY_KEY, String(expiry))
    setToken(accessToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
    setToken(null)
  }, [])

  return { token, isLoggedIn: !!token, saveToken, logout }
}
