import React, {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {supabase} from "../lib/supabaseClient"
import "./AccountSubscriptionPanel.css"

function redirectUrl(){
  if(typeof window === "undefined") return "https://www.digitalhut.app/"
  const url = new URL(window.location.href)
  url.searchParams.set("account_return", "1")
  return url.toString()
}

export default function AccountSubscriptionPanel({onSession, onOpenTiers, onOpenProfile}){
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({data}) => {
      if(!active) return
      const next = data.session || null
      setSession(next)
      onSession?.(next)
      if(next?.user?.app_metadata?.provider === "email" && next.user.user_metadata?.password_created !== true) setNeedsPassword(true)
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      onSession?.(next)
      if(next?.user?.app_metadata?.provider === "email" && next.user.user_metadata?.password_created !== true) setNeedsPassword(true)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [onSession])

  async function continueWithGoogle(){
    setBusy(true)
    setStatus("Opening secure Google sign in...")
    try {
      const {error} = await supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo:redirectUrl()}})
      if(error) throw error
    } catch(error){
      setStatus(error?.message || "Google sign in could not start. Check the connection and try again.")
      setBusy(false)
    }
  }

  async function submitEmail(event){
    event.preventDefault()
    if(busy) return
    setBusy(true)
    setStatus(mode === "signup" ? "Creating your secure account..." : "Signing in...")
    try {
      if(mode === "signup" && password.length < 8) throw new Error("Use at least 8 characters for your password.")
      if(mode === "signup" && password !== confirmPassword) throw new Error("The passwords do not match.")
      const result = mode === "signup"
        ? await supabase.auth.signUp({
          email:email.trim(),
          password,
          options:{emailRedirectTo:redirectUrl(), data:{password_created:true}}
        })
        : await supabase.auth.signInWithPassword({email:email.trim(), password})
      if(result.error) throw result.error
      setStatus(mode === "signup"
        ? result.data?.session
          ? "Account created and signed in."
          : "Account created. Open the confirmation email to finish signing in."
        : "Signed in.")
    } catch(error){
      setStatus(error?.message || "That account could not be opened. Check the details and try again.")
    } finally { setBusy(false) }
  }

  async function savePassword(event){
    event.preventDefault()
    if(newPassword.length < 8){ setStatus("Use at least 8 characters for your password."); return }
    if(newPassword !== confirmPassword){ setStatus("The passwords do not match."); return }
    setBusy(true)
    const {error} = await supabase.auth.updateUser({password:newPassword, data:{password_created:true}})
    setBusy(false)
    if(error){ setStatus(error.message || "Password could not be saved."); return }
    setNeedsPassword(false)
    setStatus("")
    onOpenProfile?.()
  }

  return <>
    {!session && <aside className="dh-account-signin" aria-label="DigitalHut sign in and subscription">
      <header><span>DIGITALHUT ACCOUNT</span><h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2><p>Save your profile, subscription access, and observatory history.</p></header>
      <button className="dh-google-login" type="button" onClick={continueWithGoogle} disabled={busy}><b aria-hidden="true">G</b> Continue with Google</button>
      <div className="dh-auth-divider"><i />or with email<i /></div>
      <div className="dh-auth-tabs"><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button></div>
      <form onSubmit={submitEmail}>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
        <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "signup" ? 8 : undefined} required /></label>
        {mode === "signup" && <label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required /></label>}
        <button className="dh-email-login" type="submit" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in with email"}</button>
      </form>
      <button className="dh-tier-signup" type="button" onClick={onOpenTiers}>View tiers + create account</button>
      <p className="dh-auth-status" role="status" aria-live="polite">{status}</p>
      <small>By continuing, you agree to the DigitalHut <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</small>
    </aside>}
    {session && needsPassword && <section className="dh-password-finish" role="dialog" aria-modal="true" aria-label="Create account password"><form onSubmit={savePassword}>
      <span>EMAIL CONFIRMED</span><h2>Create your password</h2><p>Your DigitalHut email is verified. Add a password to finish the account.</p>
      <label>New password<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="8" required /></label>
      <label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required /></label>
      <button type="submit" disabled={busy}>{busy ? "Saving..." : "Finish account"}</button><p role="status">{status}</p>
    </form></section>}
  </>
}
