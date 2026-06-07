export const metadata = {
  title: 'DigitalHut Terms',
  description: 'DigitalHut subscription, wallet, Architect Layer, and experimental observatory terms.'
}

export default function TermsPage() {
  return <main style={styles.page}>
    <section style={styles.panel}>
      <a href='/' style={styles.back}>Back to DigitalHut</a>
      <p style={styles.eyebrow}>Terms and Conditions</p>
      <h1 style={styles.title}>DigitalHut Terms</h1>
      <p style={styles.copy}>These terms apply before a subscription registers, before a wallet payment route is prepared, and before premium or pro observatory access is unlocked.</p>

      <section style={styles.section}>
        <h2 style={styles.heading}>Architect Layer</h2>
        <p style={styles.copy}>Architect Layer is specifically for builders, developers, researchers, AIs, and experimental users. It is designed for structure inspection, layer views, GLB review, lighting checks, props, compass, grid coordinates, prototype review, and eligible premium or pro download routes.</p>
        <p style={styles.copy}>Architect Layer is experimental observatory tooling. It is not licensed construction, engineering, legal, financial, safety, or code-compliance certification.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Wallet And Subscription</h2>
        <p style={styles.copy}>Before subscription registration, DigitalHut may ask for wallet confirmation, wallet unlock, tier selection, currency selection, and acceptance of these terms. Gas route preparation does not replace your responsibility to review wallet prompts before confirming.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Observatory Content</h2>
        <p style={styles.copy}>DigitalHut combines public observatory feeds, GLB previews, market intelligence surfaces, adaptive recommendations, and experimental discovery tools. Public users can explore available models and feeds; premium and pro users may receive deeper inspection and download access where eligible.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>Experimental Access</h2>
        <p style={styles.copy}>Features may change as DigitalHut evolves. Adaptive feeds, decentralized discovery, market surfaces, and AI-assisted views are provided for exploration and research, not as guaranteed professional advice.</p>
      </section>
    </section>
  </main>
}

const styles = {
  page: {minHeight: '100vh', background: 'linear-gradient(135deg,#020617,#07111f 48%,#111827)', color: 'white', fontFamily: 'Arial, sans-serif', padding: 18, boxSizing: 'border-box'},
  panel: {maxWidth: 900, margin: '0 auto', display: 'grid', gap: 18, padding: '28px 20px'},
  back: {justifySelf: 'start', color: '#dbeafe', textDecoration: 'none', fontWeight: 900, border: '1px solid rgba(255,255,255,.16)', borderRadius: 8, padding: '10px 12px'},
  eyebrow: {margin: 0, color: '#67e8f9', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0},
  title: {margin: 0, fontSize: 'clamp(38px,8vw,72px)', lineHeight: .96, letterSpacing: 0},
  section: {display: 'grid', gap: 8, padding: 16, border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, background: 'rgba(2,6,23,.58)'},
  heading: {margin: 0, fontSize: 22, lineHeight: 1.12, letterSpacing: 0},
  copy: {margin: 0, color: '#dbeafe', lineHeight: 1.55, overflowWrap: 'anywhere'}
}
