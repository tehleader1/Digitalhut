"use client"

import { useMemo, useState } from "react"
import library from "../data/platform-libraries.json"

export default function AgentFaqHelper({ intent, health }) {
  const [question, setQuestion] = useState(library.agentFaqs[0]?.question || "")
  const answer = useMemo(() => {
    const match = library.agentFaqs.find((faq) => faq.question === question) || library.agentFaqs[0]
    const providers = health?.providers || {}
    const live = [
      providers.sketchfab ? "Sketchfab models" : "Sketchfab fallback models",
      providers.alpaca ? "Alpaca candles" : "market fallback profiles",
      providers.supabase ? "Supabase memory" : "local session memory"
    ].join(", ")
    return `${match?.answer || "Agents are ready."} Current agent context: ${intent || "adaptive visitor"}. Provider mix: ${live}.`
  }, [question, intent, health])

  return <section style={styles.wrap} aria-labelledby="agent-faq-title">
    <div style={styles.header}>
      <div>
        <p style={styles.eyebrow}>AI agent helper</p>
        <h2 id="agent-faq-title" style={styles.title}>FAQ support tied to providers, models, wallets, and blog signals.</h2>
      </div>
      <span style={styles.pill}>{intent || "adaptive"}</span>
    </div>
    <div style={styles.grid}>
      <div style={styles.questions}>
        {library.agentFaqs.map((faq) => <button key={faq.question} type="button" onClick={() => setQuestion(faq.question)} style={faq.question === question ? styles.activeQuestion : styles.question}>{faq.question}</button>)}
      </div>
      <article style={styles.answerBox}>
        <p style={styles.agentLabel}>DigitalHut FAQ agent</p>
        <h3 style={styles.answerTitle}>{question}</h3>
        <p style={styles.answer}>{answer}</p>
      </article>
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, maxWidth: 820 },
  pill: { fontSize: 12, padding: "7px 10px", borderRadius: 999, background: "rgba(103,232,249,.12)", color: "#a5f3fc", fontWeight: 900, textTransform: "capitalize" },
  grid: { display: "grid", gridTemplateColumns: "minmax(220px,.75fr) minmax(0,1.25fr)", gap: 16 },
  questions: { display: "grid", gap: 10, alignContent: "start" },
  question: { textAlign: "left", padding: 13, borderRadius: 8, border: "1px solid rgba(148,163,184,.22)", background: "rgba(2,6,23,.42)", color: "white", fontWeight: 800, cursor: "pointer" },
  activeQuestion: { textAlign: "left", padding: 13, borderRadius: 8, border: "1px solid rgba(45,212,191,.45)", background: "rgba(20,184,166,.14)", color: "white", fontWeight: 900, cursor: "pointer" },
  answerBox: { minWidth: 0, padding: 18, borderRadius: 8, border: "1px solid rgba(103,232,249,.22)", background: "rgba(8,20,32,.82)" },
  agentLabel: { margin: "0 0 8px", color: "#a5f3fc", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  answerTitle: { margin: "0 0 10px", fontSize: 24, lineHeight: 1.14, overflowWrap: "anywhere" },
  answer: { margin: 0, color: "#dbeafe", lineHeight: 1.6, fontSize: 17, overflowWrap: "anywhere" }
}
