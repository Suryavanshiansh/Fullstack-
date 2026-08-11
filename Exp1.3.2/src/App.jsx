import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'combined-auth-demo-token'
const ROLE_LEVEL = {
  viewer: 1,
  editor: 2,
  admin: 3,
}

const DEMO_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Ava Chen', summary: 'Full access to the platform.' },
  { username: 'editor', password: 'editor123', role: 'editor', name: 'Ben Ortiz', summary: 'Can publish and manage content.' },
  { username: 'viewer', password: 'viewer123', role: 'viewer', name: 'Cara Singh', summary: 'Has read-only access.' },
]

function encodeBase64(value) {
  return window.btoa(unescape(encodeURIComponent(value)))
}

function decodeBase64(value) {
  return decodeURIComponent(escape(window.atob(value)))
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
    return JSON.parse(decodeBase64(parts[1]))
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
  const [activeView, setActiveView] = useState('overview')

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

    setStatus(`Signed in as ${payload.name || payload.sub} with the ${payload.role} role.`)
  }, [token])

  const profile = useMemo(() => (token ? parseJwt(token) : null), [token])
  const role = profile?.role || 'guest'
  const isAuthenticated = Boolean(profile)

  const hasAccess = (requiredRole) => ROLE_LEVEL[role] >= ROLE_LEVEL[requiredRole]

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    await new Promise((resolve) => window.setTimeout(resolve, 700))

    const matchedUser = DEMO_USERS.find(
      (candidate) => candidate.username === username.trim() && candidate.password === password,
    )

    if (matchedUser) {
      const newToken = createMockJwt(matchedUser)
      setToken(newToken)
      window.localStorage.setItem(STORAGE_KEY, newToken)
      setStatus(`Authentication succeeded. JWT stored and role ${matchedUser.role} is active.`)
      setActiveView('overview')
    } else {
      setError('Invalid credentials. Try admin / admin123, editor / editor123, or viewer / viewer123.')
    }

    setIsLoading(false)
  }

  const handleLogout = () => {
    setToken('')
    window.localStorage.removeItem(STORAGE_KEY)
    setPassword('')
    setError('')
    setStatus('You have been logged out. Tokens are cleared from storage.')
    setActiveView('overview')
  }

  const navItems = [
    { key: 'overview', label: 'Overview', requiredRole: 'viewer' },
    { key: 'dashboard', label: 'Dashboard', requiredRole: 'viewer' },
    { key: 'content', label: 'Content', requiredRole: 'editor' },
    { key: 'settings', label: 'Settings', requiredRole: 'admin' },
  ]

  const renderPanel = () => {
    if (activeView === 'dashboard') {
      if (!isAuthenticated) {
        return (
          <section className="view-card">
            <h2>Dashboard</h2>
            <p>Please sign in to see your dashboard.</p>
          </section>
        )
      }

      if (!hasAccess('viewer')) {
        return (
          <section className="view-card">
            <h2>Access denied</h2>
            <p>You do not have permission to open this area.</p>
          </section>
        )
      }

      return (
        <section className="view-card">
          <h2>Dashboard</h2>
          <p>Welcome, {profile.name}. Your role is <strong>{profile.role}</strong>.</p>
          <p className="summary">{DEMO_USERS.find((user) => user.username === profile.sub)?.summary}</p>
          <div className="button-row">
            <button type="button">View reports</button>
            {hasAccess('editor') ? <button type="button">Publish update</button> : null}
            {hasAccess('admin') ? <button type="button">Manage users</button> : null}
          </div>
        </section>
      )
    }

    if (activeView === 'content') {
      if (!isAuthenticated) {
        return (
          <section className="view-card">
            <h2>Content</h2>
            <p>Sign in to manage content.</p>
          </section>
        )
      }

      if (!hasAccess('editor')) {
        return (
          <section className="view-card">
            <h2>Access denied</h2>
            <p>You need editor-level access to open the content tools.</p>
          </section>
        )
      }

      return (
        <section className="view-card">
          <h2>Content management</h2>
          <p>This section is protected by both JWT validation and RBAC rules.</p>
          <div className="button-row">
            <button type="button">Save draft</button>
            <button type="button">Approve content</button>
          </div>
        </section>
      )
    }

    if (activeView === 'settings') {
      if (!isAuthenticated) {
        return (
          <section className="view-card">
            <h2>Settings</h2>
            <p>Only authenticated admins can change policy.</p>
          </section>
        )
      }

      if (!hasAccess('admin')) {
        return (
          <section className="view-card">
            <h2>Access denied</h2>
            <p>Administrator access is required for system settings.</p>
          </section>
        )
      }

      return (
        <section className="view-card">
          <h2>System settings</h2>
          <p>This is the highest privilege area in the combined experience.</p>
          <div className="button-row">
            <button type="button">Create role policy</button>
            <button type="button">Audit activity</button>
          </div>
        </section>
      )
    }

    return (
      <section className="view-card">
        <h2>What this combined experience shows</h2>
        <p>Authentication confirms who the user is with a mock JWT, while authorization decides which views are available.</p>
        <div className="info-grid">
          <div>
            <h3>JWT session</h3>
            <p>Sign in to create and validate a token stored in local storage.</p>
          </div>
          <div>
            <h3>RBAC rules</h3>
            <p>Viewer, editor, and admin roles unlock different sections of the app.</p>
          </div>
        </div>
        <p className={`status-pill ${isAuthenticated ? 'success' : 'muted'}`}>
          {isAuthenticated ? `Signed in as ${profile.name} (${profile.role})` : 'No active session yet.'}
        </p>
      </section>
    )
  }

  return (
    <main className="app-shell">
      <section className="card">
        <div className="hero">
          <p className="eyebrow">Combined JWT + RBAC Demo</p>
          <h1>One unified authentication experience</h1>
          <p>Sign in with a mock JWT, inspect the decoded payload, and visit protected sections based on your role.</p>
        </div>

        <div className="topbar">
          <div className="nav-links">
            {navItems.map((item) => {
              const disabled = !isAuthenticated || !hasAccess(item.requiredRole)
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`nav-button ${activeView === item.key ? 'active' : ''}`}
                  onClick={() => setActiveView(item.key)}
                  disabled={disabled}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {isAuthenticated ? (
            <button type="button" className="ghost-button" onClick={handleLogout}>Log out</button>
          ) : (
            <span className="guest-badge">Guest</span>
          )}
        </div>

        <div className="grid">
          <div className="panel">
            {!isAuthenticated ? (
              <form onSubmit={handleLogin}>
                <label>
                  Username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin123" />
                </label>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Authenticating...' : 'Log in'}</button>
                <button type="button" className="secondary" onClick={() => { setUsername('admin'); setPassword('admin123') }}>
                  Fill demo credentials
                </button>
                {error ? <div className="error">{error}</div> : null}
              </form>
            ) : (
              <div>
                <h2>Welcome back</h2>
                <p>Your session is active and the JWT is attached to the browser state.</p>
                <button type="button" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Session status</h2>
            <p className={isAuthenticated ? 'success' : 'error'}>{status}</p>

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

        <div className="content-panel">{renderPanel()}</div>
      </section>
    </main>
  )
}

export default App
