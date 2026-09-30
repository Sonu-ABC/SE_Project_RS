import React, { useState } from "react";
import { loginUser, registerUser } from "../api/authApi.js";

/**
 * Auth page — handles login and registration.
 * Props: onAuth(data) — called with { token, user } on successful login.
 */
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { ok, data } =
        mode === "login"
          ? await loginUser({ email: form.email, password: form.password })
          : await registerUser(form);

      if (!ok) {
        setError(data.message || "Request failed");
        return;
      }
      if (mode === "register") {
        setMode("login");
        setForm({ name: "", email: form.email, password: "", role: "CUSTOMER" });
        setError("Account created. Please sign in.");
      } else {
        onAuth(data);
      }
    } catch {
      setError(
        "Cannot connect to the backend. Start it with: npm run server"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand auth-brand">
          <span>🍽</span> Savoury
        </div>
        <p className="eyebrow">RESTAURANT OS</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">
          {mode === "login"
            ? "Sign in to continue to your workspace."
            : "Join us and order your favourites."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              placeholder="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength="6"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {mode === "register" && (
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SALES_CLERK">Sales clerk</option>
              <option value="MANAGER">Manager</option>
            </select>
          )}
          <button className="primary auth-submit">
            {mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>
        {error && <div className="toast">{error}</div>}
        <button
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
