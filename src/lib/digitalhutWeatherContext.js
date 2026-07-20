const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const STORM_CODES = new Set([95, 96, 99])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const FOG_CODES = new Set([45, 48])

export function weatherConditionFor({weatherCode = 0, precipitationInches = 0, temperatureFahrenheit = 0} = {}){
  if(STORM_CODES.has(weatherCode)) return {label:"Thunderstorm", tone:"storm", message:"Stormy outside? Step into the observatory while you monitor official local alerts."}
  if(precipitationInches >= .4) return {label:"Intense rain", tone:"rain", message:"Heavy rain nearby. Take a cool-down break here and check official local flash-flood alerts before traveling."}
  if(RAIN_CODES.has(weatherCode)) return {label:"Rain", tone:"rain", message:"Rainy-day entertainment is ready inside the DigitalHut observatory."}
  if(temperatureFahrenheit >= 95) return {label:"Extreme heat", tone:"heat", message:"Deep-summer heat: check out the latest entertainment for some cool-down time."}
  if(temperatureFahrenheit >= 86) return {label:"Hot", tone:"heat", message:"Hot outside? Cool down with a fresh DigitalHut entertainment session."}
  if(SNOW_CODES.has(weatherCode)) return {label:"Snow", tone:"cold", message:"Stay weather-aware and explore the observatory from somewhere safe and warm."}
  if(FOG_CODES.has(weatherCode)) return {label:"Fog", tone:"fog", message:"Low visibility outside; explore a clear multimedia route inside DigitalHut."}
  return {label:"Current conditions", tone:"clear", message:"Live local context is ready alongside today’s DigitalHut entertainment."}
}
