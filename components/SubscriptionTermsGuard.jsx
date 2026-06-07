'use client'

import {useEffect, useRef, useState} from 'react'

const TERMS_VERSION = 'architect-layer-2026-06'

function termsAccepted() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('digitalhut:termsAccepted') === TERMS_VERSION
}

function addJsonHeader(headers) {
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const next = new Headers(headers)
    next.set('Content-Type', 'application/json')
    return next
  }
  return {...(headers || {}), 'Content-Type': 'application/json'}
}

export default function SubscriptionTermsGuard() {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const acceptedRef = useRef(false)
  const pendingActionRef = useRef(null)

  useEffect(() => {
    acceptedRef.current = termsAccepted()
    setChecked(acceptedRef.current)

    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init = {}) => {
      const url = typeof input === 'string' ? input : input?.url || ''
      if (!url.includes('/api/subscription')) return originalFetch(input, init)

      const nextInit = {...(init || {})}
      let body = {}
      if (nextInit.body) {
        try {
          body = JSON.parse(nextInit.body)
        } catch {
          body = {}
        }
      }
      nextInit.method = nextInit.method || 'POST'
      nextInit.headers = addJsonHeader(nextInit.headers)
      nextInit.body = JSON.stringify({
        ...body,
        termsAccepted: acceptedRef.current,
        termsVersion: TERMS_VERSION
      })
      return originalFetch(input, nextInit)
    }

    function handleClick(event) {
      const target = event.target?.closest ? event.target : event.target?.parentElement
      const action = target?.closest?.('button,a,[role="button"]')
      if (!action) return
      const label = String(action.textContent || '').trim().toLowerCase()
      const isSubscriptionAction = label.includes('gas route') || label.includes('register subscription') || label.includes('subscribe')
      if (!isSubscriptionAction || acceptedRef.current) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      pendingActionRef.current = action
      setOpen(true)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.fetch = originalFetch
    }
  }, [])

  function acceptAndContinue() {
    if (!checked) return
    acceptedRef.current = true
    window.localStorage.setItem('digitalhut:termsAccepted', TERMS_VERSION)
    window.localStorage.setItem('digitalhut:termsAcceptedAt', new Date().toISOString())
    setOpen(false)
    const action = pendingActionRef.current
    pendingActionRef.current = null
    window.setTimeout(() => action?.click?.(), 0)
  }

  if (!open) return null

  return <div style={styles.overlay} role='dialog' aria-modal='true' aria-label='DigitalHut terms checkpoint'>
    <div style={styles.panel}>
      <p style={styles.eyebrow}>Terms checkpoint</p>
      <h2 style={styles.title}>Accept before subscription registration</h2>
      <p style={styles.copy}>Architect Layer is specifically for builders, developers, researchers, AIs, and experimental users. It exposes structure inspection, selectable layers, GLB review, lighting, props, compass, grid coordinates, and eligible premium or pro download routes.</p>
      <p style={styles.copy}>Architect Layer is experimental observatory tooling. It is not licensed construction, engineering, legal, financial, or safety certification.</p>
      <label style={styles.checkRow}>
        <input type='checkbox' checked={checked} onChange={(event) => setChecked(event.target.checked)} />
        <span>I accept the DigitalHut terms for Architect Layer, wallet verification, subscription registration, and experimental observatory access.</span>
      </label>
      <div style={styles.actions}>
        <a href='/terms' style={styles.secondary}>Read Terms</a>
        <button type='button' onClick={() => setOpen(false)} style={styles.secondaryButton}>Cancel</button>
        <button type='button' onClick={acceptAndContinue} disabled={!checked} style={checked ? styles.primary : styles.disabled}>Accept and Continue</button>
      </div>
    </div>
  </div>
}

const styles = {
  overlay: {position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 18, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(10px)', color: 'white', boxSizing: 'border-box'},
  panel: {width: 'min(560px,92vw)', display: 'grid', gap: 13, padding: 22, borderRadius: 8, border: '1px solid rgba(103,232,249,.28)', background: 'linear-gradient(145deg,rgba(2,6,23,.98),rgba(15,23,42,.96))', boxShadow: '0 30px 90px rgba(0,0,0,.55)'},
  eyebrow: {margin: 0, color: '#67e8f9', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0},
  title: {margin: 0, fontSize: 26, lineHeight: 1.08, letterSpacing: 0},
  copy: {margin: 0, color: '#dbeafe', lineHeight: 1.45},
  checkRow: {display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 10, alignItems: 'start', padding: 12, border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, background: 'rgba(255,255,255,.06)', color: '#f8fafc', lineHeight: 1.4},
  actions: {display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end'},
  primary: {padding: '11px 13px', border: 0, borderRadius: 8, background: '#14b8a6', color: '#021014', fontWeight: 900, cursor: 'pointer'},
  disabled: {padding: '11px 13px', border: 0, borderRadius: 8, background: 'rgba(148,163,184,.28)', color: '#94a3b8', fontWeight: 900, cursor: 'not-allowed'},
  secondary: {display: 'inline-grid', placeItems: 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.16)', color: '#dbeafe', textDecoration: 'none', fontWeight: 900},
  secondaryButton: {padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.06)', color: '#dbeafe', fontWeight: 900, cursor: 'pointer'}
}
