export const metadata = {
  title: "DigitalHut Privacy",
  description: "DigitalHut privacy notes for wallet signals, adaptive feeds, market pages, and optional connected account data."
}

export default function PrivacyPage() {
  return <main style={shell}>
    <a href="/" style={back}>Back to DigitalHut</a>
    <section style={panel}>
      <p style={eyebrow}>Privacy</p>
      <h1 style={title}>Adaptive should mean consent-aware.</h1>
      <p style={copy}>DigitalHut can adapt from in-app activity such as searches, selected feeds, renderer interactions, wallet connection state, tier selection, and market page usage.</p>
      <p style={copy}>External signals such as maps, travel, video, social, or wallet extension details should be connected only through user-approved imports, browser permissions, wallet confirmations, or explicit account integrations.</p>
      <p style={copy}>The public homepage is designed to work without requiring a wallet. Wallet verification, premium access, and gas route checks should be visible actions the user chooses.</p>
    </section>
  </main>
}

const shell = { minHeight: "100vh", padding: 28, background: "linear-gradient(135deg,#030712,#08111f 52%,#15111f)", color: "white", fontFamily: "Arial, sans-serif" }
const back = { color: "#67e8f9", fontWeight: 900, textDecoration: "none" }
const panel = { maxWidth: 880, margin: "42px auto", border: "1px solid rgba(103,232,249,.22)", borderRadius: 8, background: "rgba(15,23,42,.72)", padding: 24 }
const eyebrow = { margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 }
const title = { margin: "8px 0 14px", fontSize: "clamp(38px,7vw,72px)", lineHeight: .98, letterSpacing: 0, overflowWrap: "anywhere" }
const copy = { color: "#d8e4ee", fontSize: 18, lineHeight: 1.55 }
