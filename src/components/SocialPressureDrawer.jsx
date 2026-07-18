import {useEffect, useRef, useState} from "react"
import {Link} from "react-router-dom"
import "./SocialPressureDrawer.css"

const OPEN_THRESHOLD = .42
const DRAG_RESISTANCE = .78
const PANEL_WIDTH = 360

export default function SocialPressureDrawer(){
  const [open, setOpen] = useState(false)
  const [dragProgress, setDragProgress] = useState(null)
  const gesture = useRef(null)
  const progress = dragProgress ?? (open ? 1 : 0)

  useEffect(() => {
    if(!open) return undefined
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open])

  function beginPressureSlide(event){
    if(event.button !== undefined && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    gesture.current = {pointerId:event.pointerId,startX:event.clientX,startProgress:open ? 1 : 0}
    setDragProgress(open ? 1 : 0)
  }

  function continuePressureSlide(event){
    const current = gesture.current
    if(!current || current.pointerId !== event.pointerId) return
    const next = current.startProgress + ((current.startX - event.clientX) * DRAG_RESISTANCE) / PANEL_WIDTH
    setDragProgress(Math.max(0, Math.min(1, next)))
  }

  function finishPressureSlide(event){
    const current = gesture.current
    if(!current || current.pointerId !== event.pointerId) return
    const nextOpen = (dragProgress ?? current.startProgress) >= OPEN_THRESHOLD
    gesture.current = null
    setDragProgress(null)
    setOpen(nextOpen)
    if(nextOpen !== open) navigator.vibrate?.(12)
  }

  function handleKey(event){
    if(event.key === "ArrowLeft") setOpen(true)
    if(event.key === "ArrowRight" || event.key === "Escape") setOpen(false)
    if(event.key === "Enter" || event.key === " "){
      event.preventDefault()
      setOpen((current) => !current)
    }
  }

  return <aside className={`dh-social-pressure ${open ? "is-open" : ""} ${dragProgress !== null ? "is-dragging" : ""}`} style={{transform:`translateX(${(1-progress)*100}%)`}} aria-label="DigitalHut social command drawer">
    <button className="dh-social-pressure-handle" type="button" aria-expanded={open} aria-controls="digitalhut-social-pressure-panel" aria-label={open ? "Slide right to close social command" : "Press and slide left to open social command"} onClick={() => {if(dragProgress === null) setOpen((current) => !current)}} onKeyDown={handleKey} onPointerDown={beginPressureSlide} onPointerMove={continuePressureSlide} onPointerUp={finishPressureSlide} onPointerCancel={finishPressureSlide}>
      <span aria-hidden="true">{open ? "›" : "‹"}</span><b>Social</b><small>{open ? "slide right" : "press + slide"}</small>
    </button>
    <div id="digitalhut-social-pressure-panel" className="dh-social-pressure-panel" aria-hidden={!open && dragProgress === null}>
      <header><span>DigitalHut Social Command</span><strong>Verified updates with a human voice.</strong><p>Publish approved DigitalHut releases and move between the observatory and owner operations without losing your place.</p></header>
      <section aria-label="Social command readiness">
        <article><span>Site layer</span><b>Ready</b><small>Canonical announcements and matched share receipts</small></article>
        <article><span>Mixpost server</span><b>Live</b><small>Private owner operations through social.digitalhut.app</small></article>
        <article><span>Automatic publishing</span><b>Approved</b><small>Approved content only, with rate limits, duplicate prevention, receipts, and emergency pause</small></article>
      </section>
      <nav aria-label="Social command destinations">
        <a href="https://social.digitalhut.app/mixpost" className="dh-social-operations-link">Open Social Operations <span aria-hidden="true">→</span></a>
        <Link to="/updates">Open Social Observatory</Link><Link to="/campaign">Review announcement campaigns</Link><Link to="/system-proof">See verified system proof</Link>
      </nav>
      <footer><b>Pressured, not slippery.</b><span>Drag left past the detent to open. Drag right or press Escape to return.</span></footer>
    </div>
  </aside>
}
