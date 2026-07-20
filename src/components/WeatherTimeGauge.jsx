import {useCallback, useEffect, useMemo, useState} from "react"
import {weatherConditionFor} from "../lib/digitalhutWeatherContext"
import "./WeatherTimeGauge.css"

const HQ_LOCATION = {latitude: 40.7128, longitude: -74.006, label: "DigitalHut HQ · New York", source: "DigitalHut default"}
const REFRESH_MS = 15 * 60 * 1000

function weatherUrl(location){
  const params = new URLSearchParams({
    latitude:String(location.latitude), longitude:String(location.longitude),
    current:"temperature_2m,apparent_temperature,precipitation,rain,showers,weather_code,wind_speed_10m",
    temperature_unit:"fahrenheit", wind_speed_unit:"mph", precipitation_unit:"inch", timezone:"auto"
  })
  return `https://api.open-meteo.com/v1/forecast?${params}`
}

export default function WeatherTimeGauge(){
  const browserTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time", [])
  const [clock, setClock] = useState(() => new Date())
  const [location, setLocation] = useState(HQ_LOCATION)
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState("loading")
  const [online, setOnline] = useState(() => navigator.onLine)
  const [locationNotice, setLocationNotice] = useState("Showing DigitalHut HQ weather. Local weather is optional.")

  const loadWeather = useCallback(async (target, signal) => {
    setStatus("loading")
    try{
      const response = await fetch(weatherUrl(target), {signal, cache:"no-store"})
      if(!response.ok) throw new Error(`weather-${response.status}`)
      const payload = await response.json()
      if(!Number.isFinite(payload?.current?.temperature_2m)) throw new Error("weather-missing-temperature")
      setWeather({...payload.current, timezone:payload.timezone || browserTimeZone, timezoneAbbreviation:payload.timezone_abbreviation || ""})
      setStatus("ready")
    }catch(error){
      if(error?.name !== "AbortError") setStatus("unavailable")
    }
  }, [browserTimeZone])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const syncConnection = () => setOnline(navigator.onLine)
    window.addEventListener("online", syncConnection)
    window.addEventListener("offline", syncConnection)
    return () => {window.removeEventListener("online", syncConnection); window.removeEventListener("offline", syncConnection)}
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadWeather(location, controller.signal)
    const timer = window.setInterval(() => loadWeather(location, controller.signal), REFRESH_MS)
    return () => {controller.abort(); window.clearInterval(timer)}
  }, [loadWeather, location])

  function useLocalWeather(){
    if(!navigator.geolocation){setLocationNotice("Local weather is unavailable in this browser. DigitalHut HQ conditions remain visible."); return}
    setLocationNotice("Waiting for browser location permission…")
    navigator.geolocation.getCurrentPosition(
      ({coords}) => {
        setLocation({latitude:Number(coords.latitude.toFixed(2)), longitude:Number(coords.longitude.toFixed(2)), label:"Your approximate local area", source:"Approximate location sent to Open-Meteo for this reading · not stored by DigitalHut"})
        setLocationNotice("Approximate local weather activated.")
      },
      () => setLocationNotice("Location permission was declined. DigitalHut HQ conditions remain visible."),
      {enableHighAccuracy:false, timeout:8000, maximumAge:15 * 60 * 1000}
    )
  }

  const condition = weatherConditionFor({weatherCode:weather?.weather_code, precipitationInches:Number(weather?.precipitation || 0), temperatureFahrenheit:Number(weather?.temperature_2m || 0)})
  const displayTimeZone = weather?.timezone || browserTimeZone
  const timeLabel = new Intl.DateTimeFormat(undefined, {hour:"numeric", minute:"2-digit", second:"2-digit", timeZone:displayTimeZone, timeZoneName:"short"}).format(clock)

  return <aside className={`dh-weather-gauge tone-${condition.tone}`} aria-label="Live weather and local time">
    <div className="dh-weather-reading" role="status" aria-live="polite" aria-atomic="true">
      <span>{status === "ready" ? condition.label : "Weather context"}</span>
      <strong>{status === "ready" ? `${Math.round(weather.temperature_2m)}°F` : "—°"}</strong>
      <small>{!online ? "Connection lost · cached page remains usable" : status === "ready" ? `Feels ${Math.round(weather.apparent_temperature)}° · Wind ${Math.round(weather.wind_speed_10m)} mph` : status === "unavailable" ? "Live weather temporarily unavailable" : "Reading live conditions…"}</small>
    </div>
    <div className="dh-weather-clock"><b>{timeLabel}</b><small>{location.label}</small></div>
    <p>{status === "ready" ? condition.message : "DigitalHut remains available while weather data reconnects."}</p>
    <div className="dh-weather-actions">
      <a href="#digitalhut-entertainment">Open entertainment</a>
      <button type="button" onClick={useLocalWeather}>Use local weather</button>
    </div>
    <small className="dh-weather-location-status" role="status" aria-live="polite" aria-atomic="true">{locationNotice}</small>
    <small className="dh-weather-source">{location.source} · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Current conditions via Open-Meteo</a> · refreshed every 15 min. Connection loss is not proof of a power outage; severe-weather decisions require official local alerts.</small>
  </aside>
}
