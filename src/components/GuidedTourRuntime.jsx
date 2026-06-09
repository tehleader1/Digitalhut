import React, {useEffect, useMemo, useState} from "react"
import {buildGuideSession, guideQuestion, stageAt} from "../lib/guidedTourEngine"
import "./GuidedTourRuntime.css"

const stockImages = {
  "Continent": ["photo-1500530855697-b586d89ba3ee", "photo-1486406146926-c627a92ad1ab", "photo-1518005020951-eccb494ad742", "photo-1493246507139-91e8fad9978e"],
  "Planetary": ["photo-1446776811953-b23d57bd21aa", "photo-1454789548928-9efd52dc4031", "photo-1462331940025-496dfbfc7564", "photo-1419242902214-272b3f66ee7a"],
  "Gamer": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420", "photo-1550745165-9bc0b252726f", "photo-1493711662062-fa541adb3fc8"],
  "Real Estate": ["photo-1560518883-ce09059eeffa", "photo-1600585154340-be6161a56a0c", "photo-1484154218962-a197022b5858", "photo-1600607687939-ce8a6c25118c"],
  "Workforce": ["photo-1504307651254-35680f356dfd", "photo-1517048676732-d65bc937f952", "photo-1521791136064-7986c2920216", "photo-1581092918056-0c4c3acd3789"],
  "Home Project": ["photo-1513694203232-719a280e022f", "photo-1600585154526-990dced4db0d", "photo-1586023492125-27b2c045efd7", "photo-1505693416388-ac5ce068fe85"],
  "Political": ["photo-1529107386315-e1a2ed48a620", "photo-1464692805480-a69dfaafdb0d", "photo-1523292562811-8fa7962a78c8", "photo-1500534314209-a25ddb2bd429"],
  "Programmer": ["photo-1515879218367-8466d910aaa4", "photo-1555066931-4365d14bab8c", "photo-1516321318423-f06f85e504b3", "photo-1558494949-ef010cbdcc31"],
  "Researcher": ["photo-1532094349884-543bc11b234d", "photo-1507413245164-6160d8298b31", "photo-1581093588401-fbb62a02f120", "photo-1451187580459-43490279c0fa"],
  "Stock Options Market": ["photo-1611974789855-9c2a0a7236a3", "photo-1520607162513-77705c0f0d4a", "photo-1642543348745-03b1219733d9", "photo-1526378722484-bd91ca387e72"],
  "Social Media Trends": ["photo-1611162617474-5b21e879e113", "photo-1557804506-669a67965ba0", "photo-1516321497487-e288fb19713f", "photo-1495020689067-958852a7765e"]
}

