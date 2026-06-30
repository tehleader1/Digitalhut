import React, {useEffect, useMemo, useState} from "react"

import "./RunnerChatPage.css"

const savedSecretKey = "digitalhut-runner-secret"

function formatTime(value){
  if(!value) return "pending"
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function cleanMessage(value){
  return String(value || "").replace(/\s+/g, " ").trim()
}

export default function RunnerChatPage(){
  const [secret, setSecret] = useState(() => localStorage.getItem(savedSecretKey) || "")
  const [message, setMessage] = useState("Give me a human summary of what you are looking at, what statistics you compared, what SEO words you are improving, and what FireCuda should map next.")
  const [status, setStatus] = useState("Ready")
  const [reply, setReply] = useState("")
  const [history, setHistory] = useState([])
  const [report, setReport] = useState(null)
  const [busy, setBusy] = useState(false)

  const secretReady = useMemo(() => secret.trim().length > 0, [secret])

  function persistSecret(nextSecret){
    setSecret(nextSecret)
    if(nextSecret.trim()){
      localStorage.setItem(savedSecretKey, nextSecret.trim())
    } else {
      localStorage.removeItem(savedSecretKey)
    }
  }

  async function callRunner(action, nextMessage = ""){
    if(!secretReady){
      setStatus("Enter runner secret first.")
      return
    }
    setBusy(true)
    setStatus(`Runner ${action} running...`)
    try {
      const response = await fetch("/api/overnight-runner", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-digitalhut-runner-secret": secret.trim()
        },
        body: JSON.stringify({
          action,
          secret: secret.trim(),
          message: nextMessage
        })
      })
      const data = await response.json()
      if(!response.ok || !data.ok){
        throw new Error(data.error || data.detail || `Runner ${action} failed`)
      }
      setReport(data.report || null)
      const chat = data.runnerChat || {}
      const nextReply = chat.reply || chat.idleUpdate?.record?.message || data.report?.anthonyBrief?.directSummary || data.report?.summary || "Runner returned without a direct message."
      setReply(nextReply)
      setHistory(chat.history?.messages || [])
      setStatus(`Runner ${action} complete.`)
    } catch (error) {
      setStatus(error?.message || "Runner request failed")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if(secretReady){
      callRunner("status")
    }
  }, [])

  const brief = report?.anthonyBrief
  const stats = brief?.statisticsCompared?.pixelTotals || {}

  return (
    <main className="runner-chat-page">
      <section className="runner-chat-shell">
        <header className="runner-chat-header">
          <div>
            <p>DigitalHut Developer Channel</p>
            <h1>Runner Chat</h1>
          </div>
          <a href="/insights">Insights</a>
        </header>

        <section className="runner-chat-grid">
          <div className="runner-chat-panel runner-chat-control">
            <label>
              Runner Secret
              <input
                value={secret}
                onChange={(event) => persistSecret(event.target.value)}
                placeholder="Enter runner secret"
                type="password"
              />
            </label>

            <label>
              Message To Runner
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={8}
              />
            </label>

            <div className="runner-chat-actions">
              <button disabled={busy || !secretReady} onClick={() => callRunner("chat", cleanMessage(message))}>Ask Runner</button>
              <button disabled={busy || !secretReady} onClick={() => callRunner("status")}>Status</button>
            </div>

            <small>{status}</small>
          </div>

          <div className="runner-chat-panel runner-chat-reply">
            <h2>Latest Runner Response</h2>
            <p>{reply || "Ask the runner for a direct summary."}</p>
          </div>

          <div className="runner-chat-panel runner-chat-stats">
            <h2>Current Read</h2>
            <dl>
              <div><dt>Score</dt><dd>{report?.score ?? "pending"}</dd></div>
              <div><dt>Expansion</dt><dd>{report?.expansionScore ?? "pending"}</dd></div>
              <div><dt>Page Views</dt><dd>{stats.pageViews ?? 0}</dd></div>
              <div><dt>Blog Views</dt><dd>{stats.blogViews ?? 0}</dd></div>
              <div><dt>GLB Plays</dt><dd>{stats.glbPlays ?? 0}</dd></div>
              <div><dt>Unique Visitors</dt><dd>{stats.uniqueVisitors ?? 0}</dd></div>
            </dl>
          </div>

          <div className="runner-chat-panel runner-chat-history">
            <h2>Conversation History</h2>
            {history.length ? history.map((item) => (
              <article key={item.id} className={`runner-message runner-message-${item.role}`}>
                <b>{item.role === "anthony" ? "Anthony" : "Runner"}</b>
                <time>{formatTime(item.created_at)}</time>
                <p>{item.message}</p>
              </article>
            )) : <p>No saved runner messages yet.</p>}
          </div>
        </section>
      </section>
    </main>
  )
}
