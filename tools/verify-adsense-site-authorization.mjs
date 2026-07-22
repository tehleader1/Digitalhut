import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedPublisher = 'pub-5543431802438722'
const expectedClient = `ca-${expectedPublisher}`
const expectedScript = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${expectedClient}`
const expectedSeller = `google.com, ${expectedPublisher}, DIRECT, f08c47fec0942fa0`
const expectedMeasurementId = 'G-L6XLB5NYJ0'
const forbiddenOAuthClient = '648891242266-5cqqu1tum3u4lltge2vhci68b5q6tkhk.apps.googleusercontent.com'

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const adsTxt = fs.readFileSync(new URL('../public/ads.txt', import.meta.url), 'utf8').trim()
const sourceFiles = [
  new URL('../index.html', import.meta.url),
  new URL('../src', import.meta.url),
  new URL('../api', import.meta.url),
]

function readTree(fileUrl) {
  const filePath = fileURLToPath(fileUrl)
  const stat = fs.statSync(filePath)
  if (stat.isFile()) return fs.readFileSync(filePath, 'utf8')
  return fs.readdirSync(filePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || /\.(?:js|jsx|mjs|html)$/.test(entry.name))
    .map((entry) => readTree(new URL(`file:///${path.join(filePath, entry.name).replaceAll('\\', '/')}${entry.isDirectory() ? '/' : ''}`)))
    .join('\n')
}

let checks = 0
const check = (condition, message) => {
  checks += 1
  assert.ok(condition, message)
}

const head = index.match(/<head>[\s\S]*?<\/head>/i)?.[0] ?? ''
const scriptOccurrences = index.split(expectedScript).length - 1
const publisherOccurrences = index.split(expectedClient).length - 1
const measurementOccurrences = index.split(expectedMeasurementId).length - 1
const loadedSources = sourceFiles.map(readTree).join('\n')

check(head.includes(expectedScript), 'exact AdSense authorization loader must be in the shared document head')
check(scriptOccurrences === 1, 'exact AdSense loader must appear once')
check(publisherOccurrences === 1, 'publisher client ID must appear exactly once in page source')
check(measurementOccurrences === 1, 'GA4 measurement ID must appear exactly once in page source')
check(head.includes('googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}'), 'GA4 loader must appear exactly once through the shared loader')
check((head.match(/window\.gtag\("config", GA4_MEASUREMENT_ID/g) || []).length === 1, 'GA4 config must execute from exactly one guarded call site')
check(head.includes('new Set(["digitalhut.app", "www.digitalhut.app"])'), 'Google loaders must be restricted to canonical production hosts')
check(head.includes('if(!isProductionHost) return'), 'preview and local hosts must fail closed before Google loading')
check(head.includes('digitalhut:google-consent'), 'Google loading must require an explicit consent event')
check(head.includes('analytics_storage: "denied"') && head.includes('ad_storage: "denied"'), 'Google consent defaults must be denied')
check(head.includes('if(document.getElementById(id)) return'), 'shared loader must reject duplicate script insertion')
check(/<script\s+[\s\S]*?\basync\b[\s\S]*?src=["'][^"']*pagead2\.googlesyndication\.com[^"']*["'][\s\S]*?crossorigin=["']anonymous["'][\s\S]*?><\/script>/i.test(head), 'AdSense loader must be asynchronous and anonymous-crossorigin')
check(adsTxt === expectedSeller, 'ads.txt must authorize only the exact Google publisher account')
check(!loadedSources.includes(forbiddenOAuthClient), 'Google OAuth client ID must never be embedded in this publisher release')
check(!loadedSources.includes('telemetry_to_ad_path'), 'DigitalHut must not steer or profile a telemetry-to-ad click path')
check(!/adsbygoogle[\s\S]{0,300}(mouseover|mouseenter|pointermove|mousemove)/i.test(loadedSources), 'AdSense must not be coupled to cursor or hover tracking')
check(!/<ins[^>]+class=["'][^"']*adsbygoogle/i.test(index), 'manual ad units require a separately reviewed Google slot ID')
check(!/click (?:this|the|our) ad|support us by clicking|help us by clicking/i.test(loadedSources), 'publisher content must not encourage ad clicks')
check(!/(adsbygoogle|digitalhut-adsense)[\s\S]{0,500}addEventListener\(["']click/i.test(loadedSources), 'custom AdSense click tracking is prohibited')

console.log(`DigitalHut Google authorization release: ${checks} checks PASS; AdSense manual units absent; GA4 consent-gated.`)
