function clean(value, max = 500){
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function tokens(value){
  return clean(value, 5000).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((token) => token.length > 2 && !['the','and','for','with','digitalhut','video','visual','system'].includes(token))
}

function titleCase(value){
  return clean(value, 80).split(/\s+/).map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : '').join(' ')
}

export function googleSpeechConfigured(){
  return Boolean(process.env.GOOGLE_SPEECH_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.YOUTUBE_API_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
}

function buildAnalysis({text, metadata = {}, seconds = 0, mode = 'metadata-only'}){
  const basis = clean([metadata.title, metadata.channel || metadata.channelTitle, metadata.description, metadata.category, text].filter(Boolean).join('. '), 9000)
  const counts = new Map()
  for(const token of tokens(basis)) counts.set(token, (counts.get(token) || 0) + 1)
  const entities = [...counts.entries()].sort((a,b) => b[1] - a[1]).map(([token]) => titleCase(token)).slice(0, 10)
  const focus = clean(metadata.title || entities.slice(0, 4).join(' / ') || metadata.category || 'DigitalHut Observatory', 180)
  const category = clean(metadata.category || 'DigitalHut Observatory', 100)
  const channel = clean(metadata.channel || metadata.channelTitle || 'source channel', 100)
  const primary = entities[0] || titleCase(category)
  const sourceUrl = clean(metadata.sourceUrl || metadata.url || metadata.videoUrl || '', 500) || `https://www.google.com/search?q=${encodeURIComponent(`${focus} research source`)}`
  const summaries = clean(text || metadata.description || focus, 1000).split(/(?<=[.!?])\s+/).filter(Boolean)
  const currentRead = clean(summaries[0] || `${focus} is the active observatory subject.`, 180)
  return {
    focus, category, channel, entities,
    sourceBasis: mode === 'provided-text' ? 'provided spoken-source text' : 'video metadata and source context',
    confidenceLabel: mode,
    currentRead,
    researchUse: `This read feeds the bubble map, timeline, 3D renderer, and backlink stack for ${clean(focus, 90)}.`,
    developerView: `DigitalHut analyzer mode: ${mode}; entities: ${entities.slice(0, 5).join(', ') || 'pending'}.`,
    nextQuestion: `What should the next source confirm about ${primary}?`,
    backlinks: [{label:'Primary source', url:sourceUrl}, {label:`${primary} research`, url:`https://www.google.com/search?q=${encodeURIComponent(`${primary} research 2026`)}`}],
    bubbleMap: [
      {id:'episode', kind:'episode', label:focus, value:'Episode subject', weight:1, connectsTo:['source','claim','model']},
      {id:'source', kind:'source', label:channel, value:'source context analyzed', weight:.88, connectsTo:['claim','backlink']},
      {id:'claim', kind:'claim', label:primary, value:currentRead, weight:.82, connectsTo:['timeline','proof']},
      {id:'model', kind:'3d', label:`${primary} 3D layer`, value:`Generate a rendered research model for ${primary}.`, weight:.8, connectsTo:['episode','backlink']},
      {id:'backlink', kind:'backlink', label:'source preview', value:sourceUrl, weight:.72, connectsTo:['source','model']}
    ],
    timeline: [0,1,2,3,4].map((index) => ({id:`moment-${index+1}`, at:`${Math.floor((Number(seconds)||0)/60)}:${String(((Number(seconds)||0)+(index*18))%60).padStart(2,'0')}`, label:index ? `Signal ${index+1}` : 'Opening read', summary:clean(summaries[index] || currentRead, 160), entity:entities[index] || primary, backlink:sourceUrl})),
    threeDObjects: entities.slice(0, 5).map((entity, index) => ({id:`object-${index+1}`, label:`${entity} research object`, status:index ? 'supporting rendered layer' : 'primary rendered preview', modelQuery:`${entity} 3d model ${category}`, prompt:`Build a clean 3D observatory layer for ${entity}.`, backlink:`https://www.google.com/search?q=${encodeURIComponent(`${entity} 3d research model`)}`})),
    multiDisplayFeed: [{display:'Video', signal:focus, status:'subject lock'}, {display:'Bubble Map', signal:'linked nodes', status:'constructing branches'}, {display:'Timeline', signal:'moment sync', status:'syncing to playback'}, {display:'3D', signal:primary, status:'render prompt ready'}]
  }
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'})
  const metadata = req.body?.metadata || {}
  const transcript = clean(req.body?.transcript || req.body?.spokenText || '', 9000)
  const mode = transcript ? 'provided-text' : 'metadata-only'
  const analysis = buildAnalysis({text:transcript, metadata, seconds:req.body?.seconds || req.body?.currentTime, mode})
  return res.status(200).json({ok:true, configured:googleSpeechConfigured(), provider:'Google Speech Analyzer', mode, status:transcript ? 'provided-text-analyzed' : 'metadata-context-analyzed', fetchedAt:new Date().toISOString(), transcriptPreview:clean(transcript, 600), analysis, contract:{bubbleMap:'analysis.bubbleMap', timeline:'analysis.timeline', threeDObjects:'analysis.threeDObjects', multiDisplayFeed:'analysis.multiDisplayFeed'}})
}
