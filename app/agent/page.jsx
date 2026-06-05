import { getDigitalHutAgentManifest } from "../../lib/domain/agentCapabilities"

export const metadata = {
  title: "DigitalHut Agent Layer",
  description: "Human-readable and AI-agent-readable capability map for the DigitalHut observatory platform."
}

export default function AgentPage() {
  const manifest = getDigitalHutAgentManifest()

  return <main style={shell}>
    <a href="/" style={back}>Back to DigitalHut</a>
    <section style={hero}>
      <div style={eyebrow}>Agent-readable, human-first</div>
      <h1 style={title}>DigitalHut can be read by people and evaluated by AI agents.</h1>
      <p style={lede}>{manifest.summary}</p>
      <div style={actions}>
        <a href="/api/agent-capabilities" style={primary}>Read JSON capability map</a>
        <a href="/library" style={secondary}>Library</a>
        <a href="/market-intelligence" style={secondary}>Market</a>
      </div>
    </section>

    <section style={grid}>
      <Panel title="Operating Brain" items={manifest.operatingModel.map((item) => ({ label: item, detail: "Part of the activeFeed chain" }))} />
      <Panel title="Safe Agent Actions" items={manifest.safeActions.map((item) => ({ label: item, detail: "Allowed public/permission-aware action" }))} />
    </section>

    <section style={band}>
      <h2 style={sectionTitle}>Capabilities</h2>
      <div style={cards}>{manifest.capabilities.map((capability) => <article key={capability.id} style={card}>
        <span style={pill}>{capability.requiresTier}</span>
        <h3 style={cardTitle}>{capability.label}</h3>
        <p style={mono}>{capability.method} {capability.endpoint}</p>
      </article>)}</div>
    </section>

    <section style={grid}>
      <Panel title="Pricing" items={manifest.pricing.map((tier) => ({ label: `${tier.tier} - $${tier.usd}`, detail: tier.purpose }))} />
      <Panel title="Trust Signals" items={manifest.trustSignals.map((signal) => ({ label: signal, detail: "Machine-readable confidence signal" }))} />
    </section>
  </main>
}

function Panel({ title, items }) {
  return <section style={panel}>
    <h2 style={sectionTitle}>{title}</h2>
    <div style={list}>{items.map((item) => <div key={item.label} style={row}>
      <b>{item.label}</b>
      <span>{item.detail}</span>
    </div>)}</div>
  </section>
}

const shell={minHeight:"100vh",padding:28,background:"linear-gradient(135deg,#020617,#07111f 48%,#10231f)",color:"white",fontFamily:"Arial, sans-serif"}
const back={color:"#67e8f9",fontWeight:900,textDecoration:"none"}
const hero={maxWidth:1120,margin:"34px auto 20px"}
const eyebrow={fontSize:12,textTransform:"uppercase",letterSpacing:0,fontWeight:900,color:"#67e8f9"}
const title={fontSize:"clamp(40px,7vw,78px)",lineHeight:.96,margin:"10px 0 16px",letterSpacing:0,maxWidth:980,overflowWrap:"anywhere"}
const lede={fontSize:18,lineHeight:1.55,color:"#dbeafe",maxWidth:880}
const actions={display:"flex",gap:10,flexWrap:"wrap",marginTop:18}
const primary={padding:"14px 18px",borderRadius:8,background:"#14b8a6",color:"#021014",fontWeight:900,textDecoration:"none"}
const secondary={padding:"14px 18px",borderRadius:8,background:"rgba(226,232,240,.1)",color:"white",border:"1px solid rgba(226,232,240,.24)",fontWeight:800,textDecoration:"none"}
const grid={maxWidth:1120,margin:"18px auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:18}
const band={maxWidth:1120,margin:"18px auto"}
const panel={border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.72)",padding:18,minWidth:0}
const sectionTitle={fontSize:28,margin:"0 0 12px",letterSpacing:0}
const list={display:"grid",gap:10}
const row={padding:12,borderRadius:8,background:"rgba(2,6,23,.42)",border:"1px solid rgba(148,163,184,.16)",display:"grid",gap:5,overflowWrap:"anywhere"}
const cards={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:14}
const card={border:"1px solid rgba(148,163,184,.25)",borderRadius:8,background:"rgba(15,23,42,.72)",padding:16,display:"grid",gap:10,minWidth:0}
const pill={fontSize:12,padding:"7px 10px",borderRadius:999,background:"rgba(103,232,249,.12)",color:"#a5f3fc",fontWeight:900,width:"fit-content",textTransform:"uppercase"}
const cardTitle={fontSize:22,lineHeight:1.12,margin:0,overflowWrap:"anywhere"}
const mono={fontFamily:"monospace",fontSize:13,color:"#cbd5e1",overflowWrap:"anywhere"}
