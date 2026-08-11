import { createContext, useContext, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

const STORAGE_KEY = 'rbac-demo-user'
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

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = window.localStorage.getItem(STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = ({ username, password }) => {
    const match = DEMO_USERS.find((candidate) => candidate.username === username && candidate.password === password)

    if (!match) {
      return { success: false, error: 'Use one of the demo credentials shown below.' }
    }

    const authenticatedUser = {
      username: match.username,
      role: match.role,
      name: match.name,
      summary: match.summary,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
    return { success: true }
  }

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const hasAccess = (requiredRole) => {
    if (!user) return false
    return ROLE_LEVEL[user.role] >= ROLE_LEVEL[requiredRole]
  }

  const value = useMemo(
    () => ({ user, login, logout, hasAccess }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

function ProtectedRoute({ requiredRole }) {
  const { user, hasAccess } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasAccess(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RBAC Authorization Demo</p>
          <h1>Role-driven access control</h1>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/content">Content</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          {user ? (
            <button className="ghost-button" onClick={logout}>Log out</button>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

function HomePage() {
  const { user } = useAuth()

  return (
    <section className="card">
      <h2>What this demo shows</h2>
      <p>Authentication confirms who the user is, while authorization decides what routes and UI actions are available.</p>
      <div className="info-grid">
        <div>
          <h3>Protected routes</h3>
          <p>Viewer, editor, and admin pages respond to different permission levels.</p>
        </div>
        <div>
          <h3>Dynamic UI</h3>
          <p>Buttons and page sections appear only when the current role is allowed to use them.</p>
        </div>
      </div>
      {user ? (
        <p className="status-pill">Signed in as {user.name} ({user.role})</p>
      ) : (
        <p className="status-pill muted">No active session yet.</p>
      )}
    </section>
  )
}

function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = login(form)

    if (result.success) {
      navigate(location.state?.from?.pathname || '/dashboard')
    } else {
      setError(result.error)
    }

    setIsSubmitting(false)
  }

  return (
    <section className="card login-card">
      <h2>Sign in with a demo role</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Username
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="admin" />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="admin123" />
        </label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Log in'}</button>
      </form>
      <div className="credential-list">
        <h3>Demo accounts</h3>
        <ul>
          <li><strong>admin</strong> / admin123</li>
          <li><strong>editor</strong> / editor123</li>
          <li><strong>viewer</strong> / viewer123</li>
        </ul>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}

function DashboardPage() {
  const { user, hasAccess } = useAuth()

  return (
    <section className="card">
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}. Your role is <strong>{user.role}</strong>.</p>
      <p className="summary">{user.summary}</p>
      <div className="button-row">
        <button type="button">View reports</button>
        {hasAccess('editor') ? <button type="button">Publish update</button> : null}
        {hasAccess('admin') ? <button type="button">Manage users</button> : null}
      </div>
    </section>
  )
}

function ContentPage() {
  const { user, hasAccess } = useAuth()

  return (
    <section className="card">
      <h2>Content management</h2>
      <p>This page is restricted to editors and admins.</p>
      <p className="summary">Current role: {user.role}</p>
      {hasAccess('editor') ? (
        <div className="action-panel">
          <button type="button">Save draft</button>
          <button type="button">Approve content</button>
        </div>
      ) : (
        <p className="error-text">You need editor-level access to use content tools.</p>
      )}
    </section>
  )
}

function SettingsPage() {
  const { user } = useAuth()

  return (
    <section className="card">
      <h2>System settings</h2>
      <p>This area is reserved for administrators.</p>
      <p className="summary">Signed in as {user.name}</p>
      <div className="action-panel">
        <button type="button">Create role policy</button>
        <button type="button">Audit activity</button>
      </div>
    </section>
  )
}

function UnauthorizedPage() {
  return (
    <section className="card">
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
      <p className="error-text">Please sign in with a higher-privilege role or return to the dashboard.</p>
    </section>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute requiredRole="viewer" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="editor" />}>
            <Route path="/content" element={<ContentPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
