import React, {useEffect, useRef, useState} from "react"
import "./PodcastMatchPanel.css"

function podcastQuery(feed){
  return [feed?.title, feed?.category, feed?.query, "environment structure terrain research"].filter(Boolean).join(" ").slice(0, 220)
}

export default function PodcastMatchPanel({feed, compact = false}){
  const [episodes, setEpisodes] = useState([])
  const [status, setStatus] = useState("idle")
  const [activeId, setActiveId] = useState("")
  const audioRef = useRef(null)
  const clipTimer = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setStatus("loading")
      try {
        const response = await fetch(`/api/podcast-search?query=${encodeURIComponent(podcastQuery(feed))}`, {signal: controller.signal})
        const payload = await response.json()
        setEpisodes(Array.isArray(payload.episodes) ? payload.episodes : [])
        setStatus(payload.episodes?.length ? "ready" : "empty")
      } catch (error) {
        if(error?.name !== "AbortError") setStatus("empty")
      }
    }, 700)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      window.clearTimeout(clipTimer.current)
      audioRef.current?.pause()
    }
  }, [feed?.id, feed?.title, feed?.category, feed?.query])

  function playClip(episode){
    window.clearTimeout(clipTimer.current)
    audioRef.current?.pause()
    if(!episode.audioUrl) return
    const audio = new Audio(episode.audioUrl)
    audio.preload = "metadata"
    audioRef.current = audio
    setActiveId(episode.id)
    audio.play().catch(() => setActiveId(""))
    clipTimer.current = window.setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
      setActiveId("")
    }, 10000)
    audio.addEventListener("ended", () => setActiveId(""), {once: true})
  }

  if(status === "idle" || status === "loading") return <aside className={`dh-podcast-panel ${compact ? "compact" : ""}`}><span>Matching an intelligent podcast voice to this 3D environment...</span></aside>
  if(!episodes.length) return null

  return <aside className={`dh-podcast-panel ${compact ? "compact" : ""}`}>
    <header><span>Matched Podcast Voices</span><b>3D remains primary</b></header>
    <div className="dh-podcast-list">
      {episodes.map((episode) => <article key={episode.id} className={activeId === episode.id ? "playing" : ""}>
        {episode.artwork ? <img src={episode.artwork} alt={`${episode.show} official podcast artwork`} loading="lazy" /> : <div className="dh-podcast-art">Audio</div>}
        <div><b>{episode.title}</b><span>{episode.show}</span><small>{episode.author}</small></div>
        <button type="button" onClick={() => activeId === episode.id ? (audioRef.current?.pause(), setActiveId("")) : playClip(episode)} disabled={!episode.audioUrl}>{activeId === episode.id ? "Stop" : "Play 10s"}</button>
        {episode.pageUrl && <a href={episode.pageUrl} target="_blank" rel="noreferrer">Podcast</a>}
      </article>)}
    </div>
    <small>Artwork and attribution come from the podcast publisher feed. DigitalHut does not infer a speaker identity when no official person image is supplied.</small>
  </aside>
}
