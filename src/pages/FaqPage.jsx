import React from "react"
import "./FaqPage.css"

const sections = [
  {
    title: "Entering the renderer",
    body: "DigitalHut opens with a short system load that measures display motion and prepares the fullscreen observatory. If you have been away for about 5 to 10 minutes, the account chooser returns so the platform can reload your profile, tier, wallet state, and renderer quality."
  },
  {
    title: "Search",
    body: "Use the search box to ask for a place, object, model, market, structure, project, or research topic. Search runs against the observatory feed and can combine 3D model results, geospatial context, market context, and provider diagnostics when the matching API keys are available."
  },
  {
    title: "Regular GLB mode",
    body: "Regular API mode loads the best available live 3D result or API-backed visual preview. Use it when you want to inspect quickly, move through the regular feed, compare choices, save, share, embed, or open the source model."
  },
  {
    title: "Premium guided tour mode",
    body: "Premium Tour mode turns the renderer into a narrated sequence. The AI starts on the current model, rotates for a second angle, chooses a similar model for comparison, then moves into a statistics model with provider context. The tour adapts to the selected category and search intent."
  },
  {
    title: "Categories",
    body: "The library categories reset the active renderer context: Continent, Planetary, Gamer, Real Estate, Workforce, Home Project, Political, Programmer, and Researcher. Selecting a category reloads the feed, the suggested tours, and the AI narration frame."
  },
  {
    title: "Editing and smart layers",
    body: "Premium and Pro members can open Smart Layers for Base, Architect, Lighting, Props, Grid, and Coordinates. These controls are for scene inspection, presentation, measurement-style review, embedding, and builder workflows. Mesh-level destructive editing remains an external builder workflow until the full in-app editor is added."
  },
  {
    title: "Architect layer terms",
    body: "The Architect layer is for builders, developers, researchers, AIs, and experimental use. By using it in a paid account, you acknowledge it is a prototype and inspection environment, not a final engineering approval, permit, appraisal, or construction signoff."
  },
  {
    title: "Voice",
    body: "Use Voice to have the AI speak the current search, category, or guided-tour purpose. Browser voice support depends on the device and user settings, so the visual renderer remains usable even when voice is muted or blocked."
  },
  {
    title: "Wallet and subscription",
    body: "Wallet prompts should feel live: confirm in your wallet extension, unlock the wallet if needed, and retry when the wallet is locked. Download, advanced layers, and guided-tour depth can be gated by Standard, Premium, and Pro tiers."
  },
  {
    title: "Renderer controls",
    body: "Pause or resume the guided sequence, step backward or forward through the feed, switch to the next stage, choose a tour card, or choose a regular feed card. The interface stays minimal and fades only after a longer idle period so the renderer remains fullscreen-first."
  }
]

export default function FaqPage(){
  return <main className="dh-faq">
    <header className="dh-faq-hero">
      <a href="/" className="dh-faq-back">Back to renderer</a>
      <p>DigitalHut Observatory</p>
      <h1>Renderer FAQ</h1>
      <span>Search, guided tours, live feeds, smart layers, wallet flow, and premium operation.</span>
    </header>

    <section className="dh-faq-grid">
      {sections.map((section) => <article key={section.title} className="dh-faq-card">
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      </article>)}
    </section>
  </main>
}
