import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'jwt-auth-demo-token'
const MOCK_USER = {
  username: 'admin',
  password: 'password123',
  role: 'admin',
  name: 'Ava Chen',
}

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)))
}

function decodeBase64(value) {
  return decodeURIComponent(escape(atob(value)))
}

function createMockJwt(user) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }

  const encodedHeader = encodeBase64(JSON.stringify(header))
  const encodedPayload = encodeBase64(JSON.stringify(payload))
  const signature = encodeBase64(`${encodedHeader}.${encodedPayload}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function parseJwt(token) {
  const parts = token.split('.')
  if (parts.length < 3) return null

  try {
    const payload = JSON.parse(decodeBase64(parts[1]))
    return payload
  } catch {
    return null
  }
}

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => window.localStorage.getItem(STORAGE_KEY) || '')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Please sign in to continue.')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('Please sign in to continue.')
      return
    }

    const payload = parseJwt(token)
    if (!payload) {
      setStatus('Stored token is invalid. Please sign in again.')
      setToken('')
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      setStatus('Your session has expired. Please sign in again.')
      setToken('')
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    setStatus(`Signed in as ${payload.name || payload.sub}`)
  }, [token])

  const profile = useMemo(() => {
    if (!token) return null
    return parseJwt(token)
  }, [token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    await new Promise((resolve) => window.setTimeout(resolve, 700))

    if (username.trim() === MOCK_USER.username && password === MOCK_USER.password) {
      const newToken = createMockJwt(MOCK_USER)
      setToken(newToken)
      window.localStorage.setItem(STORAGE_KEY, newToken)
      setStatus('Authentication succeeded. JWT stored securely in browser storage.')
    } else {
      setError('Invalid credentials. Try admin / password123')
    }

    setIsLoading(false)
  }

  const handleLogout = () => {
    setToken('')
    window.localStorage.removeItem(STORAGE_KEY)
    setPassword('')
    setError('')
    setStatus('You have been logged out. Tokens are cleared from storage.')
  }

  return (
    <main className="app-shell">
      <section className="card">
        <div className="hero">
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>JWT Authentication Demo</p>
          <h1>Secure login with stateless session tokens</h1>
          <p>This example demonstrates a mock JWT-based flow with browser storage, token validation, and protected content access.</p>
        </div>

        <div className="grid">
          <div className="panel">
            {!token ? (
              <form onSubmit={handleLogin}>
                <label>
                  Username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
                </label>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Authenticating...' : 'Log in'}</button>
                <button type="button" className="secondary" onClick={() => { setUsername(MOCK_USER.username); setPassword(MOCK_USER.password) }}>
                  Fill demo credentials
                </button>
                {error ? <div className="error">{error}</div> : null}
              </form>
            ) : (
              <div>
                <h2>Welcome back</h2>
                <p>Your session is active and the JWT is attached to the browser state.</p>
                <button onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Session status</h2>
            <p className={token ? 'success' : 'error'}>{status}</p>

            {profile ? (
              <>
                <h3>Decoded payload</h3>
                <ul className="info-list">
                  <li>Username: {profile.sub}</li>
                  <li>Name: {profile.name}</li>
                  <li>Role: {profile.role}</li>
                  <li>Expires: {new Date(profile.exp * 1000).toLocaleString()}</li>
                </ul>
                <h3>Stored token</h3>
                <div className="token-box">{token}</div>
              </>
            ) : (
              <ul className="info-list">
                <li>No active token yet.</li>
                <li>Use the demo credentials to generate a JWT.</li>
                <li>The token is validated on reload and expires after one hour.</li>
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
