import {providerHealth} from "./_observatory-providers.js"

export default async function handler(req, res){
  const providers = providerHealth()
  res.status(200).json({
    ok: true,
    runtime: "digitalhut-api",
    providers,
    detected: providers,
    renderer: {
      mode: "fullscreen-api",
      loadGate: "fps-calibrated",
      idleFadeSeconds: 18
    }
  })
}
