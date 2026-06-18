import React, {useEffect} from "react"
import {Link, useLocation} from "react-router-dom"
import "./TrustPage.css"

const content = {
  about: {
    title: "About DigitalHut",
    description: "DigitalHut is an AI-guided observatory for public media, 3D environments, market context, travel awareness, research sessions, and personal GLB libraries.",
    sections: [
      ["Observatory system", "The main categories include Mainstream Streaming, Planetary, Real Estate, Mobility, Science, Researcher, Continent, History, Businesses, Workforce, Programmer, Gamer, and DigitalHut Presentation."],
      ["Market intelligence", "Configured market sources can summarize bullish or bearish pressure and compare related statistics. Every result remains informational, source-dependent, and not financial advice."],
      ["Defensive AI Guardians", "Desktop and mobile Guardians provide client continuity, duplicate-action controls, rate limiting, integrity records, privacy checks, and calm research-session safety reminders."]
    ]
  },
  contact: {
    title: "Contact DigitalHut",
    description: "Use this page for support, security reports, sponsorship, asset-library questions, and service-plan assistance.",
    sections: [
      ["Support request", "Include the page, category, model title, device, browser, and exact message you saw. Never include a seed phrase, private key, wallet password, or sensitive identity document."],
      ["Security partnership", "Responsible security researchers and legitimate partners may report reproducible issues. DigitalHut records defensive events but does not hack back or automatically enroll anyone as a sponsor."],
      ["Client continuity", "Use Route My Wallet in the Guardian panel to create a pseudonymous local client identifier that helps retain your selected tier and session continuity on this device."]
    ]
  },
  privacy: {
    title: "DigitalHut Privacy",
    description: "DigitalHut separates public observatory content, local client continuity, wallet connection state, Supabase configuration, and the personal FireCuda asset library.",
    sections: [
      ["Wallet privacy", "DigitalHut may detect whether a wallet is connected. It must never request or store a seed phrase, private key, or wallet password."],
      ["History and storage", "Notes, feeds, client identifiers, and integrity records may remain in local browser storage. Supabase history is only confirmed when a configured backend successfully saves it. FireCuda storage remains a separate personal physical archive."],
      ["Guardian audit", "Integrity events retain a limited local record of time, route, severity, and defensive action. The client Guardian does not prove a person's identity or authorize retaliation."]
    ]
  },
  guardian: {
    title: "Defensive AI Guardian",
    description: "The Guardian is DigitalHut's visible client-protection and research-session awareness layer.",
    sections: [
      ["Digital protection", "The Guardian rate-limits rapid duplicate interactions, flags suspicious route input, pauses live actions when offline, and preserves a local integrity audit."],
      ["Research awareness", "For germs, molecules, extreme temperatures, animals, insects, and other hazardous subjects, the Guardian can present PPE, containment, source-verification, and emergency-contact reminders."],
      ["Operational limit", "The Guardian cannot detect physical hazards, certify a laboratory, replace trained personnel, provide physical containment, control a vehicle, or substitute for emergency services."]
    ]
  }
}

export default function TrustPage({type = "about"}){
  const location = useLocation()
  const page = content[type] || content.about

  useEffect(() => {
    document.title = `${page.title} | DigitalHut`
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = page.description
  }, [page])

  const securityTopic = new URLSearchParams(location.search).get("topic") === "security-partnership"

  return <main className="dh-trust-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav><Link to="/about">About</Link><Link to="/guardian">Guardian</Link><Link to="/privacy">Privacy</Link><Link to="/contact">Contact</Link></nav>
    </header>
    <section className="dh-trust-intro">
      <span>{securityTopic ? "Security partnership" : "DigitalHut trust center"}</span>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
    </section>
    <section className="dh-trust-grid">
      {page.sections.map(([title, text]) => <article key={title}><h2>{title}</h2><p>{text}</p></article>)}
    </section>
    <section className="dh-trust-license">
      <b>Copyright 2026 DigitalHut / Anthony. All rights reserved.</b>
      <p>The source code, original artwork, Guardian characters, written observatory presentation, and specific visual expression are proprietary. General ideas, systems, methods, categories, and functional concepts may not receive the same copyright protection as original expression.</p>
      <Link to="/">Return to the observatory</Link>
    </section>
  </main>
}
