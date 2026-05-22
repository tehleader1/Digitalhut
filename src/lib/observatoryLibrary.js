export const observatoryLibrary = {

  "north america":[
    "/glbs/dtes_vancouver_canada.glb",
    "/glbs/surfside_florida_usa_beachfront_properties.glb",
    "/glbs/morgantown_west_virginia_usa_x2.glb",
    "/glbs/new_york_city._manhattan.glb"
  ],

  "south america":[
    "/glbs/rio_de_janeiro_-_brazil.glb"
  ],

  "europe":[
    "/glbs/europe_with_4k_heightmap.glb",
    "/glbs/european_buildings_asset_pack_3.glb"
  ],

  "africa":[
    "/glbs/cape_town_-_south_africa.glb"
  ],

  "space":[
    "/glbs/international_space_station.glb",
    "/glbs/moon.glb"
  ],

  "hollywood":[
    "/glbs/hollywood_sign_los_angeles_ca_usa.glb"
  ],

  "caribbean":[
    "/glbs/tourist_colonial_zone_dominican_republic.glb"
  ],

  "city":[
    "/glbs/city_pack_7.glb"
  ]

}

export function getRandomObservatory(region){

  const key = region.toLowerCase()

  const items = observatoryLibrary[key]

  if(!items?.length){
    return null
  }

  return items[
    Math.floor(Math.random() * items.length)
  ]
}
