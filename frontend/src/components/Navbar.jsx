import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Admit home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="var(--brand)" />
        <path d="M14 22a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v4a6 6 0 0 0 0 12v4a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-4a6 6 0 0 0 0-12z" fill="var(--brand-ink)" />
        <path d="M38 20v24" stroke="var(--brand)" strokeWidth="2.5" strokeDasharray="3 3.5" />
      </svg>
      <span>Admit</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("admit-theme", theme); } catch {}
  }, [theme]);

  async function handleLogout() {
    await logout();
    toast("You're logged out");
    navigate("/");
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Events</NavLink>
          {user?.role === "customer" && <NavLink to="/my-bookings">My tickets</NavLink>}
          {user?.role === "organizer" && <NavLink to="/dashboard">Dashboard</NavLink>}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <div className="user-pill" title={user.email}>
                <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-meta">
                  <b>{user.name.split(" ")[0]}</b>
                  <small>{user.role === "organizer" ? "Organizer" : "Attendee"}</small>
                </span>
              </div>
              <button className="icon-btn" onClick={handleLogout} aria-label="Log out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-small">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-small">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="logo-mini"><Ticket size={16} /> Admit</span>
        <span>Built with React, Express, MongoDB &amp; BullMQ</span>
      </div>
    </footer>
  );
}
