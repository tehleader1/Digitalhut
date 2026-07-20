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
  const handleRef = useRef(null)
  const suppressClick = useRef(false)
  const progress = dragProgress ?? (open ? 1 : 0)

  useEffect(() => {
    if(!open) return undefined
    const closeOnEscape = event => {
      if(event.key !== "Escape") return
      setOpen(false)
      window.requestAnimationFrame(() => handleRef.current?.focus())
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open])

  function begin(event){
    if(event.button !== undefined && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    gesture.current = {pointerId:event.pointerId, startX:event.clientX, startProgress:open ? 1 : 0, moved:false}
    setDragProgress(open ? 1 : 0)
  }
  function move(event){
    const current = gesture.current
    if(!current || current.pointerId !== event.pointerId) return
    if(Math.abs(current.startX - event.clientX) > 4) current.moved = true
    setDragProgress(Math.max(0, Math.min(1, current.startProgress + ((current.startX - event.clientX) * DRAG_RESISTANCE) / PANEL_WIDTH)))
  }
  function finish(event){
    const current = gesture.current
    if(!current || current.pointerId !== event.pointerId) return
    const nextOpen = current.moved ? (dragProgress ?? current.startProgress) >= OPEN_THRESHOLD : open
    suppressClick.current = current.moved
    gesture.current = null
    setDragProgress(null)
    setOpen(nextOpen)
  }

  return <aside className={`dh-social-pressure ${open ? "is-open" : ""} ${dragProgress !== null ? "is-dragging" : ""}`} style={{transform:`translateX(${(1-progress)*100}%)`}} aria-label="DigitalHut social layer">
    <button ref={handleRef} className="dh-social-pressure-handle" type="button" aria-expanded={open} aria-controls="digitalhut-social-pressure-panel" aria-label={open ? "Close DigitalHut social layer" : "Open DigitalHut social layer"} onClick={() => {if(suppressClick.current){suppressClick.current = false; return} setOpen(value => !value)}} onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}>
      <span aria-hidden="true">{open ? "›" : "‹"}</span><b>Social</b><small>{open ? "close" : "slide"}</small>
    </button>
    {(open || dragProgress !== null) && <div id="digitalhut-social-pressure-panel" className="dh-social-pressure-panel">
      <header><span>DigitalHut Social Layer</span><strong>Move from observatory to owner operations.</strong><p>The main experience stays public. Mixpost remains the protected publishing workspace.</p></header>
      <nav aria-label="Social destinations">
        <a href="https://social.digitalhut.app/mixpost">Open Social Operations <span aria-hidden="true">→</span></a>
        <Link to="/updates">Open DigitalHut Updates</Link>
        <Link to="/system-proof">See System Proof</Link>
      </nav>
      <footer><b>Press, click, or slide.</b><span>Drag left past the detent to open. Press Escape or the arrow to return.</span></footer>
    </div>}
  </aside>
}
