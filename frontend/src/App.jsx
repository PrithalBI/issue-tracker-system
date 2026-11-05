import { useEffect, useMemo, useState } from "react";
import api from "./api";

const emptyForm = { title: "", description: "", priority: "Medium" };

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const visibleIssues = useMemo(() => filter === "All" ? issues : issues.filter(i => i.status === filter), [issues, filter]);

  async function loadData() {
    const [issueRes, statsRes] = await Promise.all([api.get("/issues"), api.get("/dashboard")]);
    setIssues(issueRes.data);
    setStats(statsRes.data);
    if (user?.role === "admin") {
      const userRes = await api.get("/issues/users");
      setUsers(userRes.data);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get("/auth/me")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  }, []);

  useEffect(() => {
    if (user) loadData().catch(err => setError(err.response?.data?.message || "Could not load data"));
  }, [user]);

  async function submitAuth(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login"
        ? { email: auth.email, password: auth.password }
        : auth;
      const { data } = await api.post(endpoint, payload);
      if (!data.token || !data.user) throw new Error("Unexpected authentication response");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.response?.data?.message || err.message || "Authentication failed. Check the API URL and backend server.");
    } finally { setBusy(false); }
  }

  function logout() {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    setUser(null); setIssues([]); setStats({ total: 0, open: 0, inProgress: 0, closed: 0 });
  }

  async function saveIssue(e) {
    e.preventDefault(); setError("");
    try {
      if (editing) await api.put(`/issues/${editing}`, form);
      else await api.post("/issues", form);
      setForm(emptyForm); setEditing(null); await loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not save issue"); }
  }

  function startEdit(issue) {
    setEditing(issue._id);
    setForm({ title: issue.title, description: issue.description, priority: issue.priority });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteIssue(id) {
    if (!window.confirm("Delete this issue permanently?")) return;
    try { await api.delete(`/issues/${id}`); await loadData(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete issue"); }
  }

  async function changeStatus(issue, status) {
    try { await api.put(`/issues/${issue._id}`, { status }); await loadData(); }
    catch (err) { setError(err.response?.data?.message || "Could not update status"); }
  }

  async function assignIssue(issueId, userId) {
    try { await api.patch(`/issues/${issueId}/assign`, { userId: userId || null }); await loadData(); }
    catch (err) { setError(err.response?.data?.message || "Could not assign issue"); }
  }

  async function addComment(issueId) {
    const message = comments[issueId]?.trim();
    if (!message) return;
    try {
      await api.post(`/issues/${issueId}/comments`, { message });
      setComments(prev => ({ ...prev, [issueId]: "" }));
      await loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not add comment"); }
  }

  if (!user) return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submitAuth}>
        <div className="brand-mark">IT</div>
        <p className="eyebrow">WORKSPACE MANAGEMENT</p>
        <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">Track issues. Collaborate. Get things done.</p>
        {authMode === "register" && <label>Full name<input required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} placeholder="Your name" /></label>}
        <label>Email address<input required type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input required minLength="8" type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} placeholder="At least 8 characters" /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary full" disabled={busy}>{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}</button>
        <p className="switch-auth">{authMode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="link" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); }}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p>
      </form>
    </main>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark small">IT</span><span>Issue<span className="brand-light">Track</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active">▦ <span>Overview</span></div>
        <div className="nav-item">☷ <span>All issues</span></div>
        <div className="sidebar-bottom"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div className="profile"><b>{user.name}</b><small>{user.role}</small></div><button className="logout" onClick={logout} title="Sign out">↪</button></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">WORKSPACE / OVERVIEW</p><h1>Issue dashboard</h1></div><div className="top-user"><span className="status-dot"></span>{user.name} <span className="role-pill">{user.role}</span></div></header>
        {error && <div className="error banner">{error}<button onClick={() => setError("")}>×</button></div>}

        <section className="stats-grid">
          <Stat title="Total issues" value={stats.total} icon="▤" tone="blue" />
          <Stat title="Open" value={stats.open} icon="◷" tone="orange" />
          <Stat title="In progress" value={stats.inProgress} icon="↗" tone="purple" />
          <Stat title="Closed" value={stats.closed} icon="✓" tone="green" />
        </section>

        <section className="content-grid">
          <div className="panel create-panel">
            <div className="panel-heading"><div><p className="eyebrow">ISSUE MANAGEMENT</p><h2>{editing ? "Edit issue" : "Create an issue"}</h2></div><span className="heading-icon">＋</span></div>
            <form onSubmit={saveIssue} className="issue-form">
              <label>Issue title<input required maxLength="150" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Login page is not loading" /></label>
              <label>Description<textarea required maxLength="5000" rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue and steps to reproduce..." /></label>
              <label>Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
              <div className="form-actions"><button className="primary">{editing ? "Save changes" : "Create issue"}</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}</div>
            </form>
          </div>

          <div className="panel list-panel">
            <div className="panel-heading list-heading"><div><p className="eyebrow">TEAM ACTIVITY</p><h2>Issues</h2></div><select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Open</option><option>In Progress</option><option>Closed</option></select></div>
            <div className="issue-list">
              {visibleIssues.length === 0 && <div className="empty-state"><div>☷</div><b>No issues found</b><p>Create an issue or change the status filter.</p></div>}
              {visibleIssues.map(issue => <article className="issue-card" key={issue._id}>
                <div className="issue-top"><div><span className={`priority-dot ${issue.priority.toLowerCase()}`}></span><span className="issue-id">#{issue._id.slice(-6).toUpperCase()}</span></div><span className={`status ${issue.status.toLowerCase().replace(" ", "-")}`}>{issue.status}</span></div>
                <h3>{issue.title}</h3><p className="issue-description">{issue.description}</p>
                <div className="issue-meta"><span>By {issue.createdBy?.name || "Unknown"}</span><span className={`priority-text ${issue.priority.toLowerCase()}`}>{issue.priority} priority</span></div>
                {user.role === "admin" && <label className="assign-row">Assign to <select value={issue.assignedTo?._id || ""} onChange={e => assignIssue(issue._id, e.target.value)}><option value="">Unassigned</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></label>}
                {user.role !== "admin" && <div className="issue-meta">Assigned to: {issue.assignedTo?.name || "Not assigned"}</div>}
                <div className="issue-controls"><label>Status <select value={issue.status} onChange={e => changeStatus(issue, e.target.value)}><option>Open</option><option>In Progress</option><option>Closed</option></select></label><div className="action-buttons">{(user.role === "admin" || issue.createdBy?._id === user.id) && <><button className="text-button" onClick={() => startEdit(issue)}>Edit</button><button className="text-button danger-text" onClick={() => deleteIssue(issue._id)}>Delete</button></>}</div></div>
                <details className="comments"><summary>Comments ({issue.comments?.length || 0})</summary>
                  <div className="comment-list">{issue.comments?.map(c => <div className="comment" key={c._id}><b>{c.author?.name || "User"}</b><p>{c.message}</p></div>)}</div>
                  <div className="comment-input"><input value={comments[issue._id] || ""} onChange={e => setComments(prev => ({ ...prev, [issue._id]: e.target.value }))} placeholder="Write a comment..." /><button onClick={() => addComment(issue._id)}>Send</button></div>
                </details>
              </article>)}
            </div>
          </div>
        </section>
        <footer>IssueTrack <span>•</span> Keep work moving forward.</footer>
      </main>
    </div>
  );
}

function Stat({ title, value, icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{title}</p><strong>{value}</strong></div><span className="stat-caption">Updated live</span></div>;
}

export default App;
