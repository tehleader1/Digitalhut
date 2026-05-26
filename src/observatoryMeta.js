export const observatoryMeta = [

  {
    title:"Australia Terrain",
    model:"/glbs/split_point_victoria_australia.glb",
    tags:[
      "australia",
      "coast",
      "terrain",
      "ocean"
    ],
    lighting:"southern ocean daylight",
    camera:"cinematic coastline orbit",
    retention:7420,
    interestDropMs:5120,
    density:"medium",
    mood:"expedition",
    motion:"terrain sweep",
    hallucinationRisk:"low",
    description:
      "Coastal observatory terrain with elevated ocean cliffs and environmental scan depth."
  },

  {
    title:"Vancouver Canada",
    model:"/glbs/dtes_vancouver_canada.glb",
    tags:[
      "canada",
      "city",
      "urban",
      "airport"
    ],
    lighting:"cold urban sunrise",
    camera:"drone skyline orbit",
    retention:6911,
    interestDropMs:4820,
    density:"high",
    mood:"modern",
    motion:"slow orbit",
    hallucinationRisk:"low",
    description:
      "Dense Canadian urban observatory skyline with waterfront environmental geometry."
  },

  {
    title:"Florida Beachfront",
    model:"/glbs/surfside_florida_usa_beachfront_properties.glb",
    tags:[
      "florida",
      "beach",
      "ocean",
      "tourism"
    ],
    lighting:"golden sunset",
    camera:"shoreline glide",
    retention:8110,
    interestDropMs:6200,
    density:"medium",
    mood:"luxury",
    motion:"cinematic coastline orbit",
    hallucinationRisk:"low",
    description:
      "High-retention beachfront observatory structures with oceanic environmental reflections."
  },

  {
    title:"European Terrain",
    model:"/glbs/europe_with_4k_heightmap.glb",
    tags:[
      "europe",
      "germany",
      "italy",
      "mountain",
      "forest"
    ],
    lighting:"continental daylight",
    camera:"satellite terrain orbit",
    retention:6440,
    interestDropMs:4102,
    density:"high",
    mood:"historic",
    motion:"terrain scan",
    hallucinationRisk:"low",
    description:
      "Continental terrain observatory reconstruction with environmental elevation mapping."
  },

  {
    title:"Moon Surface",
    model:"/glbs/moon.glb",
    tags:[
      "moon",
      "space",
      "planet"
    ],
    lighting:"deep-space reflection",
    camera:"orbital satellite",
    retention:9820,
    interestDropMs:8120,
    density:"low",
    mood:"mysterious",
    motion:"orbital drift",
    hallucinationRisk:"low",
    description:
      "Extraterrestrial planetary terrain reconstruction with orbital observatory telemetry."
  }

]

export function getSignalsByRegion(search){

  const query =
    search.toLowerCase()

  return observatoryMeta.filter(item =>

    item.tags.some(tag =>

      tag.includes(query) ||
      query.includes(tag)

    )

  )

}

export function getRandomSignal(search){

  const items =
    getSignalsByRegion(search)

  if(!items.length){
    return null
  }

  return items[
    Math.floor(
      Math.random() * items.length
    )
  ]

}
