
import { useState } from "react";

const API_URL = "http://localhost:8080/api/auth";

export default function AuthPanel({ onUserChange }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const endpoint =
      mode === "register" ? "/register" : "/login";

    const body =
      mode === "register"
        ? { fullName, email, password }
        : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || `Request failed (${response.status}).`);
        return;
      }

      if (mode === "register") {
        setMessage("Registration successful! You can now log in.");
        setMode("login");
        setPassword("");
      } else {
        setUser(data);
        onUserChange?.(data);
        setMessage(`Welcome, ${data.fullName}! Login successful.`);
        setPassword("");
      }
    } catch {
      setMessage(
        "Cannot connect to the backend. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    onUserChange?.(null);
    setUser(null);
    setMessage("You have been logged out of this demo.");
    setPassword("");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#111827",
    color: "#f8fafc",
    fontSize: "15px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#facc15",
    color: "#111827",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  };

  return (
    <section
      id="rider-account"
      style={{
        maxWidth: "460px",
        margin: "48px auto",
        padding: "28px",
        border: "1px solid #263449",
        borderRadius: "18px",
        background: "#111827",
        color: "#f8fafc",
      }}
    >
      <h2 style={{ fontSize: "26px", marginTop: 0 }}>
        {user
          ? "Your Rider Account"
          : mode === "login"
            ? "Welcome Back"
            : "Create Your Account"}
      </h2>

      {user ? (
        <div>
          <p>You are signed in as {user.fullName}.</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button style={buttonStyle} onClick={logout}>
            Log Out
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: "#94a3b8" }}>
            {mode === "login"
              ? "Log in to your RideFlow rider account."
              : "Register to start booking rides."}
          </p>

          <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              style={{
                ...buttonStyle,
                background: mode === "login" ? "#facc15" : "#263449",
                color: mode === "login" ? "#111827" : "#f8fafc",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              style={{
                ...buttonStyle,
                background: mode === "register" ? "#facc15" : "#263449",
                color: mode === "register" ? "#111827" : "#f8fafc",
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <label style={{ display: "block", marginBottom: "16px" }}>
                Full name
                <input
                  style={inputStyle}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                  placeholder="Enter your name"
                />
              </label>
            )}

            <label style={{ display: "block", marginBottom: "16px" }}>
              Email
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={150}
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label style={{ display: "block", marginBottom: "20px" }}>
              Password
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
                placeholder="At least 8 characters"
              />
            </label>

            <button style={buttonStyle} type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "register"
                  ? "Create Account"
                  : "Login"}
            </button>
          </form>
        </>
      )}

      {message && (
        <p role="status" aria-live="polite" style={{ marginTop: "18px" }}>
          {message}
        </p>
      )}
    </section>
  );
}
