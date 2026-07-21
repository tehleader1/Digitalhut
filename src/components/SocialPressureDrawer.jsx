import {useEffect, useRef, useState} from "react"
import {Link} from "react-router-dom"
import {applySocialPressureClick, settleSocialPressureGesture} from "../lib/socialPressureGesture"
import {supabase} from "../lib/supabaseClient"
import "./SocialPressureDrawer.css"

const OPEN_THRESHOLD = .42
const DRAG_RESISTANCE = .78
const PANEL_WIDTH = 360
const MEMBER_REDIRECT_URL = "https://www.digitalhut.app"

export default function SocialPressureDrawer(){
  const [open, setOpen] = useState(false)
  const [dragProgress, setDragProgress] = useState(null)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberStatus, setMemberStatus] = useState("")
  const [memberSubmitting, setMemberSubmitting] = useState(false)
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
    const settled = settleSocialPressureGesture({moved:current.moved, startProgress:current.startProgress, progress:dragProgress ?? current.startProgress, openThreshold:OPEN_THRESHOLD})
    suppressClick.current = settled.suppressNextClick
    gesture.current = null
    setDragProgress(null)
    setOpen(settled.open)
  }
  function cancel(event){
    const current = gesture.current
    if(!current || current.pointerId !== event.pointerId) return
    gesture.current = null
    const settled = settleSocialPressureGesture({cancelled:true, moved:current.moved, startProgress:current.startProgress, progress:dragProgress ?? current.startProgress, openThreshold:OPEN_THRESHOLD})
    suppressClick.current = settled.suppressNextClick
    setDragProgress(null)
    setOpen(settled.open)
  }

  async function requestMemberLink(event){
    event.preventDefault()
    if(memberSubmitting) return
    setMemberSubmitting(true)
    setMemberStatus("Sending your secure email link...")
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email:memberEmail.trim(),
        options:{shouldCreateUser:true, emailRedirectTo:MEMBER_REDIRECT_URL},
      })
      setMemberStatus(error ? "We could not send the link. Check the email and try again." : "Email sent. Membership completes only after you use the one-time link.")
    } catch {
      setMemberStatus("We could not send the link. Check the email and try again.")
    } finally {
      setMemberSubmitting(false)
    }
  }

  return <aside className={`dh-social-pressure ${open ? "is-open" : ""} ${dragProgress !== null ? "is-dragging" : ""}`} style={{transform:`translateX(${(1-progress)*100}%)`}} aria-label="DigitalHut social layer">
    <button ref={handleRef} className="dh-social-pressure-handle" type="button" aria-expanded={open} aria-controls="digitalhut-social-pressure-panel" aria-label={open ? "Close DigitalHut social layer" : "Open DigitalHut social layer"} onClick={() => {const next = applySocialPressureClick({open, suppressNextClick:suppressClick.current}); suppressClick.current = next.suppressNextClick; setOpen(next.open)}} onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel}>
      <span aria-hidden="true">{open ? "›" : "‹"}</span><b>Social</b><small>{open ? "close" : "slide"}</small>
    </button>
    {(open || dragProgress !== null) && <div id="digitalhut-social-pressure-panel" className="dh-social-pressure-panel">
      <header><span>DigitalHut Social Layer</span><strong>Join the public experience or open owner operations.</strong><p>Members receive a secure email sign-in link. Mixpost remains the protected publishing workspace.</p></header>
      <form className="dh-social-member-signup" onSubmit={requestMemberLink}>
        <label htmlFor="digitalhut-social-member-email">Join DigitalHut</label>
        <span>Create or enter your member account with a secure email link.</span>
        <div>
          <input id="digitalhut-social-member-email" type="email" autoComplete="email" placeholder="Email address" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required />
          <button type="submit" disabled={memberSubmitting}>{memberSubmitting ? "Sending..." : "Sign up"}</button>
        </div>
        <small>Your email is sent to Supabase only for DigitalHut account access. By continuing, you accept our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms</Link>. This member account never grants Mixpost or publishing-admin access.</small>
        <p role="status" aria-live="polite">{memberStatus}</p>
      </form>
      <nav aria-label="Social destinations">
        <a href="https://social.digitalhut.app/mixpost">Owner / Operator Login <span aria-hidden="true">→</span></a>
        <Link to="/updates">Open DigitalHut Updates</Link>
        <Link to="/system-proof">See System Proof</Link>
      </nav>
      <footer><b>Press, click, or slide.</b><span>Drag left past the detent to open. Press Escape or the arrow to return.</span></footer>
    </div>}
  </aside>
}
