import React, {useEffect, useId, useMemo, useRef, useState} from "react"
import {
  buildObservatoryQuickFeedItems,
  normalizeQuickFeedGroupIndex,
  QUICK_FEED_GROUP_SIZE,
  quickFeedGroupAt,
  quickFeedGroupCount,
} from "./observatoryQuickFeedModel"
import "./ObservatoryQuickFeeds.css"

function compact(value, max = 68){
  const text = String(value || "").replace(/\s+/g, " ").trim()
  return text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text
}

export default function ObservatoryQuickFeeds({
  videos = [],
  activeVideoId = "",
  status = "waiting",
  provider = "",
  fetchedAt = "",
  query = "",
  error = "",
  onSelect,
  onImpression,
}){
  const titleId = useId()
  const [groupIndex, setGroupIndex] = useState(0)
  const [announcement, setAnnouncement] = useState("")
  const impressionHandlerRef = useRef(onImpression)
  const lastImpressionRef = useRef("")
  const items = useMemo(() => buildObservatoryQuickFeedItems({
    videos,
    status,
    provider,
    fetchedAt,
    queryUsed: query,
  }), [videos, status, provider, fetchedAt, query])
  const groupCount = quickFeedGroupCount(items)
  const visibleItems = quickFeedGroupAt(items, groupIndex)
  const itemSignature = items.map((item) => item.videoId).join("|")
  const visibleItemSignature = visibleItems.map((item) => item.videoId).join("|")
  const loading = String(status).includes("loading")
  const providerError = Boolean(error) || /unavailable|error|empty/.test(String(status))
  const hasLiveReceipt = visibleItems.some((item) => item.providerReceiptConfirmed)
  const hasCuratedItems = visibleItems.some((item) => item.truthLabel === "DigitalHut curated")

  useEffect(() => {
    impressionHandlerRef.current = onImpression
  }, [onImpression])

  useEffect(() => {
    setGroupIndex(0)
    setAnnouncement("")
    lastImpressionRef.current = ""
  }, [query, itemSignature])

  useEffect(() => {
    if(groupIndex >= groupCount) setGroupIndex(0)
  }, [groupCount, groupIndex])

  useEffect(() => {
    if(loading || visibleItems.length !== QUICK_FEED_GROUP_SIZE) return
    const impressionKey = `${query}:${groupIndex}:${visibleItems.map((item) => item.videoId).join(",")}`
    if(lastImpressionRef.current === impressionKey) return
    lastImpressionRef.current = impressionKey
    impressionHandlerRef.current?.({
      groupIndex,
      groupCount,
      items: visibleItems,
      query,
    })
  }, [groupCount, groupIndex, loading, query, visibleItemSignature])

  function moveGroup(direction){
    if(groupCount <= 1) return
    const nextIndex = normalizeQuickFeedGroupIndex(groupIndex + direction, groupCount)
    setGroupIndex(nextIndex)
    setAnnouncement(`Showing Quick Feeds ${nextIndex * QUICK_FEED_GROUP_SIZE + 1} through ${(nextIndex + 1) * QUICK_FEED_GROUP_SIZE}.`)
  }

  function selectItem(item, position){
    onSelect?.(item, {groupIndex, groupCount, position})
    setAnnouncement(`${item.title} selected. The main renderer and video analysis are synchronizing.`)
  }

  const sourceState = loading
    ? "Provider loading"
    : hasLiveReceipt
      ? "Live provider receipt"
      : hasCuratedItems
        ? "Curated fallback"
        : providerError
          ? "Provider unavailable"
          : "Related sources"
  const stateMessage = loading
    ? `Loading three related media choices for ${compact(query, 54) || "the selected category"}.`
    : providerError && visibleItems.length
      ? "Live provider results are unavailable. The visible choices are labeled with their fallback source."
      : providerError
        ? "Quick Feeds are unavailable. The active renderer remains unchanged."
        : visibleItems.length
          ? "Choosing a card changes the active source without changing the current play or pause state."
          : "No complete group of three playable videos is available. The active renderer remains unchanged."

  return <section className="dh-quick-feeds" aria-labelledby={titleId} aria-busy={loading}>
    <header className="dh-quick-feeds-head">
      <div>
        <span>Evidence selection</span>
        <h3 id={titleId}>3 Quick Feeds</h3>
      </div>
      <div className="dh-quick-feeds-source">
        <b>{sourceState}</b>
        <small title={query}>{compact(query, 54) || "Selected category"}</small>
      </div>
    </header>

    <div className="dh-quick-feeds-body">
      {loading
        ? <div className="dh-quick-feed-cards is-loading" aria-hidden="true">
          {Array.from({length: QUICK_FEED_GROUP_SIZE}, (_, index) => <div className="dh-quick-feed-skeleton" key={`quick-feed-loading-${index}`}><i /><span /><b /></div>)}
        </div>
        : visibleItems.length === QUICK_FEED_GROUP_SIZE
          ? <div className="dh-quick-feed-cards">
            {visibleItems.map((item, position) => {
              const active = item.videoId === activeVideoId
              return <button
                className={`dh-quick-feed-card ${active ? "active" : ""}`}
                type="button"
                key={item.videoId}
                aria-pressed={active}
                aria-label={`${item.title}. ${item.sourceBadge}. ${item.truthLabel}${item.popularityLabel ? `. ${item.popularityLabel}` : ""}${active ? ". Current video" : ". Select for the main renderer"}`}
                title={item.title}
                onClick={() => selectItem(item, position)}
              >
                <span className="dh-quick-feed-thumb">
                  {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" decoding="async" /> : <i aria-hidden="true">No preview</i>}
                  {active && <em>Active</em>}
                </span>
                <span className="dh-quick-feed-copy">
                  <b>{compact(item.title, 72)}</b>
                  <small>{compact(item.channelTitle, 34)}</small>
                  <span className="dh-quick-feed-badges">
                    <i>{item.sourceBadge}</i>
                    <em className={item.providerReceiptConfirmed ? "provider-confirmed" : ""}>{item.truthLabel}</em>
                  </span>
                  {item.popularityLabel && <small className="dh-quick-feed-popularity">{item.popularityLabel}</small>}
                </span>
              </button>
            })}
          </div>
          : <div className="dh-quick-feed-empty" role="status">
            <b>{providerError ? "Provider feed unavailable" : "Three playable choices required"}</b>
            <span>{stateMessage}</span>
          </div>}

      <nav className="dh-quick-feed-group-controls" aria-label="Quick Feed groups">
        <button type="button" onClick={() => moveGroup(1)} disabled={loading || groupCount <= 1} aria-label="Cycle to the next group of 3 Quick Feeds">
          <span aria-hidden="true">&gt;</span>
          <b>Next 3</b>
        </button>
        <output aria-live="polite" aria-label={`Quick Feed group ${groupCount ? groupIndex + 1 : 0} of ${groupCount}`}>{groupCount ? `${groupIndex + 1}/${groupCount}` : "0/0"}</output>
      </nav>
    </div>

    <p className="dh-quick-feeds-status" role="status">{announcement || stateMessage}</p>
  </section>
}
