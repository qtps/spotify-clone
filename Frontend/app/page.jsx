"use client";

import { useEffect, useState } from "react";

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
  });
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return result;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;

    async function loadPage() {
      const [libraryResult, sessionResult] = await Promise.allSettled([
        apiRequest("/api/music"),
        apiRequest("/api/auth/me"),
      ]);

      if (!active) return;

      if (libraryResult.status === "fulfilled") {
        setTracks(libraryResult.value.music);
      } else {
        setError(libraryResult.reason.message);
      }

      if (sessionResult.status === "fulfilled") {
        setUser(sessionResult.value.user);
      } else if (sessionResult.reason.status !== 401) {
        setError(sessionResult.reason.message);
      }

      setLoading(false);
    }

    loadPage();
    return () => {
      active = false;
    };
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier");
    const body =
      authMode === "register"
        ? {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
          }
        : {
            username: identifier,
            email: identifier,
            password: formData.get("password"),
          };

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const result = await apiRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setUser(result.user);
      setMessage(`Welcome${result.user.username ? `, ${result.user.username}` : ""}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await apiRequest("/api/music/upload", {
        method: "POST",
        body: formData,
      });
      setTracks((currentTracks) => [result.music, ...currentTracks]);
      form.reset();
      setMessage("Your track is live in the library.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMessage("You have been logged out.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshLibrary() {
    setError("");
    try {
      const result = await apiRequest("/api/music");
      setTracks(result.music);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Soundwave home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>soundwave</span>
        </a>

        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#discover">
            <span aria-hidden="true">⌂</span> Discover
          </a>
          <a className="nav-link" href="#library">
            <span aria-hidden="true">♫</span> Your library
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="eyebrow">YOUR SOUND, YOUR SPACE</span>
          <p>Find a new favorite or share something of your own.</p>
        </div>

        <div className="sidebar-bottom">
          <span className="live-dot" />
          <span>Made for music people</span>
        </div>
      </aside>

      <section className="main-panel" id="discover">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>LISTEN</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Discover</strong>
          </div>
          <div className="account-area">
            {user ? (
              <>
                <span className="account-name">
                  <span className="avatar">{user.username?.[0]?.toUpperCase() || "S"}</span>
                  {user.username}
                  <span className="role-pill">{user.role}</span>
                </span>
                <button className="quiet-button" onClick={handleLogout} disabled={busy}>
                  Log out
                </button>
              </>
            ) : (
              <a className="topbar-link" href="#account">
                Sign in <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>

        <div className="content">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow hero-eyebrow">
                <span className="live-dot" /> A LITTLE MORE YOU
              </span>
              <h1>Find your<br />next <em>favorite.</em></h1>
              <p>Fresh sounds, independent artists, and the tracks you’ll want on repeat.</p>
              <a className="primary-button hero-button" href="#library">
                Explore the library <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-center">
                <span>SW</span>
              </div>
              <div className="art-caption">VOL. 01<br /><strong>ON REPEAT</strong></div>
              <div className="art-spark spark-one">✳</div>
              <div className="art-spark spark-two">✳</div>
            </div>
            <div className="hero-index"><span>01</span> / 03</div>
          </section>

          {(message || error) && (
            <div className={`notice ${error ? "notice-error" : "notice-success"}`} role="status">
              <span>{error || message}</span>
              <button onClick={() => { setError(""); setMessage(""); }} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}

          <div className="section-heading" id="library">
            <div>
              <span className="eyebrow">THE GOOD STUFF</span>
              <h2>Music for your moment<span>.</span></h2>
            </div>
            <button className="text-button" onClick={refreshLibrary}>
              Refresh library <span aria-hidden="true">↻</span>
            </button>
          </div>

          <section className="track-grid" aria-live="polite">
            {loading ? (
              <div className="empty-state">Finding the good stuff…</div>
            ) : tracks.length ? (
              tracks.map((track, index) => (
                <article className="track-card" key={track._id || track.id}>
                  <div className={`cover-art cover-${index % 4}`}>
                    <span className="cover-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="cover-note" aria-hidden="true">♫</span>
                    <span className="cover-label">SOUNDWAVE<br />SELECTION</span>
                  </div>
                  <div className="track-info">
                    <div className="track-title-row">
                      <div>
                        <h3>{track.title}</h3>
                        <p>{track.artist?.username || "Independent artist"}</p>
                      </div>
                      <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <audio controls preload="none" src={track.uri}>
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-note" aria-hidden="true">♫</span>
                <strong>The library is waiting for its first track.</strong>
                <span>Artists can sign in and share something here.</span>
              </div>
            )}
          </section>

          <section className="account-section" id="account">
            {!user ? (
              <div className="auth-card">
                <div className="auth-intro">
                  <span className="eyebrow">COME ON IN</span>
                  <h2>{authMode === "login" ? "Pick up where you left off." : "Make this space yours."}</h2>
                  <p>
                    {authMode === "login"
                      ? "Sign in to your account, or create one to start sharing."
                      : "Create an account to find and share music."}
                  </p>
                  <div className="auth-switch">
                    {authMode === "login" ? "New here?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === "login" ? "register" : "login");
                        setError("");
                        setMessage("");
                      }}
                    >
                      {authMode === "login" ? "Create account" : "Sign in"}
                    </button>
                  </div>
                </div>
                <form className="auth-form" onSubmit={handleAuth}>
                  {authMode === "register" ? (
                    <>
                      <label>
                        Username
                        <input name="username" autoComplete="username" required minLength={2} />
                      </label>
                      <label>
                        Email
                        <input name="email" type="email" autoComplete="email" required />
                      </label>
                    </>
                  ) : (
                    <label>
                      Username or email
                      <input name="identifier" autoComplete="username" required />
                    </label>
                  )}
                  <label>
                    Password
                    <input
                      name="password"
                      type="password"
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                    />
                  </label>
                  {authMode === "register" && (
                    <label>
                      Account type
                      <select name="role" defaultValue="user">
                        <option value="user">Listener</option>
                        <option value="artist">Artist</option>
                      </select>
                    </label>
                  )}
                  <button className="primary-button form-submit" type="submit" disabled={busy}>
                    {busy ? "One moment…" : authMode === "login" ? "Sign in" : "Create account"}
                    <span aria-hidden="true">↗</span>
                  </button>
                </form>
              </div>
            ) : user.role === "artist" ? (
              <div className="upload-card">
                <div className="upload-copy">
                  <span className="eyebrow">ARTIST STUDIO</span>
                  <h2>Put your sound out there.</h2>
                  <p>Upload an audio track and it will be available in the public library.</p>
                </div>
                <form className="upload-form" onSubmit={handleUpload}>
                  <label>
                    Track title
                    <input name="title" placeholder="Give it a name" required />
                  </label>
                  <label className="file-field">
                    Audio file
                    <input
                      name="music"
                      type="file"
                      accept="audio/*"
                      required
                    />
                  </label>
                  <button className="primary-button form-submit" type="submit" disabled={busy}>
                    {busy ? "Uploading…" : "Upload track"} <span aria-hidden="true">↑</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="listener-card">
                <div className="listener-mark" aria-hidden="true">♫</div>
                <div>
                  <span className="eyebrow">YOU’RE ALL SET</span>
                  <h2>Your library, your pace.</h2>
                  <p>Browse the latest tracks above and find something new to love.</p>
                </div>
                <button className="outline-button" onClick={handleLogout} disabled={busy}>
                  Log out
                </button>
              </div>
            )}
          </section>
          <footer className="footer">
            <span>soundwave<span className="footer-dot">.</span></span>
            <span>Made for the feeling between the notes.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