function stockUrl(category, index = 0){
  const pool = stockImages[category] || stockImages.Continent
  const id = pool[index % pool.length]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=760&q=82`
}

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

function activeCategory(){
  return readText(".dh-category-card.active small", readText(".dh-state-badges span", "Continent"))
}

function setStyleVar(node, name, value){
  if(!node || node.style.getPropertyValue(name) === value) return
  node.style.setProperty(name, value)
}

function setDataset(node, name, value){
  if(!node || node.dataset[name] === value) return
  node.dataset[name] = value
}

function labelFor(card){
  return card?.querySelector?.(".dh-card-text b")?.textContent || card?.querySelector?.("b")?.textContent || card?.querySelector?.("small")?.textContent || card?.textContent || "DigitalHut preview"
}

function decorateVisualCards(){
  if(typeof document === "undefined") return

  document.querySelectorAll(".dh-category-card").forEach((card, index) => {
    const category = card.querySelector("small")?.textContent?.replace(/\s+/g, " ").trim() || "Continent"
    const src = stockUrl(category, index)
    setDataset(card, "preview", src)
    setDataset(card, "previewTitle", category)
    setStyleVar(card, "--category-thumb-url", `url("${src}")`)
    card.classList.add("has-stock-thumb")
  })

  const category = activeCategory()
  document.querySelectorAll(".dh-tour-card").forEach((card, index) => {
    const src = stockUrl(category, index + 1)
    const title = `${category} ${labelFor(card)}`.replace(/\s+/g, " ").trim()
    const visual = card.querySelector(".dh-tour-visual")
    setDataset(card, "preview", src)
    setDataset(card, "previewTitle", title)
    if(visual){
      setStyleVar(visual, "--tour-thumb-url", `url("${src}")`)
      visual.classList.add("has-stock-thumb")
    }
  })

  document.querySelectorAll(".dh-feed-card").forEach((card, index) => {
    const image = card.querySelector(".dh-mini-thumb")
    const src = image?.currentSrc || image?.getAttribute("src") || stockUrl(category, index)
    const visual = card.querySelector(".dh-mini-visual")
    setDataset(card, "preview", src)
    setDataset(card, "previewTitle", labelFor(card))
    if(visual && !image){
      setStyleVar(visual, "--feed-thumb-url", `url("${src}")`)
      visual.classList.add("has-stock-thumb")
    }
  })
}

function emitPreview(card, full = false){
  if(!card) return
  decorateVisualCards()
  window.dispatchEvent(new CustomEvent("digitalhut:preview-containment", {
    detail: {
      src: card.dataset.preview || "",
      title: card.dataset.previewTitle || labelFor(card),
      full
    }
  }))
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
      decorateVisualCards()
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
    function cardFrom(event){
      return event.target.closest?.(".dh-feed-card, .dh-tour-card, .dh-category-card")
    }

    function pointerPreview(event){
      const card = cardFrom(event)
      if(card) emitPreview(card, true)
    }

    function clearPreview(event){
      const card = cardFrom(event)
      if(!card || card.contains(event.relatedTarget)) return
      window.dispatchEvent(new CustomEvent("digitalhut:preview-containment", {detail: {clearFull: true}}))
    }

    function clickAccess(event){
      const card = cardFrom(event)
      const guideButton = event.target.closest?.(".dh-guide-stage-row button, .dh-guide-actions button")
      if(!card && !guideButton) return
      if(card) emitPreview(card, true)
      window.setTimeout(openContainment, 80)
      window.setTimeout(openContainment, 760)
    }

    document.addEventListener("pointerover", pointerPreview, true)
    document.addEventListener("pointerout", clearPreview, true)
    document.addEventListener("click", clickAccess, true)
    return () => {
      document.removeEventListener("pointerover", pointerPreview, true)
      document.removeEventListener("pointerout", clearPreview, true)
      document.removeEventListener("click", clickAccess, true)
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
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % session.stages.length)
      openContainment()
    }, 11000)
    return () => window.clearInterval(timer)
  }, [playing, session.stages.length])

  function next(){
    const nextIndex = (stageIndex + 1) % session.stages.length
    setStageIndex(nextIndex)
    const nextStage = stageAt(session, nextIndex)
    if(nextStage) speak(nextStage.script)
    openContainment()
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
          {session.stages.map((item, index) => <button key={item.id} type="button" className={index === stageIndex ? "active" : ""} onClick={() => {setStageIndex(index); openContainment()}}>{index + 1}</button>)}
        </div>

        <p className="dh-guide-kicker">{stage?.label}</p>
        <h2>{session.title}</h2>
        <p className="dh-guide-script">{stage?.script}</p>
        <p className="dh-guide-question">{question}</p>

        <div className="dh-guide-actions">
          <button type="button" onClick={runStage}>Voice</button>
          <button type="button" onClick={next}>Next</button>
          <button type="button" onClick={analyzeAndOpen}>Open Containment</button>
          <button type="button" className={playing ? "active" : ""} onClick={() => {setPlaying((value) => !value); openContainment()}}>{playing ? "Auto On" : "Auto"}</button>
        </div>
      </div>}
    </section>
  </>
}
