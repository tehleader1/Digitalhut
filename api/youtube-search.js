const cache = new Map()
const cacheTtlMs = 6 * 60 * 1000

function clean(value, max = 180){
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function videoUrl(id){
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
}

function embedUrl(id){
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`
}

function categoryPhrase(category){
  const map = {
    Gamer: 'gaming build gameplay graphics analysis',
    'Real Estate': 'real estate property tour housing market',
    Researcher: 'research study data documentary',
    Programmer: 'developer coding backend API analysis',
    Businesses: 'business market company analysis',
    'Mainstream Streaming': 'viral social media reel story',
    Planetary: 'space planetary environment documentary',
    Mobility: 'transportation travel traffic infrastructure analysis',
    Workforce: 'construction workforce training analysis'
  }
  return map[category] || 'documentary explainer visual analysis'
}

async function youtubeJson(url){
  const response = await fetch(url, {headers: {'User-Agent': 'DigitalHut/1.0'}})
  const text = await response.text()
  if(!response.ok) throw new Error(`YouTube returned ${response.status}: ${text.slice(0, 160)}`)
  return text ? JSON.parse(text) : {}
}

export default async function handler(req, res){
  if(req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'})
  const key = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || ''
  const term = clean(req.query?.query || req.query?.q || 'DigitalHut observatory visual experience')
  const category = clean(req.query?.category || 'Mainstream Streaming', 80)
  const limit = Math.max(1, Math.min(8, Number(req.query?.limit || 5) || 5))
  const cacheKey = `${term}:${category}:${limit}`.toLowerCase()
  const saved = cache.get(cacheKey)
  if(saved && Date.now() - saved.createdAt < cacheTtlMs){
    res.setHeader('Cache-Control', 'private, max-age=120')
    return res.status(200).json(saved.payload)
  }
  if(!key){
    return res.status(200).json({ok:false, configured:false, provider:'YouTube Data API v3', query:term, category, fetchedAt:new Date().toISOString(), videos:[], status:'missing-youtube-api-key'})
  }
  try{
    const q = `${term} ${categoryPhrase(category)}`
    const searchParams = new URLSearchParams({part:'snippet', q, type:'video', maxResults:String(limit), safeSearch:'moderate', videoEmbeddable:'true', videoDuration:'medium', relevanceLanguage:'en', key})
    const search = await youtubeJson(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
    const ids = (search.items || []).map((item) => item?.id?.videoId).filter(Boolean)
    let details = new Map()
    if(ids.length){
      const detailParams = new URLSearchParams({part:'snippet,contentDetails,statistics,status', id:ids.join(','), key})
      const payload = await youtubeJson(`https://www.googleapis.com/youtube/v3/videos?${detailParams}`)
      details = new Map((payload.items || []).map((item) => [item.id, item]))
    }
    const videos = ids.map((id, index) => {
      const fallback = (search.items || []).find((item) => item?.id?.videoId === id) || {}
      const detail = details.get(id) || {}
      const snippet = detail.snippet || fallback.snippet || {}
      return {
        id,
        title: clean(snippet.title || 'YouTube video', 220),
        description: clean(snippet.description || '', 520),
        channelTitle: clean(snippet.channelTitle || '', 120),
        publishedAt: snippet.publishedAt || '',
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        url: videoUrl(id),
        embedUrl: embedUrl(id),
        viewCount: Number(detail.statistics?.viewCount || 0),
        likeCount: Number(detail.statistics?.likeCount || 0),
        commentCount: Number(detail.statistics?.commentCount || 0),
        embeddable: detail.status?.embeddable !== false,
        source: 'YouTube Data API v3',
        storySignals: [index === 0 ? 'primary story source' : 'supporting clip lane', snippet.channelTitle ? `channel: ${snippet.channelTitle}` : 'channel scan pending', 'observatory-ready segment']
      }
    }).filter((video) => video.embeddable)
    const payload = {ok:true, configured:true, provider:'YouTube Data API v3', query:term, queryUsed:q, category, fetchedAt:new Date().toISOString(), videos, status:videos.length ? 'youtube-api-live' : 'youtube-api-empty', analytics:{resultsReturned:videos.length, primaryVideoId:videos[0]?.id || '', storyMode:'video-search-to-observatory'}}
    cache.set(cacheKey, {createdAt:Date.now(), payload})
    res.setHeader('Cache-Control', 'private, max-age=120')
    return res.status(200).json(payload)
  } catch(error){
    return res.status(200).json({ok:false, configured:true, provider:'YouTube Data API v3', query:term, category, fetchedAt:new Date().toISOString(), videos:[], status:'youtube-search-unavailable', error:error?.message || 'YouTube search unavailable'})
  }
}
