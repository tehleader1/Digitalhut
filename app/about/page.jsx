export const metadata = {
  title: "About DigitalHut",
  description: "DigitalHut is a public observatory app for 3D discovery, market context, wallet-aware access, and adaptive research feeds."
}

export default function AboutPage() {
  return <main style={shell}>
    <a href="/" style={back}>Back to DigitalHut</a>
    <section style={panel}>
      <p style={eyebrow}>About DigitalHut</p>
      <h1 style={title}>A public observatory app for visual discovery.</h1>
      <p style={copy}>DigitalHut blends 3D models, market context, wallet-aware account flow, and adaptive feed logic into one exploration surface. The homepage stays focused on the renderer while deeper pages carry daily publishing, market reads, library access, and system context.</p>
      <p style={copy}>The goal is simple: let anyone enter, explore, orbit real objects and places, and move into deeper intelligence only when they need it.</p>
    </section>
  </main>
}

const shell = { minHeight: "100vh", padding: 28, background: "linear-gradient(135deg,#030712,#08111f 52%,#10201d)", color: "white", fontFamily: "Arial, sans-serif" }
const back = { color: "#67e8f9", fontWeight: 900, textDecoration: "none" }
const panel = { maxWidth: 880, margin: "42px auto", border: "1px solid rgba(103,232,249,.22)", borderRadius: 8, background: "rgba(15,23,42,.72)", padding: 24 }
const eyebrow = { margin: 0, color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 }
const title = { margin: "8px 0 14px", fontSize: "clamp(38px,7vw,72px)", lineHeight: .98, letterSpacing: 0, overflowWrap: "anywhere" }
const copy = { color: "#d8e4ee", fontSize: 18, lineHeight: 1.55 }
