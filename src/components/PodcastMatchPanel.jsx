import React, {useEffect, useRef, useState} from "react"
import "./PodcastMatchPanel.css"

const voiceLanes = {
  "Mainstream Streaming": ["Gary Vaynerchuk podcast", "MrBeast interview", "Joe Rogan podcast", "Asian Boss podcast", "TED Talks Daily", "Fat Trel interview", "El Alfa interview", "Chuck podcast"],
  Gamer: ["immersive VR MMO podcast", "Roblox creator podcast", "Zenith VR MMO", "Vendetta Online interview"],
  Planetary: ["Neil deGrasse Tyson podcast", "Elon Musk space interview", "Galileo astronomy history", "Isaac Newton science history"],
  "Orbital Compute": ["Starlink podcast", "free space optical communications podcast", "space data center podcast", "perovskite solar cell podcast", "satellite internet podcast"],
  Science: ["Neil deGrasse Tyson podcast", "Donald Hoffman interview", "Lara Boyd neuroscience", "Tina Seelig Stanford podcast", "Nikola Tesla science history", "Albert Einstein science history"],
  Researcher: ["Professor Ravi Korisettar archaeology", "Stanford research podcast", "Harvard science podcast", "Donald Hoffman consciousness", "Lara Boyd brain"],
  Programmer: ["Jensen Huang podcast", "Bill Gates technology podcast", "John Ternus interview", "Elon Musk technology interview"],
  Businesses: ["Jeff Bezos interview", "AT&T CEO John Stankey interview", "Gary Vaynerchuk podcast", "Bill Gates podcast"],
  History: ["Galileo history podcast", "Isaac Newton history podcast", "Nikola Tesla history podcast", "Albert Einstein history podcast", "Jesus Christ history scholarship", "Prophet Muhammad history scholarship"],
  Continent: ["Asian Boss podcast", "Harvard global studies podcast", "Stanford travel culture podcast", "TED global ideas"],
  "Real Estate": ["international real estate podcast", "global housing podcast", "Gary Vaynerchuk business podcast"]
}

function laneIndex(feed, length){
  const value = String(feed?.id || feed?.title || "")
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0) % Math.max(length, 1)
}

function podcastQuery(feed){
  const lane = voiceLanes[feed?.category] || ["TED Talks Daily", "Stanford podcast", "Harvard podcast"]
  const voice = lane[laneIndex(feed, lane.length)]
  return [voice, feed?.title, feed?.query].filter(Boolean).join(" ").slice(0, 220)
}

export default function PodcastMatchPanel({feed, compact = false}){
  const [episodes, setEpisodes] = useState([])
  const [status, setStatus] = useState("idle")
  const [activeId, setActiveId] = useState("")
  const [playbackStatus, setPlaybackStatus] = useState("")
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
    setPlaybackStatus("")
    if(!episode.audioUrl){
      setPlaybackStatus("Publisher audio is unavailable. Open the official episode page.")
      return
    }
    const audio = new Audio(episode.audioUrl)
    audio.preload = "metadata"
    audio.volume = 1
    audio.muted = false
    audioRef.current = audio
    audio.addEventListener("loadedmetadata", () => {
      if(Number.isFinite(audio.duration) && audio.duration > 50){
        audio.currentTime = Math.min(30, Math.max(8, audio.duration * .08))
      }
    }, {once: true})
    audio.addEventListener("playing", () => {
      setActiveId(episode.id)
      setPlaybackStatus(`Playing publisher audio from ${episode.show}`)
    }, {once: true})
    audio.addEventListener("error", () => {
      setActiveId("")
      setPlaybackStatus("This publisher blocked direct preview audio. Open the official episode page.")
    }, {once: true})
    audio.play().catch(() => {
      setActiveId("")
      setPlaybackStatus("Your browser blocked the preview. Press Play again or open the official episode.")
    })
    clipTimer.current = window.setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
      setActiveId("")
      setPlaybackStatus("10-second publisher clip complete")
    }, 10000)
    audio.addEventListener("ended", () => setActiveId(""), {once: true})
  }

  if(status === "idle" || status === "loading") return <aside className={`dh-podcast-panel ${compact ? "compact" : ""}`}><span>Matching an intelligent podcast voice to this 3D environment...</span></aside>
  if(!episodes.length) return null

  return <aside className={`dh-podcast-panel ${compact ? "compact" : ""}`}>
    <header><span>Matched Podcast Voices</span><b>3D remains primary</b></header>
    {playbackStatus && <div className="dh-podcast-status" role="status">{playbackStatus}</div>}
    <div className="dh-podcast-list">
      {episodes.map((episode) => <article key={episode.id} className={activeId === episode.id ? "playing" : ""}>
        {episode.artwork ? <img src={episode.artwork} alt={`${episode.show} official podcast artwork`} loading="lazy" /> : <div className="dh-podcast-art">Audio</div>}
        <div><b>{episode.title}</b><span>{episode.show}</span><small>{episode.author}</small></div>
        <button type="button" onClick={() => activeId === episode.id ? (audioRef.current?.pause(), setActiveId("")) : playClip(episode)} disabled={!episode.audioUrl}>{activeId === episode.id ? "Stop" : "Play 10s"}</button>
        {episode.pageUrl && <a href={episode.pageUrl} target="_blank" rel="noreferrer">Podcast</a>}
      </article>)}
    </div>
    <small>Artwork, episode audio, and attribution come from publisher feeds. DigitalHut does not clone voices, imply endorsement, or fabricate recordings for historical or religious figures.</small>
  </aside>
}
