function clean(value, max = 500){
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function safeNumber(value, fallback = 0){
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function googleApiKey(){
  return clean(process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY || process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_API_KEY || process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || '', 260)
}

export function googleTextToSpeechConfigured(){
  return Boolean(googleApiKey() || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'})
  const key = googleApiKey()
  const text = clean(req.body?.text || req.body?.script || req.body?.spokenMoment || '', 4500)
  if(!text) return res.status(400).json({ok:false, configured:googleTextToSpeechConfigured(), provider:'Google Text-to-Speech', error:'Text-to-Speech needs text to synthesize.'})
  if(!key) return res.status(200).json({ok:false, configured:false, provider:'Google Text-to-Speech', error:'Google Text-to-Speech key is not configured.'})
  try{
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({input:{text}, voice:{languageCode:clean(req.body?.languageCode || process.env.GOOGLE_TTS_LANGUAGE || 'en-US', 24), name:clean(req.body?.voiceName || process.env.GOOGLE_TTS_VOICE || 'en-US-Neural2-J', 80)}, audioConfig:{audioEncoding:'MP3', speakingRate:Math.min(1.35, Math.max(.75, safeNumber(req.body?.speakingRate, 1))), pitch:Math.min(8, Math.max(-8, safeNumber(req.body?.pitch, 0)))}})
    })
    const payload = await response.json().catch(() => ({}))
    if(!response.ok) throw new Error(payload?.error?.message || `Google Text-to-Speech returned ${response.status}`)
    return res.status(200).json({ok:true, configured:true, provider:'Google Text-to-Speech', audioEncoding:'MP3', audioContent:payload.audioContent || ''})
  } catch(error){
    return res.status(502).json({ok:false, configured:true, provider:'Google Text-to-Speech', error:error?.message || 'Google Text-to-Speech unavailable'})
  }
}
