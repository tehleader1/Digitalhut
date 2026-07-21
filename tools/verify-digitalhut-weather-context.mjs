import assert from "node:assert/strict"
import {weatherConditionFor} from "../src/lib/digitalhutWeatherContext.js"
import {applySocialPressureClick, settleSocialPressureGesture} from "../src/lib/socialPressureGesture.js"
import {readFileSync} from "node:fs"

const fixtures = [
  [{temperatureFahrenheit:63, weatherCode:0}, "Current conditions"],
  [{temperatureFahrenheit:86, weatherCode:0}, "Hot"],
  [{temperatureFahrenheit:95, weatherCode:0}, "Extreme heat"],
  [{temperatureFahrenheit:70, weatherCode:63}, "Rain"],
  [{temperatureFahrenheit:70, weatherCode:95}, "Thunderstorm"],
  [{temperatureFahrenheit:70, weatherCode:0, precipitationInches:.4}, "Intense rain"],
  [{temperatureFahrenheit:28, weatherCode:75}, "Snow"],
  [{temperatureFahrenheit:50, weatherCode:45}, "Fog"]
]

for(const [input, expected] of fixtures) assert.equal(weatherConditionFor(input).label, expected)
assert.match(weatherConditionFor({weatherCode:95}).message, /official local alerts/i)
assert.match(weatherConditionFor({precipitationInches:.5}).message, /check official local flash-flood alerts/i)
assert.doesNotMatch(weatherConditionFor({temperatureFahrenheit:63}).label, /heat/i)
const componentSource = readFileSync(new URL("../src/components/WeatherTimeGauge.jsx", import.meta.url), "utf8")
assert.match(componentSource, /latitude\.toFixed\(2\)/)
assert.match(componentSource, /longitude\.toFixed\(2\)/)
assert.match(componentSource, /sent to Open-Meteo.*not stored by DigitalHut/)
assert.match(componentSource, /role="status" aria-live="polite"/)
assert.match(componentSource, /Location permission was declined/)
assert.match(componentSource, /Current conditions via Open-Meteo/)
assert.match(componentSource, /dh-weather-location-status" role="status" aria-live="polite" aria-atomic="true"/)
const drawerSource = readFileSync(new URL("../src/components/SocialPressureDrawer.jsx", import.meta.url), "utf8")
assert.match(drawerSource, /requestAnimationFrame\(\(\) => handleRef\.current\?\.focus\(\)\)/)
assert.match(drawerSource, /function cancel\(event\)/)
assert.match(drawerSource, /onPointerCancel=\{cancel\}/)
const cancelledDrag = settleSocialPressureGesture({cancelled:true, moved:true, startProgress:0, progress:.8})
assert.deepEqual(cancelledDrag, {open:false, suppressNextClick:false})
assert.deepEqual(applySocialPressureClick(cancelledDrag), {open:true, suppressNextClick:false})
const committedDrag = settleSocialPressureGesture({moved:true, startProgress:0, progress:.8})
assert.deepEqual(committedDrag, {open:true, suppressNextClick:true})
assert.deepEqual(applySocialPressureClick(committedDrag), {open:true, suppressNextClick:false})
assert.deepEqual(applySocialPressureClick({open:true, suppressNextClick:false}), {open:false, suppressNextClick:false})
const observatorySource = readFileSync(new URL("../src/components/FullscreenObservatoryV2.jsx", import.meta.url), "utf8")
assert.match(observatorySource, /dh-media dh-movie-controls[^>]*>\s*<WeatherTimeGauge/)
const weatherCss = readFileSync(new URL("../src/components/WeatherTimeGauge.css", import.meta.url), "utf8")
assert.match(weatherCss, /\.dh-weather-gauge\{position:relative/)
assert.doesNotMatch(weatherCss, /\.dh-weather-gauge\{position:fixed/)
const observatoryCss = readFileSync(new URL("../src/components/FullscreenObservatory.css", import.meta.url), "utf8")
assert.match(observatoryCss.slice(-500), /max-width: 760px[\s\S]*top: 128px/)

console.log(JSON.stringify({ok:true, checks:30, units:{temperature:"fahrenheit", precipitation:"inch"}, approximateLocationOnly:true, nonOverlayPlacement:true, cancelledDragPreservesNextClick:true, flashFloodClaimed:false}, null, 2))
