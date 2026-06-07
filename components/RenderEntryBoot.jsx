'use client'

import {useEffect, useMemo, useState} from 'react'
import RenderEntryGate from './RenderEntryGate'
import library from '../data/platform-libraries.json'

function cleanQuery(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function feedFromChoice(choice, index) {
  const query = cleanQuery(choice.query || choice.title || 'wall street new york financial district')
  return {
    id: `entry-feed:${index}:${query}`,
    title: choice.title || query,
    query,
    category: choice.mood || 'observatory',
    intent: choice.intent || 'observatory-guest',
    previewImage: choice.previewImage || '',
    terrainUrl: query,
    source: 'entry-boot',
    agentNarration: `${choice.title || query}. ${choice.mood || 'DigitalHut public observatory feed'}`
  }
}

export default function RenderEntryBoot() {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('Guided Tour')
  const [username, setUsername] = useState('')
  const [activeFeed, setActiveFeed] = useState(null)
  const [loading, setLoading] = useState(false)
  const feeds = useMemo(() => {
    const choices = Array.isArray(library.modelChoices) ? library.modelChoices : []
    return choices.map(feedFromChoice)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.pathname === '/') setVisible(true)
  }, [])

  useEffect(() => {
    if (!activeFeed && feeds[0]) setActiveFeed(feeds[0])
  }, [activeFeed, feeds])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!visible) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [visible])

  function selectFeed(feed) {
    setActiveFeed(feed)
  }

  function loadRender() {
    setLoading(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('digitalhut:entryMode', mode)
      window.localStorage.setItem('digitalhut:entryName', username || 'Guest')
      window.localStorage.setItem('digitalhut:lastObservatoryQuery', activeFeed?.query || '')
    }
    window.setTimeout(() => {
      setLoading(false)
      setVisible(false)
    }, 950)
  }

  if (!visible) return null

  return <div style={styles.overlay} aria-label='DigitalHut render entry'>
    <RenderEntryGate
      feeds={feeds}
      activeFeed={activeFeed || feeds[0]}
      mode={mode}
      username={username}
      loading={loading}
      onMode={setMode}
      onUsername={setUsername}
      onSelectFeed={selectFeed}
      onLoad={loadRender}
    />
  </div>
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9990,
    background: '#020617'
  }
}
