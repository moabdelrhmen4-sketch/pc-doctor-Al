
import { useState } from "react";
import "./App.css";

const API = import.meta.env.DEV
  ? "http://127.0.0.1:5000"
  : "";

const symptoms = [
  { id: "power", label: "Computer won't turn on", icon: "⚡" },
  { id: "slow", label: "Computer is running slowly", icon: "🐢" },
  { id: "overheating", label: "Computer is overheating", icon: "🌡️" },
  { id: "screen", label: "Display or screen problem", icon: "🖥️" },
  { id: "restarting", label: "Unexpected restarts", icon: "🔄" },
  { id: "ram", label: "Possible memory problem", icon: "🧠" },
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasDiagnosed, setHasDiagnosed] = useState(false);

  function toggleSymptom(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function runDiagnosis() {
    if (!selected.length) {
      setError("Please select at least one symptom.");
      setHasDiagnosed(false);
      return;
    }

    setLoading(true);
    setError("");
    setHasDiagnosed(false);

    try {
      const response = await fetch(`${API}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selected }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Diagnosis request failed.");
      }

      setResults(data.results || []);
      setHasDiagnosed(true);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure the Python backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function openHistory() {
    setPage("history");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/history`);

      if (!response.ok) {
        throw new Error("Could not load diagnosis history.");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch {
      setError("Unable to load history. Check that the Python server is running.");
    } finally {
      setLoading(false);
    }
  }

  function resetDiagnosis() {
    setSelected([]);
    setResults([]);
    setError("");
    setHasDiagnosed(false);
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>PC Doctor</h2>
            <span>SMART DIAGNOSTICS</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${page === "dashboard" ? "active" : ""}`}
          onClick={() => {
            setPage("dashboard");
            setError("");
          }}
        >
          ▦ &nbsp; Dashboard
        </button>

        <button
          className={`nav-item ${page === "history" ? "active" : ""}`}
          onClick={openHistory}
        >
          ▤ &nbsp; Diagnosis History
        </button>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          Diagnosis engine
          <strong>Ready to use</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace / {page === "dashboard" ? "Dashboard" : "History"}
            </div>
            <h1>
              {page === "dashboard"
                ? "Computer Health Center"
                : "Diagnosis History"}
            </h1>
          </div>
          <div className="user-avatar">PC</div>
        </header>

        {page === "dashboard" ? (
          <>
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="eyebrow">INTELLIGENT SUPPORT SYSTEM</span>
                <h2>Your computer,<br />under control.</h2>
                <p>
                  Identify common computer problems and explore
                  recommended troubleshooting steps.
                </p>
                <a href="#diagnosis" className="banner-button">
                  Start diagnosis <span>→</span>
                </a>
              </div>

              <div className="computer-art" aria-hidden="true">
                <div className="monitor">
                  <div className="monitor-screen">
                    <div className="screen-top">
                      <span /><span /><span />
                    </div>
                    <div className="screen-chart">
                      <div /><div /><div /><div /><div /><div />
                    </div>
                    <div className="screen-line" />
                    <div className="screen-line short" />
                  </div>
                  <div className="monitor-neck" />
                  <div className="monitor-base" />
                </div>
                <div className="floating-chip">✦ AI</div>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon purple">⌘</span>
                <div className="stat-label">AVAILABLE RULES</div>
                <div className="stat-value">06 <small>rules</small></div>
                <div className="stat-note">Common computer symptoms</div>
              </div>

              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <div className="stat-label">ENGINE STATUS</div>
                <div className="stat-value">Online</div>
                <div className="stat-note">
                  <span className="live-dot" /> Ready for diagnosis
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon orange">⌁</span>
                <div className="stat-label">DIAGNOSIS MODE</div>
                <div className="stat-value">Rule-based</div>
                <div className="stat-note">Explainable results</div>
              </div>
            </section>

            <section className="workspace-grid" id="diagnosis">
              <div className="panel symptoms-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">STEP 01</span>
                    <h2>What is the problem?</h2>
                    <p>Select all symptoms you have noticed.</p>
                  </div>
                  <span className="selection-count">
                    {selected.length} selected
                  </span>
                </div>

                <div className="symptom-grid">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      className={`symptom-card ${
                        selected.includes(symptom.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleSymptom(symptom.id)}
                      aria-pressed={selected.includes(symptom.id)}
                    >
                      <span className="symptom-icon">{symptom.icon}</span>
                      <span>{symptom.label}</span>
                      <span className="check-circle">
                        {selected.includes(symptom.id) ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button
                    className="secondary-button"
                    onClick={resetDiagnosis}
                  >
                    Reset
                  </button>
                  <button
                    className="primary-button"
                    onClick={runDiagnosis}
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Run diagnosis →"}
                  </button>
                </div>
              </div>

              <aside className="panel info-panel">
                <div className="info-symbol">✧</div>
                <span className="section-kicker">HOW IT WORKS</span>
                <h2>Smart rules.<br />Clear answers.</h2>
                <p>
                  The engine matches your selected symptoms against
                  predefined rules to suggest possible causes.
                </p>

                <div className="info-step">
                  <span>01</span>
                  <div>
                    <strong>Select symptoms</strong>
                    <small>Describe what you notice</small>
                  </div>
                </div>
                <div className="info-step">
                  <span>02</span>
                  <div>
                    <strong>Analyze rules</strong>
                    <small>Match symptoms to rules</small>
                  </div>
                </div>
                <div className="info-step">
                  <span>03</span>
                  <div>
                    <strong>Review solutions</strong>
                    <small>Follow safe suggestions</small>
                  </div>
                </div>
              </aside>
            </section>

            {hasDiagnosed && (
              <section className="panel results-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">DIAGNOSIS REPORT</span>
                    <h2>Recommended findings</h2>
                    <p>{results.length} matching symptom rule(s).</p>
                  </div>
                  <span className="result-badge">Analysis complete</span>
                </div>

                {results.length === 0 ? (
                  <p>No matching rules were found.</p>
                ) : (
                  results.map((result) => (
                    <article className="result-card" key={result.id}>
                      <h3>{result.title}</h3>
                      <div className="result-columns">
                        <div>
                          <h4>Possible causes</h4>
                          <ul>
                            {result.causes.map((cause) => (
                              <li key={cause}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4>Recommended actions</h4>
                          <ul>
                            {result.solutions.map((solution) => (
                              <li key={solution}>{solution}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rule-note">{result.rule}</div>
                    </article>
                  ))
                )}

                <p className="disclaimer">
                  Results are suggestions based on predefined rules,
                  not a confirmed hardware diagnosis.
                </p>

                <button className="secondary-button" onClick={openHistory}>
                  View saved history →
                </button>
              </section>
            )}
          </>
        ) : (
          <section className="panel history-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">SAVED RECORDS</span>
                <h2>Previous diagnoses</h2>
                <p>Your latest saved diagnosis reports.</p>
              </div>
              <button className="secondary-button" onClick={openHistory}>
                Refresh ↻
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <p className="empty-history">Loading history...</p>
            ) : history.length === 0 ? (
              <div className="empty-history">
                <div className="info-symbol">▤</div>
                <h3>No saved diagnoses yet</h3>
                <p>Run your first diagnosis and it will appear here.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setPage("dashboard");
                    setError("");
                  }}
                >
                  Start diagnosis →
                </button>
              </div>
            ) : (
              <div className="history-list">
                {history.map((record) => (
                  <article className="history-record" key={record.id}>
                    <div className="history-record-top">
                      <div>
                        <span className="section-kicker">
                          REPORT #{record.id}
                        </span>
                        <h3>Computer diagnosis</h3>
                      </div>
                      <span className="history-date">
                        {formatDate(record.created_at)}
                      </span>
                    </div>

                    <div className="history-tags">
                      {record.symptoms.map((id) => {
                        const symptom = symptoms.find((item) => item.id === id);
                        return (
                          <span key={id} className="history-tag">
                            {symptom?.icon || "•"} {symptom?.label || id}
                          </span>
                        );
                      })}
                    </div>

                    <div className="history-results">
                      {record.results.map((result, index) => (
                        <div key={`${record.id}-${index}`}>
                          <strong>{result.title}</strong>
                          <p>{result.causes.join(" · ")}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          PC Doctor AI <span>•</span> Smart Computer Diagnosis System
          <span className="footer-right">Built with React & Python</span>
        </footer>
      </main>
    </div>
  );
}

export default App;


