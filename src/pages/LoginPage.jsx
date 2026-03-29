// src/pages/LoginPage.jsx
import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage({ onLogin }) {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    onSuccess: (response) => onLogin(response.access_token, response.expires_in),
    onError: (err) => console.error('Login failed', err),
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8">
      <div className="text-6xl mb-4">🍒</div>
      <h1 className="text-3xl font-extrabold text-brand mb-2">ВИШНЯ</h1>
      <p className="text-gray-500 mb-10 text-center">Учёт финансов бизнеса по украшениям</p>
      <button
        onClick={() => login()}
        className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-6 py-3 shadow-sm text-gray-700 font-semibold text-sm active:scale-95 transition-transform"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        Войти через Google
      </button>
    </div>
  )
}
