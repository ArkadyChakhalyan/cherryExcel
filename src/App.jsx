// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ListPage from './pages/ListPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()

  if (!isLoggedIn) return <LoginPage onLogin={saveToken} />

  return (
    <AppProvider token={token} logout={logout}>
      <BrowserRouter basename="/vishnya">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
