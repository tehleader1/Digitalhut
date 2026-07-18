import assert from "node:assert/strict"
import {readFileSync} from "node:fs"

const component = readFileSync("src/components/SocialPressureDrawer.jsx", "utf8")
const css = readFileSync("src/components/SocialPressureDrawer.css", "utf8")
const observatory = readFileSync("src/components/FullscreenObservatoryV2.jsx", "utf8")

for(const contract of ["OPEN_THRESHOLD = .42", "DRAG_RESISTANCE = .78", "setPointerCapture", "ArrowLeft", "ArrowRight", "Escape", "aria-expanded", "Automatic publishing", "Bounded + active", "owner pause", "duplicate protection", "speed limits", "Mixpost server", "Open Social Observatory"]){
  const source = component
  assert.ok(source.includes(contract), `missing pressure-drawer contract: ${contract}`)
}
assert.match(component, /directionalDistance \* DRAG_RESISTANCE/)
assert.match(component, /Math\.max\(0, Math\.min\(1, next\)\)/)
assert.match(component, /navigator\.vibrate\?\.\(12\)/)
assert.match(css, /prefers-reduced-motion:reduce/)
assert.match(css, /touch-action:none/)
assert.match(css, /pointer-events:none/)
assert.match(css, /\.dh-social-pressure-handle[\s\S]*pointer-events:auto/)
assert.match(observatory, /import SocialPressureDrawer from "\.\/SocialPressureDrawer"/)
assert.match(observatory, /<SocialPressureDrawer \/>/)
for(const forbidden of ["setInterval(", "location.reload", "autoPost", "publishToSocial"]){
  assert.ok(!component.includes(forbidden), `forbidden pressure-drawer behavior: ${forbidden}`)
}

console.log(JSON.stringify({ok:true,checks:27,openThreshold:.42,dragResistance:.78,automaticPublishing:true,visitorControl:false}, null, 2))
