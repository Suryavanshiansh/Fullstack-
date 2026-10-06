import { useEffect, useMemo, useState } from 'react';
import './App.css';

const initialUsers = [
  { id: 1, name: 'Ansh Suryavanshi', email: 'ansh@example.com', role: 'Admin', status: 'Active', lastActive: '2 min ago', initials: 'AS', color: 'sage' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Viewer', status: 'Active', lastActive: '18 min ago', initials: 'RS', color: 'coral' },
  { id: 3, name: 'Priya Singh', email: 'priya@example.com', role: 'Viewer', status: 'Active', lastActive: '1 hour ago', initials: 'PS', color: 'blue' },
  { id: 4, name: 'Maya Chen', email: 'maya@example.com', role: 'Viewer', status: 'Invited', lastActive: 'Never', initials: 'MC', color: 'gold' },
];

const initialPosts = [
  { id: 1, title: 'Security guidelines for Q4', excerpt: 'A few important updates to how we protect customer and company data this quarter.', author: 'Ansh Suryavanshi', date: 'Sep 24, 2026', status: 'Published', pinned: true, modified: 'Today, 10:32 AM' },
  { id: 2, title: 'Company announcement', excerpt: 'We are bringing the product and operations teams together for our autumn planning week.', author: 'Ansh Suryavanshi', date: 'Sep 22, 2026', status: 'Published', pinned: true, modified: 'Today, 10:14 AM' },
  { id: 3, title: 'Product launch checklist', excerpt: 'The final review list for next month’s workspace release.', author: 'Priya Singh', date: 'Sep 19, 2026', status: 'Draft', pinned: false, modified: 'Yesterday, 4:18 PM' },
  { id: 4, title: 'August team notes', excerpt: 'Highlights, decisions, and follow-ups from the monthly team meeting.', author: 'Rahul Sharma', date: 'Sep 02, 2026', status: 'Archived', pinned: false, modified: 'Sep 03, 2026' },
];

const initialActivity = [
  { id: 1, user: 'Ansh Suryavanshi', initials: 'AS', color: 'sage', action: 'created', object: 'Company announcement', time: '10:32 AM', type: 'Posts' },
  { id: 2, user: 'Rahul Sharma', initials: 'RS', color: 'coral', action: 'viewed', object: 'Security guidelines for Q4', time: '10:28 AM', type: 'Posts' },
  { id: 3, user: 'Ansh Suryavanshi', initials: 'AS', color: 'sage', action: 'changed Rahul Sharma’s role', object: 'Viewer → Admin', time: '10:21 AM', type: 'Permissions' },
  { id: 4, user: 'Ansh Suryavanshi', initials: 'AS', color: 'sage', action: 'published', object: 'Security guidelines for Q4', time: '9:54 AM', type: 'Posts' },
  { id: 5, user: 'Priya Singh', initials: 'PS', color: 'blue', action: 'signed in from a new device', object: 'Chrome · macOS', time: '9:16 AM', type: 'Security' },
];

const access = {
  Admin: ['viewPosts', 'createPosts', 'editPosts', 'deletePosts', 'manageUsers', 'changeRoles', 'viewActivity', 'manageSettings'],
  Viewer: ['viewPosts', 'searchPosts'],
};

function can(role, permission) {
  return access[role]?.includes(permission) ?? false;
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    activity: <><path d="M3 12h4l3-9 4 18 3-9h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    pin: <><path d="m16 3 5 5-4 1-4 4-1 4-2-2-4 4-1-1 4-4-2-2 4-1 4-4z"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.grid}</svg>;
}

function Avatar({ initials, color = 'sage', small = false }) {
  return <span className={`avatar avatar-${color} ${small ? 'avatar-small' : ''}`} aria-hidden="true">{initials}</span>;
}

function App() {
  const [role, setRole] = useState(null);
  const [loginRole, setLoginRole] = useState('Admin');
  const [email, setEmail] = useState('ansh@example.com');
  const [password, setPassword] = useState('workspace');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [page, setPage] = useState('Dashboard');
  const [users, setUsers] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [activity, setActivity] = useState(initialActivity);
  const [query, setQuery] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All activity');
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);

  const currentUser = role === 'Admin' ? initialUsers[0] : initialUsers[1];
  const navigation = [
    { name: 'Dashboard', icon: 'grid' },
    ...(can(role, 'manageUsers') ? [{ name: 'Users', icon: 'users' }] : []),
    { name: 'Posts', icon: 'file' },
    ...(can(role, 'viewActivity') ? [{ name: 'Activity', icon: 'activity' }] : []),
    { name: 'Settings', icon: 'settings' },
    ...(can(role, 'manageSettings') ? [{ name: 'Roles', icon: 'shield' }] : []),
  ];

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDialog(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog]);

  function addActivity(action, object, type = 'Posts') {
    setActivity((items) => [{ id: Date.now(), user: currentUser?.name || 'Ansh Suryavanshi', initials: currentUser?.initials || 'AS', color: currentUser?.color || 'sage', action, object, time: 'Just now', type }, ...items]);
  }

  function signIn(event) {
    event.preventDefault();
    setLoginError('');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLoginError('Enter a valid work email to continue.');
      return;
    }
    if (!password.trim()) {
      setLoginError('Enter your password to continue.');
      return;
    }
    setLoggingIn(true);
    window.setTimeout(() => {
      setRole(loginRole);
      setPage('Dashboard');
      setLoggingIn(false);
      setQuery('');
    }, 500);
  }

  function signOut() {
    setRole(null);
    setPage('Dashboard');
    setDialog(null);
    setLoginError('');
    setEmail('ansh@example.com');
    setPassword('workspace');
    setToast('');
  }

  function goTo(nextPage) {
    if (!navigation.some((item) => item.name === nextPage)) {
      setDialog({ type: 'permission' });
      return;
    }
    setPage(nextPage);
    setMobileNavOpen(false);
    setQuery('');
    setUserMenu(null);
  }

  function savePost(event) {
    event.preventDefault();
    if (!can(role, 'createPosts') && !can(role, 'editPosts')) return setDialog({ type: 'permission' });
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title')).trim();
    if (!title) return;
    const postData = { title, excerpt: String(form.get('excerpt')).trim(), status: String(form.get('status')), author: currentUser.name, date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), modified: 'Just now', pinned: false };
    if (dialog.post) {
      setPosts((items) => items.map((post) => post.id === dialog.post.id ? { ...post, ...postData } : post));
      addActivity('updated', title);
      setToast('Post changes saved');
    } else {
      setPosts((items) => [{ ...postData, id: Date.now() }, ...items]);
      addActivity('created', title);
      setToast('Post created');
    }
    setDialog(null);
  }

  function confirmDelete() {
    if (dialog.type === 'delete-post') {
      setPosts((items) => items.filter((item) => item.id !== dialog.post.id));
      addActivity('deleted', dialog.post.title);
      setToast('Post deleted');
    } else if (dialog.type === 'delete-user') {
      setUsers((items) => items.filter((item) => item.id !== dialog.user.id));
      addActivity('removed', dialog.user.name, 'Users');
      setToast('Member removed');
    }
    setDialog(null);
  }

  function updateUser(user, operation) {
    if (!can(role, 'manageUsers')) return setDialog({ type: 'permission' });
    if (operation === 'delete') return setDialog({ type: 'delete-user', user });
    if (operation === 'role') {
      const nextRole = user.role === 'Admin' ? 'Viewer' : 'Admin';
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, role: nextRole } : item));
      addActivity(`changed ${user.name}’s role`, `${user.role} → ${nextRole}`, 'Permissions');
      setToast(`${user.name} is now a ${nextRole.toLowerCase()}`);
    } else {
      const status = user.status === 'Active' ? 'Deactivated' : 'Active';
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, status } : item));
      addActivity(`${status.toLowerCase()} ${user.name}`, 'Workspace access', 'Users');
      setToast(`${user.name} ${status.toLowerCase()}`);
    }
    setUserMenu(null);
  }

  function updatePost(post, operation) {
    if (!can(role, operation === 'delete' ? 'deletePosts' : 'editPosts')) return setDialog({ type: 'permission' });
    if (operation === 'delete') return setDialog({ type: 'delete-post', post });
    if (operation === 'edit') return setDialog({ type: 'post-form', post });
    if (operation === 'duplicate') {
      setPosts((items) => [{ ...post, id: Date.now(), title: `${post.title} (copy)`, status: 'Draft', pinned: false, modified: 'Just now' }, ...items]);
      addActivity('duplicated', post.title);
      setToast('Draft duplicated');
      return;
    }
    let message = '';
    setPosts((items) => items.map((item) => {
      if (item.id !== post.id) return item;
      if (operation === 'publish' || operation === 'unpublish') {
        const status = operation === 'publish' ? 'Published' : 'Draft';
        message = status === 'Published' ? 'Post published' : 'Post moved to drafts';
        return { ...item, status, modified: 'Just now' };
      }
      if (operation === 'pin') {
        message = item.pinned ? 'Post unpinned' : 'Post pinned';
        return { ...item, pinned: !item.pinned };
      }
      message = 'Post archived';
      return { ...item, status: 'Archived', pinned: false };
    }));
    addActivity(operation === 'pin' ? 'updated pin status for' : `${operation}ed`, post.title);
    setToast(message);
  }

  const filteredPosts = useMemo(() => posts.filter((post) => `${post.title} ${post.excerpt} ${post.author}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (userFilter === 'All' || user.role === userFilter.slice(0, -1));
  });
  const filteredActivity = activity.filter((item) => (activityFilter === 'All activity' || item.type === activityFilter) && `${item.user} ${item.action} ${item.object}`.toLowerCase().includes(query.toLowerCase()));

  if (!role) return <LoginScreen {...{ loginRole, setLoginRole, email, setEmail, password, setPassword, showPassword, setShowPassword, remember, setRemember, loginError, loggingIn, signIn }} />;

  return (
    <div className="workspace-shell">
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <button className="brand-lockup" onClick={() => goTo('Dashboard')} aria-label="AccessOS dashboard"><span className="brand-mark"><Icon name="shield" size={20} /></span><span>access<span className="brand-light">os</span></span></button>
        <div className="workspace-switch"><span className="workspace-avatar">N</span><span className="workspace-name">Northstar Studio<small>Workspace</small></span><span className="switch-chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation.map((item) => <button key={item.name} className={`nav-item ${page === item.name ? 'nav-active' : ''}`} onClick={() => goTo(item.name)}><Icon name={item.icon} size={17} /><span>{item.name}</span>{item.name === 'Activity' && <span className="nav-count">5</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className={`role-panel role-${role.toLowerCase()}`}><span className="role-panel-icon"><Icon name={role === 'Admin' ? 'shield' : 'eye'} size={16} /></span><div><strong>{role.toUpperCase()}</strong><small>{role === 'Admin' ? 'Full workspace access' : 'Read-only access'}</small></div><span className="role-dot" /></div>
          <div className="sidebar-profile"><Avatar initials={currentUser.initials} color={currentUser.color} /><div className="profile-text"><strong>{currentUser.name}</strong><span>{currentUser.email}</span></div><button className="icon-button profile-menu" aria-label="Sign out" title="Sign out" onClick={signOut}><Icon name="logout" size={17} /></button></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><span className="hamburger" /></button>
          <div className="breadcrumbs"><span>Northstar Studio</span><span className="crumb-slash">/</span><strong>{page}</strong></div>
          <div className="topbar-actions"><label className="search-box"><Icon name="search" size={17} /><input aria-label="Search workspace" placeholder="Search anything..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast('You’re all caught up')}><Icon name="bell" size={18} /><span /></button><span className="topbar-divider" /><Avatar initials={currentUser.initials} color={currentUser.color} small /></div>
        </header>
        <div className="page-content" key={page}>
          {page === 'Dashboard' && <Dashboard {...{ role, currentUser, users, posts, query, goTo, setDialog, updatePost }} />}
          {page === 'Users' && <UsersPage {...{ users: filteredUsers, userFilter, setUserFilter, updateUser, userMenu, setUserMenu, setDialog }} />}
          {page === 'Posts' && <PostsPage {...{ role, posts: filteredPosts, query, setDialog, updatePost }} />}
          {page === 'Activity' && <ActivityPage {...{ activity: filteredActivity, activityFilter, setActivityFilter }} />}
          {page === 'Roles' && <RolesPage />}
          {page === 'Settings' && <SettingsPage {...{ role, setDialog, setToast }} />}
        </div>
        <footer className="shell-footer"><span>AccessOS <span className="footer-dot">·</span> Workspace access, made clear.</span><span>Prototype environment</span></footer>
      </main>

      {dialog && <Dialog {...{ dialog, setDialog, savePost, confirmDelete, setToast, signOut }} />}
      {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function LoginScreen(props) {
  const { loginRole, setLoginRole, email, setEmail, password, setPassword, showPassword, setShowPassword, remember, setRemember, loginError, loggingIn, signIn } = props;
  return <main className="login-page">
    <div className="login-brand"><span className="brand-mark"><Icon name="shield" size={20} /></span><span>access<span className="brand-light">os</span></span><span className="brand-product">WORKSPACE CONTROL</span></div>
    <section className="login-story"><div className="story-kicker"><span /> ACCESS, WITH INTENTION</div><h1>Control access.<br /><em>Without the</em><br />complexity.</h1><p>Manage people, content, and permissions from one considered workspace.</p><div className="story-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="visual-center"><Icon name="shield" size={30} /></div><span className="visual-node node-a"><Icon name="users" size={17} /></span><span className="visual-node node-b"><Icon name="file" size={16} /></span><span className="visual-node node-c"><Icon name="check" size={16} /></span><span className="visual-caption">EVERY ROLE, IN ITS PLACE</span></div><div className="login-trust"><span><Icon name="lock" size={14} /> PRIVATE BY DESIGN</span><span>01 — 03</span></div></section>
    <section className="login-side"><form className="login-card" onSubmit={signIn} noValidate>
      <div className="login-card-top"><span className="eyebrow">SECURE WORKSPACE</span><span className="login-status"><span /> SYSTEM OPERATIONAL</span></div>
      <h2>Welcome back</h2><p className="login-description">Sign in to continue to your workspace.</p>
      <label className="form-label" htmlFor="login-email">Email or username</label><div className="login-input-wrap"><span className="field-icon">@</span><input id="login-email" type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
      <label className="form-label password-label" htmlFor="login-password">Password</label><div className="login-input-wrap"><span className="field-icon"><Icon name="lock" size={16} /></span><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} /></button></div>
      <label className="form-label role-label" htmlFor="login-role">Role</label><div className="role-select-wrap"><Icon name="shield" size={16} /><select id="login-role" value={loginRole} onChange={(event) => { const nextRole = event.target.value; setLoginRole(nextRole); setEmail(nextRole === 'Admin' ? 'ansh@example.com' : 'rahul@example.com'); }}><option>Admin</option><option>Viewer</option></select><span className="select-arrow">⌄</span></div>
      <div className="login-options"><label className="remember-check"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check"><Icon name="check" size={12} /></span>Remember me</label><button type="button" className="text-button" onClick={() => window.alert('Contact your workspace administrator to reset your password.')}>Forgot password?</button></div>
      {loginError && <div className="login-error" role="alert">{loginError}</div>}
      <button type="submit" className="button button-primary signin-button" disabled={loggingIn}>{loggingIn ? <><span className="button-spinner" /> Signing in...</> : <>Sign in <Icon name="arrow" size={16} /></>}</button>
      <div className="login-card-foot"><span><Icon name="lock" size={13} /> Protected workspace</span><span>Role-based access</span></div>
    </form><div className="login-side-note">NEED ACCESS? <a href="mailto:admin@example.com">Contact your administrator <Icon name="external" size={12} /></a></div></section>
    <div className="login-bottom"><span>© 2026 AccessOS</span><span>PRIVACY <i /> TERMS <i /> STATUS</span></div>
  </main>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow heading-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}

function Dashboard({ role, currentUser, users, posts, query, goTo, setDialog, updatePost }) {
  const isAdmin = role === 'Admin';
  const published = posts.filter((post) => post.status === 'Published');
  const visiblePosts = posts.filter((post) => post.status === 'Published' && `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading eyebrow={isAdmin ? 'WORKSPACE OVERVIEW' : 'YOUR WORKSPACE'} title={isAdmin ? 'Good morning, Ansh' : 'Welcome back, Rahul'} description={isAdmin ? 'Here’s what’s happening across your workspace.' : 'A clear view of what’s new in your workspace.'} action={<><span className={`badge ${isAdmin ? 'badge-admin' : 'badge-viewer'}`}><span />{role.toUpperCase()}</span>{!isAdmin && <span className="readonly-label"><Icon name="lock" size={13} /> Read-only access</span>}</>} />
    {isAdmin ? <>
      <section className="metric-grid" aria-label="Workspace statistics"><Metric label="TOTAL USERS" value={users.length === 4 ? '24' : String(20 + users.length)} trend="+8% this month" icon="users" tone="olive"/><Metric label="ADMINS" value={String(users.filter((user) => user.role === 'Admin').length === 1 ? 3 : users.filter((user) => user.role === 'Admin').length)} trend="Workspace owners" icon="shield" tone="blue"/><Metric label="VIEWERS" value={String(users.filter((user) => user.role === 'Viewer').length === 3 ? 21 : users.filter((user) => user.role === 'Viewer').length)} trend="Read-only members" icon="eye" tone="coral"/><Metric label="TOTAL POSTS" value={String(44 + posts.length)} trend="+12% this month" icon="file" tone="gold"/></section>
      <section className="dashboard-grid"><div className="content-panel quick-actions-panel"><div className="section-heading"><div><span className="eyebrow">MAKE SOMETHING HAPPEN</span><h2>Quick actions</h2></div><span className="panel-count">04</span></div><div className="quick-actions"><button onClick={() => setDialog({ type: 'add-user' })}><span className="quick-icon quick-sage"><Icon name="users" size={17} /></span><span><strong>Add a member</strong><small>Invite someone to your workspace</small></span><Icon name="arrow" size={16} /></button><button onClick={() => setDialog({ type: 'post-form' })}><span className="quick-icon quick-blue"><Icon name="plus" size={17} /></span><span><strong>Create a post</strong><small>Share an update with your team</small></span><Icon name="arrow" size={16} /></button><button onClick={() => goTo('Roles')}><span className="quick-icon quick-gold"><Icon name="shield" size={17} /></span><span><strong>Manage permissions</strong><small>Review access across roles</small></span><Icon name="arrow" size={16} /></button><button onClick={() => goTo('Activity')}><span className="quick-icon quick-coral"><Icon name="activity" size={17} /></span><span><strong>View activity</strong><small>See recent workspace changes</small></span><Icon name="arrow" size={16} /></button></div></div>
      <div className="content-panel activity-overview"><div className="section-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent activity</h2></div><button className="inline-link" onClick={() => goTo('Activity')}>View all <Icon name="arrow" size={14} /></button></div><ActivityFeed items={initialActivity.slice(0, 4)} compact /></div></section>
      <section className="content-panel recent-posts-panel"><div className="section-heading"><div><span className="eyebrow">PUBLISHED CONTENT</span><h2>Recent posts</h2></div><button className="inline-link" onClick={() => goTo('Posts')}>All posts <Icon name="arrow" size={14} /></button></div><div className="mini-post-list">{published.slice(0, 3).map((post) => <button className="mini-post" key={post.id} onClick={() => setDialog({ type: 'post-detail', post })}><span className="post-marker" /><span className="mini-post-main"><strong>{post.title}</strong><small>{post.author} <i /> {post.date}</small></span><StatusBadge status={post.status}/><Icon name="arrow" size={15} /></button>)}{published.length === 0 && <EmptyState title="No published posts" description="Published updates will appear here."/>}</div></section>
    </> : <>
      <div className="viewer-welcome"><div><span className="welcome-mark"><Icon name="file" size={20}/></span><div><strong>Your team, in the loop.</strong><span>{published.length} updates published for your workspace</span></div></div><span className="viewer-readonly"><Icon name="lock" size={14}/> READ ONLY</span></div>
      <section className="viewer-post-layout"><div className="content-panel viewer-posts-panel"><div className="section-heading"><div><span className="eyebrow">LATEST FROM YOUR TEAM</span><h2>Recent posts</h2></div><button className="inline-link" onClick={() => goTo('Posts')}>Browse all <Icon name="arrow" size={14} /></button></div>{visiblePosts.length ? <div className="viewer-post-list">{visiblePosts.map((post) => <PostArticle key={post.id} post={post} onOpen={() => setDialog({ type: 'post-detail', post })}/>)}</div> : <EmptyState title="Nothing published yet" description="When your team shares an update, it will show up here."/>}</div><aside className="viewer-rail"><div className="content-panel pinned-panel"><span className="eyebrow"><Icon name="pin" size={13}/> PINNED FOR YOU</span>{posts.filter((post) => post.pinned && post.status === 'Published').map((post) => <button className="pinned-link" key={post.id} onClick={() => setDialog({ type: 'post-detail', post })}>{post.title}<span>{post.date}</span></button>)}</div><div className="read-notice"><span><Icon name="shield" size={17}/></span><strong>Read-only access</strong><p>You can read and search workspace posts. An admin can help with anything else.</p><button onClick={() => setDialog({ type: 'permission' })}>About permissions <Icon name="arrow" size={13}/></button></div></aside></section>
    </>}
  </>;
}

function Metric({ label, value, trend, icon, tone }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon metric-${tone}`}><Icon name={icon} size={16}/></span></div><strong className="metric-value">{value}</strong><div className="metric-foot"><span className="metric-trend">↗</span>{trend}</div><span className="metric-index">/ {String(['TOTAL USERS', 'ADMINS', 'VIEWERS', 'TOTAL POSTS'].indexOf(label) + 1).padStart(2, '0')}</span></article>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span/>{status}</span>;
}

function RoleBadge({ role }) {
  return <span className={`role-badge role-badge-${role.toLowerCase()}`}><span/>{role}</span>;
}

function ActivityFeed({ items, compact = false }) {
  return <div className={`activity-feed ${compact ? 'activity-feed-compact' : ''}`}>{items.map((item) => <div className="activity-row" key={item.id}><Avatar initials={item.initials} color={item.color} small/><div className="activity-copy"><p><strong>{item.user}</strong> {item.action} <b>{item.object}</b></p><span>{item.time} <i/> {item.type}</span></div><span className="activity-marker"/></div>)}</div>;
}

function UsersPage({ users, userFilter, setUserFilter, updateUser, userMenu, setUserMenu, setDialog }) {
  return <><PageHeading eyebrow="PEOPLE & ACCESS" title="Users" description="Manage workspace members and their access levels." action={<button className="button button-primary" onClick={() => setDialog({ type: 'add-user' })}><Icon name="plus" size={16}/> Add user</button>}/><div className="users-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter users">{['All', 'Admins', 'Viewers'].map((filter) => <button key={filter} role="tab" aria-selected={userFilter === filter} className={userFilter === filter ? 'filter-active' : ''} onClick={() => setUserFilter(filter)}>{filter}<span>{filter === 'All' ? '24' : filter === 'Admins' ? '3' : '21'}</span></button>)}</div><span className="results-count">Showing {users.length} members</span></div><div className="content-panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last active</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="user-cell"><Avatar initials={user.initials} color={user.color}/><span><strong>{user.name}</strong><a href={`mailto:${user.email}`}>{user.email}</a></span></div></td><td><RoleBadge role={user.role}/></td><td><StatusBadge status={user.status}/></td><td className="last-active">{user.lastActive}</td><td className="action-cell"><button className="icon-button row-more" aria-label={`Actions for ${user.name}`} aria-expanded={userMenu === user.id} onClick={() => setUserMenu(userMenu === user.id ? null : user.id)}><Icon name="dots"/></button>{userMenu === user.id && <div className="action-menu"><button onClick={() => setDialog({ type: 'edit-user', user })}>Edit user</button><button onClick={() => updateUser(user, 'role')}>Change role to {user.role === 'Admin' ? 'Viewer' : 'Admin'}</button><button onClick={() => updateUser(user, 'deactivate')}>{user.status === 'Active' ? 'Deactivate' : 'Reactivate'}</button><button className="danger-menu-item" onClick={() => updateUser(user, 'delete')}>Remove user</button></div>}</td></tr>)}</tbody></table>{users.length === 0 && <EmptyState title="No members found" description="Try adjusting your search or member filter."/>}</div><div className="table-footer"><span>Workspace members</span><span>Showing {users.length} of {users.length === 4 ? 24 : users.length}</span></div></div><p className="permission-footnote"><Icon name="lock" size={13}/> Role changes take effect immediately in this prototype.</p></>;
}

function PostsPage({ role, posts, query, setDialog, updatePost }) {
  const isAdmin = role === 'Admin';
  const [filter, setFilter] = useState('All posts');
  const shown = posts.filter((post) => filter === 'All posts' || post.status === filter.slice(0, -1));
  return <><PageHeading eyebrow={isAdmin ? 'CONTENT MANAGEMENT' : 'TEAM UPDATES'} title={isAdmin ? 'Posts' : 'Workspace posts'} description={isAdmin ? 'Create, publish, and organize workspace updates.' : 'Read updates shared by your team.'} action={isAdmin ? <button className="button button-primary" onClick={() => setDialog({ type: 'post-form' })}><Icon name="plus" size={16}/> Create post</button> : <span className="readonly-label"><Icon name="lock" size={13}/> Read-only access</span>}/><div className="posts-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter posts">{['All posts', 'Published', 'Drafts', 'Archived'].map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="results-count">{shown.length} {query ? 'matching' : 'total'}</span></div><div className="content-panel posts-table-panel"><div className="table-scroll"><table className="data-table posts-table"><thead><tr><th>Post</th><th>Status</th><th>Author</th><th>Last modified</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{shown.map((post) => <tr key={post.id}><td><button className="post-title-cell" onClick={() => setDialog({ type: 'post-detail', post })}><strong>{post.pinned && <Icon name="pin" size={13}/>} {post.title}</strong><span>{post.date}</span></button></td><td><StatusBadge status={post.status}/></td><td className="author-cell">{post.author}</td><td className="last-active">{post.modified}</td><td className="action-cell">{isAdmin ? <div className="inline-post-actions"><button aria-label={`Edit ${post.title}`} title="Edit" onClick={() => updatePost(post, 'edit')}>Edit</button><button className="icon-button row-more" aria-label={`More actions for ${post.title}`} onClick={() => setDialog({ type: 'post-actions', post })}><Icon name="dots"/></button></div> : <button className="icon-button row-more" aria-label={`Read ${post.title}`} onClick={() => setDialog({ type: 'post-detail', post })}><Icon name="arrow" size={15}/></button>}</td></tr>)}</tbody></table>{shown.length === 0 && <EmptyState title="No posts found" description={isAdmin ? 'Create your first post to get the conversation started.' : 'Nothing has been published yet.'} action={isAdmin ? <button className="button button-primary" onClick={() => setDialog({ type: 'post-form' })}><Icon name="plus" size={15}/> Create post</button> : null}/>}</div><div className="table-footer"><span>{isAdmin ? 'Workspace content' : 'Published workspace content'}</span><span>{shown.length} posts</span></div></div></>;
}

function PostArticle({ post, onOpen }) {
  return <article className="post-article"><div className="post-article-meta"><span><Avatar initials={post.author.split(' ').map((part) => part[0]).slice(0, 2).join('')} small/> {post.author}</span><span>{post.date}</span></div><button className="article-title" onClick={onOpen}>{post.pinned && <Icon name="pin" size={14}/>} {post.title}</button><p>{post.excerpt}</p><button className="article-read-more" onClick={onOpen}>Read update <Icon name="arrow" size={14}/></button></article>;
}

function ActivityPage({ activity, activityFilter, setActivityFilter }) {
  return <><PageHeading eyebrow="WORKSPACE HISTORY" title="Activity" description="A transparent record of changes across your workspace." action={<span className="live-indicator"><span/> LIVE LOG</span>}/><div className="activity-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter activity">{['All activity', 'Users', 'Posts', 'Permissions', 'Security'].map((item) => <button key={item} role="tab" aria-selected={activityFilter === item} className={activityFilter === item ? 'filter-active' : ''} onClick={() => setActivityFilter(item)}>{item}</button>)}</div><span className="results-count">Today <span className="calendar-mark">⌄</span></span></div><div className="content-panel audit-panel"><div className="audit-date"><span>MONDAY, SEPTEMBER 29</span><span>{activity.length} EVENTS</span></div>{activity.length ? <ActivityFeed items={activity}/> : <EmptyState title="No activity here" description="Try another activity filter."/>}</div><p className="audit-note"><Icon name="shield" size={14}/> Activity is visible to workspace administrators.</p></>;
}

function RolesPage() {
  const adminPerms = ['View posts', 'Create posts', 'Edit posts', 'Delete posts', 'Manage users', 'Change roles', 'View activity', 'Manage settings'];
  const viewerPerms = ['View posts', 'Search posts'];
  return <><PageHeading eyebrow="ACCESS CONTROL" title="Roles & permissions" description="Understand exactly what each role can do in this workspace."/><div className="role-comparison"><RoleCard name="Admin" description="Full workspace control" detail="For people responsible for the workspace and its members." permissions={adminPerms} accent="admin"/><RoleCard name="Viewer" description="Read-only workspace access" detail="For people who need visibility into published team updates." permissions={viewerPerms} accent="viewer"/></div><div className="content-panel permissions-note"><span className="permissions-note-icon"><Icon name="lock" size={18}/></span><div><strong>Permissions are enforced by role</strong><p>Changing a member’s role immediately changes which workspace tools are available to them.</p></div><span className="badge badge-admin"><span/> ACTIVE POLICY</span></div><p className="prototype-note">UI permissions are demonstrative. Production authorization must be enforced server-side.</p></>;
}

function RoleCard({ name, description, detail, permissions, accent }) {
  const adminOnly = ['Create posts', 'Edit posts', 'Delete posts', 'Manage users', 'Change roles', 'View activity', 'Manage settings'];
  return <section className={`content-panel role-card role-card-${accent}`}><div className="role-card-head"><span className={`role-card-icon role-card-icon-${accent}`}><Icon name={accent === 'admin' ? 'shield' : 'eye'} size={19}/></span><RoleBadge role={name}/><span className="role-status">{accent === 'admin' ? 'Elevated access' : 'Limited access'}</span></div><h2>{name}</h2><h3>{description}</h3><p>{detail}</p><div className="permission-list-heading">PERMISSIONS <span>{permissions.length} ENABLED</span></div><ul className="permission-list">{(accent === 'admin' ? adminPerms : [...viewerPerms, ...adminOnly]).map((permission) => { const enabled = permissions.includes(permission); return <li key={permission} className={enabled ? '' : 'permission-disabled'}><span className={enabled ? 'permission-check' : 'permission-empty'}>{enabled ? <Icon name="check" size={12}/> : <Icon name="close" size={12}/>}</span>{permission}{!enabled && <span className="permission-denied">ADMIN ONLY</span>}</li>; })}</ul></section>;
}

function SettingsPage({ role, setDialog, setToast }) {
  const admin = role === 'Admin';
  return <><PageHeading eyebrow="PREFERENCES" title="Settings" description="Manage your account and workspace preferences."/><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections">{['Profile', 'Security', 'Workspace', 'Notifications'].map((item, index) => <a className={index === 0 ? 'settings-link-active' : ''} href={`#${item.toLowerCase()}`} key={item}><Icon name={['users', 'lock', 'grid', 'bell'][index]} size={16}/>{item}</a>)}</nav><div className="settings-sections"><section className="content-panel settings-section" id="profile"><div className="settings-section-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h2>Profile</h2></div><button className="button button-secondary" onClick={() => setToast('Profile changes saved')}>Save changes</button></div><div className="profile-setting"><Avatar initials={admin ? 'AS' : 'RS'} color={admin ? 'sage' : 'coral'}/><div><strong>{admin ? 'Ansh Suryavanshi' : 'Rahul Sharma'}</strong><span>Profile photo</span></div><button className="text-button" onClick={() => setToast('Avatar upload is not enabled in this prototype')}>Change photo</button></div><div className="settings-fields"><label>Full name<input defaultValue={admin ? 'Ansh Suryavanshi' : 'Rahul Sharma'}/></label><label>Email address<input defaultValue={admin ? 'ansh@example.com' : 'rahul@example.com'} type="email"/></label><label>Workspace role<div className="setting-role"><RoleBadge role={role}/><span>{admin ? 'Full workspace access' : 'Read-only access'}</span></div></label></div></section><section className="content-panel settings-section" id="security"><div className="settings-section-heading"><div><span className="eyebrow">ACCOUNT PROTECTION</span><h2>Security</h2></div><span className="secure-pill"><Icon name="check" size={13}/> SECURE</span></div><SettingRow icon="lock" title="Password" detail="Last changed 28 days ago" action="Update" onClick={() => setDialog({ type: 'permission', message: 'Password updates are managed by your identity provider.' })}/><SettingRow icon="shield" title="Two-factor authentication" detail="Add an extra layer of protection" action="Enable" onClick={() => setToast('Two-factor authentication is not enabled in this prototype')}/></section>{admin && <section className="content-panel settings-section" id="workspace"><div className="settings-section-heading"><div><span className="eyebrow">ADMINISTRATOR</span><h2>Workspace</h2></div><RoleBadge role="Admin"/></div><SettingRow icon="users" title="Member access" detail="Review members and assigned roles" action="Manage users" onClick={() => window.dispatchEvent(new CustomEvent('accessos:navigate-users'))}/><SettingRow icon="shield" title="Role permissions" detail="Review capabilities for Admins and Viewers" action="Manage roles" onClick={() => window.dispatchEvent(new CustomEvent('accessos:navigate-roles'))}/></section>}<section className="content-panel settings-section" id="notifications"><div className="settings-section-heading"><div><span className="eyebrow">STAY INFORMED</span><h2>Notifications</h2></div></div><SettingRow icon="bell" title="Workspace updates" detail="Get notified when new posts are published" action={<input type="checkbox" defaultChecked aria-label="Enable workspace update notifications"/>}/><SettingRow icon="activity" title="Security alerts" detail="Sign-ins and account security changes" action={<input type="checkbox" defaultChecked aria-label="Enable security alerts"/>}/></section></div></div><p className="prototype-note">Changes in this prototype are stored only for the current session.</p></>;
}

function SettingRow({ icon, title, detail, action, onClick }) {
  return <div className="setting-row"><span className="setting-row-icon"><Icon name={icon} size={16}/></span><div><strong>{title}</strong><span>{detail}</span></div>{typeof action === 'string' ? <button className="button button-secondary setting-action" onClick={onClick}>{action}</button> : <span className="setting-action">{action}</span>}</div>;
}

function EmptyState({ title, description, action }) {
  return <div className="empty-state"><span className="empty-state-icon"><Icon name="file" size={19}/></span><strong>{title}</strong><p>{description}</p>{action}</div>;
}

function Dialog({ dialog, setDialog, savePost, confirmDelete, setToast, signOut }) {
  const post = dialog.post;
  let content;
  if (dialog.type === 'permission') content = <><div className="dialog-icon permission-dialog-icon"><Icon name="lock" size={21}/></div><span className="eyebrow">ACCESS RESTRICTION</span><h2>Admin permission required</h2><p>{dialog.message || 'Your account has read-only access to this workspace. An administrator can help you with this action.'}</p><div className="dialog-actions"><button className="button button-primary" onClick={() => setDialog(null)}>Got it</button></div></>;
  if (dialog.type === 'delete-post' || dialog.type === 'delete-user') content = <><div className="dialog-icon danger-dialog-icon"><Icon name="close" size={20}/></div><span className="eyebrow">CONFIRM REMOVAL</span><h2>{dialog.type === 'delete-post' ? 'Delete this post?' : 'Remove this member?'}</h2><p>{dialog.type === 'delete-post' ? <>“{post.title}” will be permanently removed. This action cannot be undone.</> : <>Remove {dialog.user.name} from this workspace? This action cannot be undone.</>}</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setDialog(null)}>Cancel</button><button className="button button-danger" onClick={confirmDelete}>{dialog.type === 'delete-post' ? 'Delete post' : 'Remove member'}</button></div></>;
  if (dialog.type === 'post-form') content = <><span className="eyebrow">WORKSPACE CONTENT</span><h2>{post ? 'Edit post' : 'Create a post'}</h2><p>{post ? 'Update this workspace post.' : 'Share an update with your workspace.'}</p><form className="dialog-form" onSubmit={savePost}><label>Title<input name="title" required defaultValue={post?.title || ''} placeholder="Give your post a clear title" autoFocus/></label><label>Summary<textarea name="excerpt" rows="4" defaultValue={post?.excerpt || ''} placeholder="What should your team know?"/></label><label>Visibility<select name="status" defaultValue={post?.status || 'Draft'}><option>Draft</option><option>Published</option></select></label><div className="dialog-actions"><button type="button" className="button button-secondary" onClick={() => setDialog(null)}>Cancel</button><button className="button button-primary" type="submit">{post ? 'Save changes' : 'Create post'}</button></div></form></>;
  if (dialog.type === 'post-detail') content = <><div className="dialog-detail-meta"><StatusBadge status={post.status}/><span>{post.date}</span></div><h2>{post.title}</h2><div className="dialog-author"><Avatar initials={post.author.split(' ').map((part) => part[0]).slice(0, 2).join('')} small/><span>{post.author}<small>Workspace author</small></span></div><p className="detail-excerpt">{post.excerpt || 'No additional details were added to this post.'}</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setDialog(null)}>Close</button></div></>;
  if (dialog.type === 'post-actions') content = <><span className="eyebrow">POST ACTIONS</span><h2>{post.title}</h2><p>Choose what you’d like to do with this post.</p><div className="dialog-action-list"><button onClick={() => setDialog({ type: 'post-form', post })}>Edit post</button><button onClick={() => { setDialog(null); setToast('Draft duplicated'); }}>Duplicate</button><button onClick={() => { setDialog(null); setToast(post.pinned ? 'Post unpinned' : 'Post pinned'); }}>Pin / unpin</button><button onClick={() => { setDialog(null); setToast('Post archived'); }}>Archive</button><button className="danger-menu-item" onClick={() => setDialog({ type: 'delete-post', post })}>Delete post</button></div></>;
  if (dialog.type === 'add-user' || dialog.type === 'edit-user') content = <><span className="eyebrow">WORKSPACE MEMBERS</span><h2>{dialog.user ? 'Edit member' : 'Invite a member'}</h2><p>{dialog.user ? 'Update this member’s workspace access.' : 'Add a teammate to your workspace.'}</p><form className="dialog-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); if (dialog.user) { setToast('Member details updated'); } else { const name = String(form.get('name')).trim(); const newEmail = String(form.get('email')).trim(); setToast(`${name || newEmail} invited`); } setDialog(null); }}><label>Full name<input name="name" required defaultValue={dialog.user?.name || ''} placeholder="e.g. Alex Morgan" autoFocus/></label><label>Email address<input name="email" type="email" required defaultValue={dialog.user?.email || ''} placeholder="alex@company.com"/></label><label>Role<select name="role" defaultValue={dialog.user?.role || 'Viewer'}><option>Viewer</option><option>Admin</option></select></label><div className="dialog-actions"><button type="button" className="button button-secondary" onClick={() => setDialog(null)}>Cancel</button><button className="button button-primary" type="submit">{dialog.user ? 'Save member' : 'Send invite'}</button></div></form></>;
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="dialog-close icon-button" aria-label="Close dialog" onClick={() => setDialog(null)}><Icon name="close" size={18}/></button><div id="dialog-title" className="dialog-content">{content}</div></section></div>;
}

export default App;
