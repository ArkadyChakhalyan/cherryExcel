import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ListPage from './pages/ListPage.jsx'
import FormPage from './pages/FormPage.jsx'
import StatsPage from './pages/StatsPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()
  if (!isLoggedIn) return <LoginPage onLogin={saveToken} />
  return (
    <AppProvider token={token} logout={logout}>
      <BrowserRouter basename="/cherryExcel">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/add/:type" element={<FormPage mode="add" />} />
          <Route path="/edit/:type/:rowIndex" element={<FormPage mode="edit" />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
