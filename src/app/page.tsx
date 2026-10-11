"use client";

import { FormEvent, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sign in. Check your details and try again.");
      }

      window.localStorage.setItem("ticketflow_access_token", data.access_token);
      setSignedIn(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">TF</div>
        <p className="eyebrow">TicketFlow</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="subtitle">Sign in to manage your stations, routes, and tickets.</p>

        {signedIn ? (
          <div className="success-message" role="status">
            You’re signed in. Your session token is stored and ready for the next screen.
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <button type="button" className="text-button" onClick={() => setError("Password reset is not available yet.")}>
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />

            {error && <p className="error-message" role="alert">{error}</p>}
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        <p className="footer-note">Need an account? <span>Ask your administrator.</span></p>
      </section>
    </main>
  );
}
