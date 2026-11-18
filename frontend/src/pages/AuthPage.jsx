import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Ticket, Megaphone } from "lucide-react";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

const ROLES = [
  { id: "customer", title: "Attend events", hint: "Browse and book tickets", icon: Ticket },
  { id: "organizer", title: "Host events", hint: "Create events and track bookings", icon: Megaphone }
];

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ name: "", email: "", password: "", role: location.state?.role || "customer" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to={from || (user.role === "organizer" ? "/dashboard" : "/")} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (isRegister && form.password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      const u = isRegister
        ? await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role })
        : await login({ email: form.email.trim(), password: form.password });
      toast(isRegister ? `Welcome to Admit, ${u.name.split(" ")[0]}!` : `Welcome back, ${u.name.split(" ")[0]}`);
      navigate(from || (u.role === "organizer" ? "/dashboard" : "/"), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth">
      <div className="auth-card">
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {isRegister ? "It takes less than a minute." : "Log in to book tickets or manage your events."}
        </p>

        <form onSubmit={submit} noValidate>
          {isRegister && (
            <>
              <div className="roles" role="radiogroup" aria-label="Account type">
                {ROLES.map(({ id, title, hint, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    role="radio"
                    aria-checked={form.role === id}
                    className={`role ${form.role === id ? "active" : ""}`}
                    onClick={() => setForm({ ...form, role: id })}
                  >
                    <Icon size={20} />
                    <b>{title}</b>
                    <span>{hint}</span>
                  </button>
                ))}
              </div>

              <label className="field">
                <span>Full name</span>
                <input value={form.name} onChange={set("name")} required autoComplete="name" placeholder="Priya Sharma" />
              </label>
            </>
          )}

          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" placeholder="you@example.com" />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 6 characters" : "Your password"}
              />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={busy || !form.email || !form.password || (isRegister && !form.name)}>
            {busy ? <span className="spinner spinner-sm" /> : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="switch">
          {isRegister ? "Already have an account?" : "New to Admit?"}{" "}
          <Link className="link" to={isRegister ? "/login" : "/register"} state={location.state}>
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
