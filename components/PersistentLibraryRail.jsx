"use client"

const fallbackFeeds = [
  { title: "Active discovery", query: "digitalhut observatory", category: "current" },
  { title: "Related model", query: "downloadable glb city model", category: "glb" },
  { title: "Research path", query: "historical site 3d research", category: "research" }
]

export default function PersistentLibraryRail({ activeFeed, feeds = [], onSelect }) {
  const list = feeds.length ? feeds : [activeFeed, ...fallbackFeeds].filter(Boolean)

  return (
    <aside style={styles.wrap} aria-label="Persistent DigitalHut library">
      <div style={styles.header}>
        <span style={styles.eyebrow}>Library</span>
        <span style={styles.count}>{list.length}</span>
      </div>
      <div style={styles.list}>
        {list.slice(0, 8).map((feed, index) => (
          <button
            key={`${feed?.id || feed?.query || feed?.title}-${index}`}
            style={feed?.id && feed.id === activeFeed?.id ? styles.active : styles.item}
            onPointerEnter={() => feed && onSelect?.(feed, { speak: false, scan: false })}
            onFocus={() => feed && onSelect?.(feed, { speak: false, scan: false })}
            onClick={() => feed && onSelect?.(feed, { speak: true, scan: true })}
          >
            <span style={styles.itemTitle}>{feed?.title || "Untitled feed"}</span>
            <small style={styles.itemMeta}>{feed?.category || feed?.query || "observatory"}</small>
          </button>
        ))}
      </div>
    </aside>
  )
}

const itemBase = { width: "100%", textAlign: "left", borderRadius: 8, padding: 10, cursor: "pointer", color: "white", display: "grid", gap: 4 }
const styles = {
  wrap: { borderRadius: 8, border: "1px solid rgba(148,163,184,.25)", background: "rgba(2,6,23,.65)", padding: 12, minWidth: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  eyebrow: { color: "#67e8f9", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 0 },
  count: { color: "#cbd5e1", fontSize: 12 },
  list: { display: "grid", gap: 8 },
  item: { ...itemBase, border: "1px solid rgba(148,163,184,.2)", background: "rgba(15,23,42,.7)" },
  active: { ...itemBase, border: "1px solid rgba(45,212,191,.65)", background: "rgba(20,184,166,.18)" },
  itemTitle: { fontWeight: 900, overflowWrap: "anywhere" },
  itemMeta: { color: "#cbd5e1", overflowWrap: "anywhere" }
}
