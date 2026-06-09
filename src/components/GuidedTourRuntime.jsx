import React, {useEffect, useMemo, useState} from "react"
import {buildGuideSession, guideQuestion, stageAt} from "../lib/guidedTourEngine"
import "./GuidedTourRuntime.css"

function readText(selector, fallback = ""){
  const node = document.querySelector(selector)
  return node?.textContent?.replace(/\s+/g, " ").trim() || fallback
}

function readSnapshot(){
  const badges = Array.from(document.querySelectorAll(".dh-state-badges span")).map((node) => node.textContent.replace(/\s+/g, " ").trim()).filter(Boolean)
  const providerBadges = Array.from(document.querySelectorAll(".dh-card-text small, .dh-rail-head b, .dh-model-status")).map((node) => node.textContent.replace(/\s+/g, " ").trim()).filter(Boolean)

  return {
    title: readText(".dh-title", readText("h1", "DigitalHut observatory feed")),
    category: badges[0] || readText(".dh-rail-head span", "Continent").replace(/ Tour$/i, ""),
    mode: badges[1] || "regular",
    status: badges[2] || providerBadges[0] || "feed-ready",
    note: readText(".dh-note", "The renderer is ready for guided analysis."),
    providerMix: providerBadges.slice(0, 4),
    tier: readText(".dh-account", "guest").split("/").pop()?.trim() || "guest"
  }
}

function speak(text){
  if(typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.94
  utter.pitch = 0.92
  window.speechSynthesis.speak(utter)
}

function openContainment(){
  window.dispatchEvent(new CustomEvent("digitalhut:open-containment"))
}

export default function GuidedTourRuntime({children}){
  const [snapshot, setSnapshot] = useState(() => ({title: "DigitalHut observatory feed", category: "Continent", mode: "regular", status: "feed-ready", note: "", providerMix: [], tier: "guest"}))
  const [stageIndex, setStageIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    function refresh(){
      setSnapshot(readSnapshot())
    }

    refresh()
    const timer = window.setInterval(refresh, 1200)
    const observer = new MutationObserver(refresh)
    observer.observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true})
    return () => {
      window.clearInterval(timer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    setStageIndex(0)
  }, [snapshot.title, snapshot.category])

  const session = useMemo(() => buildGuideSession(snapshot), [snapshot])
  const stage = stageAt(session, stageIndex)
  const question = guideQuestion(session, stage)

  useEffect(() => {
    if(!playing) return undefined
    const timer = window.setInterval(() => setStageIndex((current) => (current + 1) % session.stages.length), 11000)
    return () => window.clearInterval(timer)
  }, [playing, session.stages.length])

  function next(){
    const nextIndex = (stageIndex + 1) % session.stages.length
    setStageIndex(nextIndex)
    const nextStage = stageAt(session, nextIndex)
    if(nextStage) speak(nextStage.script)
  }

  function runStage(){
    if(stage) speak(stage.script)
  }

  function analyzeAndOpen(){
    if(stage) speak(`${stage.label}. ${stage.script}`)
    openContainment()
  }

  return <>
    {children}
    <section className={`dh-guide-brain ${expanded ? "expanded" : "collapsed"}`} aria-label="DigitalHut guided tour brain">
      <button className="dh-guide-toggle" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Guide" : "Tour"}</button>
      {expanded && <div className="dh-guide-panel">
        <div className="dh-guide-head">
          <span>AI Observatory Guide</span>
          <b>{session.category}</b>
        </div>

        <div className="dh-guide-stage-row">
          {session.stages.map((item, index) => <button key={item.id} type="button" className={index === stageIndex ? "active" : ""} onClick={() => setStageIndex(index)}>{index + 1}</button>)}
        </div>

        <p className="dh-guide-kicker">{stage?.label}</p>
        <h2>{session.title}</h2>
        <p className="dh-guide-script">{stage?.script}</p>
        <p className="dh-guide-question">{question}</p>

        <div className="dh-guide-actions">
          <button type="button" onClick={runStage}>Voice</button>
          <button type="button" onClick={next}>Next</button>
          <button type="button" onClick={analyzeAndOpen}>Open Containment</button>
          <button type="button" className={playing ? "active" : ""} onClick={() => setPlaying((value) => !value)}>{playing ? "Auto On" : "Auto"}</button>
        </div>
      </div>}
    </section>
  </>
}
