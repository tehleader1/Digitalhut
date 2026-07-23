import React, {useEffect, useMemo, useRef, useState} from "react"
import "./SemanticAnalyticsPanel.css"

const palette = ["#50f2ff", "#8b7cff", "#ffca6a", "#ff6ea9", "#69f0ae", "#ff806b"]

function clean(value, fallback = "Context pending"){
  const text = String(value || "").replace(/\s+/g, " ").trim()
  return text || fallback
}

function parseClock(value, fallback = 0){
  const parts = String(value || "").split(":").map(Number)
  if(parts.some((part) => !Number.isFinite(part))) return fallback
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || fallback
}

function compact(value, max = 72){
  const text = clean(value)
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function semanticFamily(value){
  const text = String(value || "").toLowerCase()
  if(/finance|market|stock|money|bank|trade|crypto/.test(text)) return "market"
  if(/nature|earth|climate|animal|plant|ocean|forest/.test(text)) return "nature"
  if(/robot|ai|model|data|software|code|technology|computer/.test(text)) return "technology"
  if(/music|podcast|audio|artist|film|video|creator/.test(text)) return "media"
  if(/science|research|space|health|medical|history/.test(text)) return "research"
  return "general"
}

function buildSegments({analysis, title, category, duration = 120}){
  const timeline = Array.isArray(analysis?.timeline) ? analysis.timeline : []
  const entities = Array.isArray(analysis?.entities) ? analysis.entities : []
  const fallbacks = [
    {at: "0:00", label: "Opening context", summary: title, entity: entities[0] || category},
    {at: "0:24", label: "Primary subject", summary: analysis?.currentRead || title, entity: entities[1] || analysis?.focus || category},
    {at: "0:48", label: "Evidence branch", summary: analysis?.researchUse || `Contextual analysis for ${title}`, entity: entities[2] || "Evidence"},
    {at: "1:12", label: "Visual synthesis", summary: analysis?.nextQuestion || `What should the next source confirm?`, entity: entities[3] || "Synthesis"},
  ]
  const base = timeline.length >= 4 ? timeline : [...timeline, ...fallbacks.slice(timeline.length)]
  return base.slice(0, 7).map((item, index) => {
    const start = Math.min(Math.max(0, parseClock(item.at, index * 24)), Math.max(1, duration - 1))
    const nextStart = index < base.length - 1 ? parseClock(base[index + 1]?.at, start + 24) : duration
    const end = Math.max(start + 1, Math.min(duration, nextStart))
    const topic = compact(item.entity || item.label || analysis?.focus || title, 46)
    return {
      id: item.id || `semantic-${index}`,
      start,
      end,
      topic,
      label: compact(item.label || `Topic ${index + 1}`, 34),
      summary: compact(item.summary || analysis?.currentRead || title, 116),
      family: semanticFamily(`${topic} ${item.summary || ""}`),
      color: palette[index % palette.length],
    }
  })
}

function formatTime(seconds){
  const safe = Math.max(0, Math.round(Number(seconds) || 0))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`
}

function playbackMessageData(value){
  if(value && typeof value === "object") return value
  if(typeof value !== "string") return null
  try { return JSON.parse(value) } catch { return null }
}

export default function SemanticAnalyticsPanel({
  video = {},
  analysis = null,
  analyzerMode = "metadata-only",
  analyzerStatus = "waiting",
  category = "General",
  seconds = 0,
  duration = 120,
  playing = false,
  onSeek,
  embedUrl = "",
  controls = {},
}){
  const [reproductionClock, setReproductionClock] = useState(0)
  const [videoFullscreen, setVideoFullscreen] = useState(false)
  const [playbackNotice, setPlaybackNotice] = useState("")
  const iframeRef = useRef(null)
  const segments = useMemo(() => buildSegments({
    analysis,
    title: clean(video.title, category),
    category,
    duration,
  }), [analysis, video.title, category, duration])
  const activeIndex = Math.max(0, segments.findIndex((segment) => seconds >= segment.start && seconds < segment.end))
  const active = segments[activeIndex] || segments[0]
  const lastTrackedRef = useRef("")
  const channelName = clean(video.channelTitle, "Channel not returned")
  const providerName = clean(video.provider, "YouTube")
  const seededFallback = /digitalhut seeded|prefilled youtube|seeded youtube/i.test(`${channelName} ${video.apiStatus || ""}`)
  const basis = analyzerMode === "google-speech"
    ? `${providerName} video + Google Speech transcript`
    : analyzerMode === "provided-text"
      ? `${providerName} video + supplied transcript`
      : seededFallback
        ? "Fallback seed metadata; live provider metadata not confirmed"
        : `${providerName} metadata for ${compact(video.title, 42)}`
  const truthfulStatus = seededFallback
    ? "Fallback seed active; provider result unavailable"
    : `${providerName}: ${compact(analyzerStatus, 38)}`
  const ga4Ready = typeof window !== "undefined" && typeof window.gtag === "function"
  const confidence = analyzerMode === "google-speech" ? 92 : analyzerMode === "provided-text" ? 84 : analysis ? 68 : 42

  useEffect(() => {
    const timer = window.setInterval(() => setReproductionClock((current) => (current + 1) % 100000), 2600)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const sync = () => setVideoFullscreen(document.fullscreenElement === iframeRef.current)
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  useEffect(() => {
    const listen = (event) => {
      let hostname = ""
      try { hostname = new URL(event.origin).hostname } catch { return }
      if(!/youtube(?:-nocookie)?\.com$/i.test(hostname)) return
      const payload = playbackMessageData(event.data)
      if(payload?.event !== "onStateChange") return
      if(Number(payload.info) === 1) setPlaybackNotice("Video is playing in the fullscreen player.")
      if(Number(payload.info) === 2) setPlaybackNotice("Video is paused. Use Play Video to continue.")
    }
    window.addEventListener("message", listen)
    return () => window.removeEventListener("message", listen)
  }, [])

  function requestYoutubePlayback(){
    const frame = iframeRef.current
    if(!frame?.contentWindow) return false
    let targetOrigin = "https://www.youtube.com"
    try { targetOrigin = new URL(embedUrl).origin } catch {}
    frame.contentWindow.postMessage(JSON.stringify({event:"command", func:"playVideo", args:[]}), targetOrigin)
    return true
  }

  async function toggleVideoFullscreen(){
    try {
      if(document.fullscreenElement){
        await document.exitFullscreen()
        setPlaybackNotice("")
        return
      }
      if(!iframeRef.current?.requestFullscreen) throw new Error("fullscreen-unavailable")
      setPlaybackNotice("Opening the video player and requesting playback...")
      if(!playing) controls.onEnsurePlaying?.()
      requestYoutubePlayback()
      await iframeRef.current.requestFullscreen()
      window.setTimeout(requestYoutubePlayback, 120)
      window.setTimeout(() => setPlaybackNotice((current) => current.includes("playing")
        ? current
        : "Fullscreen is open. If playback remains paused, use Play Video."), 1800)
    } catch {
      setPlaybackNotice("Video fullscreen could not open. Use the visible player controls and try again.")
    }
  }

  useEffect(() => {
    if(!active || !video.videoId) return
    const eventKey = `${video.videoId}:${active.id}`
    if(lastTrackedRef.current === eventKey) return
    lastTrackedRef.current = eventKey
    try {
      window.gtag?.("event", "video_topic_shift", {
        video_id: String(video.videoId).slice(0, 64),
        video_title: clean(video.title).slice(0, 100),
        current_topic: active.topic.slice(0, 100),
        topic_index: activeIndex + 1,
        topic_start_seconds: active.start,
        semantic_source: analyzerMode,
      })
      window.digitalhutPixel?.track?.("video_topic_shift", {
        category,
        keywordHint: active.topic,
        metadata: {
          videoId: video.videoId,
          topicIndex: activeIndex + 1,
          topicStartSeconds: active.start,
          semanticSource: analyzerMode,
        },
      })
    } catch {
      // Measurement must never interrupt playback.
    }
  }, [active?.id, active?.topic, active?.start, activeIndex, analyzerMode, category, video.videoId, video.title])

  const entities = (Array.isArray(analysis?.entities) ? analysis.entities : [])
    .slice(0, 6)
  const particleLabels = entities.length ? entities : segments.map((segment) => segment.topic).slice(0, 6)
  const affinityNodes = useMemo(() => {
    const supplied = Array.isArray(analysis?.bubbleMap) ? analysis.bubbleMap : []
    if(supplied.length) return supplied.slice(0, 7).map((node, index) => ({
      id:node.id || `affinity-${index}`,
      label:compact(node.label || node.value || segments[index % Math.max(1, segments.length)]?.topic, 24),
      detail:compact(node.value || "Metadata relationship", 78),
      kind:clean(node.kind, "context"),
      connectsTo:Array.isArray(node.connectsTo) ? node.connectsTo.slice(0, 4) : [],
      color:palette[index % palette.length]
    }))
    return segments.slice(0, 6).map((segment, index) => ({
      id:segment.id,
      label:segment.topic,
      detail:segment.summary,
      kind:"timeline",
      connectsTo:index < segments.length - 1 ? [segments[index + 1].id] : [],
      color:segment.color
    }))
  }, [analysis?.bubbleMap, segments])
  const evidenceLinks = (Array.isArray(analysis?.backlinks) ? analysis.backlinks : [])
    .filter((item) => /^https?:\/\//i.test(String(item?.url || "")))
    .slice(0, 2)
  const reproductionSignals = [active.topic, active.label, ...particleLabels].filter(Boolean)
  const reproductionSignal = reproductionSignals[reproductionClock % Math.max(1, reproductionSignals.length)] || active.topic
  const reproductionCycle = Math.floor(reproductionClock / 2)
  const currentProgress = Math.max(0, Math.min(100, ((seconds - active.start) / Math.max(1, active.end - active.start)) * 100))

  return <section className={`dh-semantic-suite family-${active.family} ${playing ? "is-playing" : "is-paused"}`} style={{"--semantic-color": active.color, "--reproduction-step": reproductionClock % 12}} aria-label="Content-aware video analytics">
    <header className="dh-semantic-head">
      <div>
        <span>Content-aware analytics</span>
        <h2>{active.topic}</h2>
        <p>{active.summary}</p>
      </div>
      <div className="dh-semantic-health" aria-label="Analytics connection status">
        <span><i className={ga4Ready ? "online" : "waiting"} /> GA4 {ga4Ready ? "collection ready" : "waiting"}</span>
        <span><i className="online live" /> Reproducing continuously</span>
        <span><i className={analysis ? "online" : "waiting"} /> Semantic {analysis ? "context ready" : "building"}</span>
        <strong>{confidence}% context confidence</strong>
      </div>
    </header>

    <div className="dh-semantic-grid">
      <article className="dh-semantic-field dh-semantic-video" aria-label={`${active.topic} video with semantic object field`}>
        <div className="dh-semantic-field-label"><span>Current YouTube source</span><b>{active.family}</b></div>
        <div className="dh-semantic-orbit" aria-hidden="true">
          <span className="core"><i /><b>{compact(active.topic, 18)}</b></span>
          {particleLabels.map((label, index) => <span key={`${label}-${index}`} className={`particle p-${index + 1}`} style={{"--particle-index": index}}><i />{compact(label, 16)}</span>)}
        </div>
        {embedUrl ? <iframe ref={iframeRef} title={`YouTube source: ${clean(video.title, active.topic)}`} src={embedUrl} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen /> : <div className="dh-semantic-video-waiting">Video source loading</div>}
        <small>Subtle objects follow the active subject—not audience behavior.</small>
      </article>

      <article className="dh-topic-readout">
        <div className="dh-topic-kicker" key={`kicker-${reproductionCycle}`}><span>Now analyzing</span><code>{formatTime(seconds)}</code></div>
        <h3 key={`title-${reproductionCycle}`}>{active.label}</h3>
        <p key={`summary-${reproductionCycle}`}>{active.summary}</p>
        <div className="dh-reproduction-read"><span>Reproduction frame</span><b key={`${reproductionSignal}-${reproductionClock}`}>{reproductionSignal}</b><code>LIVE {String(reproductionClock % 1000).padStart(3, "0")}</code></div>
        <div className="dh-topic-progress replaying" key={`progress-${reproductionCycle}`}><i style={{width: `${Math.max(8, currentProgress)}%`}} /></div>
        <dl key={`facts-${reproductionCycle}`}>
          <div style={{"--fact-index":0}}><dt>Source</dt><dd>{basis}</dd></div>
          <div style={{"--fact-index":1}}><dt>Channel</dt><dd>{seededFallback ? "Provider channel unavailable (fallback seed)" : clean(video.channelTitle || analysis?.channel, "Channel not returned")}</dd></div>
          <div style={{"--fact-index":2}}><dt>Event</dt><dd><code>{playing ? "active video playback -> topic shift" : "active video paused -> context held"}</code></dd></div>
          <div style={{"--fact-index":3}}><dt>Status</dt><dd>{truthfulStatus}</dd></div>
        </dl>
      </article>

      <article className="dh-topic-affinity" aria-label="Topic affinity visualization">
        <div className="dh-affinity-title"><span>Topic affinity</span><b>Context preview</b></div>
        <div className="dh-affinity-map">
          {affinityNodes.map((node, index) => <span key={node.id} className={index === activeIndex ? "active" : ""} style={{"--x": `${18 + ((index * 29) % 68)}%`, "--y": `${20 + ((index * 37) % 62)}%`, "--size": `${42 + (index % 3) * 12}px`, "--node-color": node.color, "--node-index":index}} title={`${node.kind}: ${node.detail}${node.connectsTo.length ? `; linked to ${node.connectsTo.join(", ")}` : ""}`}><i /><b>{compact(node.label, 18)}</b><em>{compact(node.kind, 10)}</em></span>)}
        </div>
        <div className="dh-affinity-evidence">{evidenceLinks.length ? evidenceLinks.map((item, index) => <a key={`${item.url}-${index}`} href={item.url} target="_blank" rel="noreferrer">{compact(item.label || `Evidence ${index + 1}`, 20)}</a>) : <span>Evidence links pending provider metadata</span>}</div>
        <small>Metadata/content relationships only - not audience or geographic conclusions.</small>
      </article>
      <aside className="dh-semantic-controls" aria-label="Video and analytics controls">
        <span>Side controls</span>
        <button type="button" className={playing ? "active" : ""} onClick={controls.onTogglePlay}>{playing ? "Pause Video" : "Play Video"}</button>
        <button type="button" onClick={controls.onPrevious}>Previous Video</button>
        <button type="button" onClick={controls.onNext}>Next Video</button>
        <button type="button" onClick={controls.onGlb}>3D / GLB Evidence</button>
        <button type="button" onClick={controls.onPodcast}>Podcast Evidence</button>
        <button type="button" className={videoFullscreen ? "active dh-video-fullscreen-control" : "dh-video-fullscreen-control"} onClick={toggleVideoFullscreen}>{videoFullscreen ? "Exit Video Full Screen" : "Video Full Screen"}</button>
        {playbackNotice && <p className="dh-video-playback-notice" role="status">{playbackNotice}</p>}
      </aside>
    </div>

    <nav className="dh-semantic-timeline" aria-label="Semantic video timeline">
      <div className="dh-timeline-track" aria-hidden="true"><i style={{width: `${Math.min(100, (seconds / Math.max(1, duration)) * 100)}%`}} /></div>
      {segments.map((segment, index) => <button key={segment.id} type="button" className={index === activeIndex ? "active" : ""} style={{"--segment-color": segment.color, flex: Math.max(1, segment.end - segment.start)}} onClick={() => onSeek?.(segment.start)} aria-label={`Seek to ${segment.label} at ${formatTime(segment.start)}`}>
        <code>{formatTime(segment.start)}</code>
        <b>{segment.topic}</b>
        <span>{segment.label}</span>
      </button>)}
    </nav>
    <div className="dh-timeline-flyway" aria-hidden="true">{particleLabels.concat(segments.map((segment) => segment.topic)).slice(0, 10).map((label, index) => <span key={`flyway-${label}-${index}`} style={{"--fly-index":index,"--fly-color":palette[index % palette.length]}}><i />{compact(label, 14)}</span>)}</div>

    <footer className="dh-semantic-foot">
      <span>GA4 event contract</span>
      <code>video_id · current_topic · topic_index · topic_start_seconds · semantic_source</code>
      <b>{analyzerMode === "metadata-only" ? "Metadata context—no transcript claim" : "Timestamped semantic context"}</b>
    </footer>
  </section>
}
