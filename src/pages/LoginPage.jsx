import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage({ onLogin }) {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    onSuccess: (response) => onLogin(response.access_token, response.expires_in),
    onError: (err) => console.error('Login failed', err),
  })

  return (
    <div
      style={{ background: 'linear-gradient(145deg, #3b0764 0%, #6d28d9 50%, #a855f7 100%)' }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
    >
      <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }} className="mb-6">🍒</div>
      <h1 style={{ letterSpacing: '0.15em' }} className="text-3xl font-extrabold text-white mb-2">ВИШНЯ</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-10 text-center text-sm">
        Учёт финансов бизнеса по украшениям
      </p>
      <button
        onClick={() => login()}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '14px 24px',
        }}
        className="flex items-center gap-3 text-white font-semibold text-sm active:scale-95 transition-transform"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        Войти через Google
      </button>
    </div>
  )
}
