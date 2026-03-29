// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()

  if (!isLoggedIn) {
    return <LoginPage onLogin={saveToken} />
  }

  return (
    <BrowserRouter basename="/vishnya">
      <Routes>
        <Route path="/" element={<div className="p-4 text-brand font-bold">🍒 Logged in! token={token?.slice(0,10)}…</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
