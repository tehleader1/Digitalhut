function normalizeAssetBase(value){
  return value ? `${value.replace(/\/+$/, "")}/` : ""
}

function isRejectedAssetBase(value){
  const source = String(value || "").trim()
  if(!source) return false
  const lower = source.toLowerCase()
  if(lower.includes("xxxxx") || lower.includes("your-store") || lower.includes("store-id")) return true
  try {
    const url = new URL(source)
    const host = url.hostname.toLowerCase()
    const allowVercelBlob = import.meta.env?.VITE_ALLOW_VERCEL_BLOB_FIRECUDA === "true"
    if(host.includes("vercel-storage.com") && !allowVercelBlob) return true
    if(host === "public.blob.vercel-storage.com") return true
    if(host.endsWith(".public.blob.vercel-storage.com")){
      const storeId = host.replace(".public.blob.vercel-storage.com", "")
      return storeId.length < 6
    }
  } catch {
    return true
  }
  return false
}

const firecudaBase = "/models/firecuda-library/"
const configuredFirecudaExternalBase = normalizeAssetBase(import.meta.env?.VITE_SUPABASE_FIRECUDA_ASSET_BASE || import.meta.env?.VITE_FIRECUDA_ASSET_BASE || "")
const firecudaExternalBase = isRejectedAssetBase(configuredFirecudaExternalBase) ? "" : configuredFirecudaExternalBase
const localDeployableFirecudaFiles = new Set([
  "glaceons_christmas_miracle.glb",
  "international_space_elevator.glb",
  "museum_of_ice_cream_singapore_-_welcome.glb",
  "transformers_prime_game_bumblebee.glb"
])
const defaultBlockedSingleObjectFiles = new Set([
  "glaceons_christmas_miracle.glb",
  "transformers_prime_game_bumblebee.glb",
  "zed_-_league_of_legends.glb"
])
const environmentSignals = [
  "environment", "scene", "city", "village", "house", "real estate", "property",
  "terrain", "heightmap", "continent", "country", "coast", "tourist", "museum",
  "architecture", "building", "base", "station", "planet", "planetary system",
  "space elevator", "observatory", "district", "zone", "world", "map"
]

export const firecudaDriveBatch001 = [
  "1EyJREaTttytp-uwVhai3ak9xq6eBxWiC",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1-YY7aB27KA26WHGy6a12EeyAVuGcr0J4",
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "10l-R7SLRhu8NvGalmgYd0fZYLEF3jRuo",
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "11prER3yXxDctKPns3Gv1Phg1Ljev8m71",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74",
  "1r7X8cCJqsbH3Bf6wtu1Qxa4Uc9lU5pVb",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1YM4zbXIFgZ8raQF3SlP4f_y-QYLPuGAz",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "1GJ_OpSvDmJhsocCVs4et2h-ZhsmaLxix",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "1emU0A12zgKmQDgkZdNcwwnzyIRSFs5qN",
  "10zpqqZCSGTw61GXKUrnhfpf8A0Qh3RID",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1iVhC4fgx7IabWtPR8aIuAo0uCwjJUxOo",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1lYLHB4OggZZOSOxH6YRCQMDsPhn31Zov"
]

export const firecudaDriveBatch002 = [
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1svVunRANrfFGISTjunayCZk54yKpwVpA",
  "1fEtS-ZjEn7qqZ-xJGxBujDA2FWO9vLCS",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "1J-UsxfLhLOWuDYVy-zmyvne8q04osh6m",
  "1z5JvxiK0B0c22wRpDbsb06UxOHJeBukm",
  "186Bd5Mk94gGn2yUqlkt8Rx-qBQgsU-f9",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1dESiBN5AKFVW1TApkYfuNMQYUGQK7hDD",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1ZekhMOTCq1DJtrFgJzKnvt32EHvG9Ou1",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1nIVnjng9xxmNd1HDsnJaQyI8nuwcE7OO",
  "1yR-QKJ0jQ-fS7w9YKH6lwCsv_CSBNnOW",
  "1fASNAMhDLCcFOoGu9_1102q3qK4Icifl",
  "1HGV8v5o0BkKNbAX-c-wZlTQGVIq7HW0F",
  "124hPc06f0i6eQqcqevrIN2dMYG3EBToN",
  "1RUSc2VdaiHcAUwi6LYPEokj3n6ZRe3ki",
  "1jk-gPiD8RZRn_pUStKHOR-NaxDL1KDm7",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "12TfLxDbYm1qQAiLltUvv8feW6eZj9B_g",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "1nDoh9dMSEvum9p5tnpJSSxGhorZPikiK",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74"
]

export const firecudaDriveBatch003 = [
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "186Bd5Mk94gGn2yUqlkt8Rx-qBQgsU-f9",
  "1svVunRANrfFGISTjunayCZk54yKpwVpA",
  "1fEtS-ZjEn7qqZ-xJGxBujDA2FWO9vLCS",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1z5JvxiK0B0c22wRpDbsb06UxOHJeBukm",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1J-UsxfLhLOWuDYVy-zmyvne8q04osh6m",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1ZekhMOTCq1DJtrFgJzKnvt32EHvG9Ou1",
  "1dESiBN5AKFVW1TApkYfuNMQYUGQK7hDD",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "10l-R7SLRhu8NvGalmgYd0fZYLEF3jRuo",
  "1EyJREaTttytp-uwVhai3ak9xq6eBxWiC",
  "1-YY7aB27KA26WHGy6a12EeyAVuGcr0J4",
  "1yR-QKJ0jQ-fS7w9YKH6lwCsv_CSBNnOW",
  "1nDoh9dMSEvum9p5tnpJSSxGhorZPikiK",
  "1RUSc2VdaiHcAUwi6LYPEokj3n6ZRe3ki",
  "1fASNAMhDLCcFOoGu9_1102q3qK4Icifl",
  "1zupyRFIgXc8J8p4VukDQm7ZVMohNppCx",
  "1HGV8v5o0BkKNbAX-c-wZlTQGVIq7HW0F"
]

export const firecudaDriveBatch002NewIds = firecudaDriveBatch002.filter((id) => !firecudaDriveBatch001.includes(id))
export const firecudaDriveBatch002ExistingIds = firecudaDriveBatch002.filter((id) => firecudaDriveBatch001.includes(id))
export const firecudaDriveBatch003NewIds = firecudaDriveBatch003.filter((id) => ![...firecudaDriveBatch001, ...firecudaDriveBatch002].includes(id))
export const firecudaDriveBatch003ExistingIds = firecudaDriveBatch003.filter((id) => [...firecudaDriveBatch001, ...firecudaDriveBatch002].includes(id))

export const firecudaLibraryAssets = [
  {
    id: "firecuda-museum-ice-cream-singapore",
    file: "museum_of_ice_cream_singapore_-_welcome.glb",
    title: "Museum of Ice Cream Singapore welcome environment",
    categories: ["Mainstream Streaming", "Continent", "Businesses", "Real Estate", "DigitalHut Presentation"],
    tags: ["singapore", "museum", "mainstream", "continent", "business", "real estate", "tourism", "indoor environment"],
    thumbnail: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-15T20:17:56.000Z"
  },
  {
    id: "firecuda-international-space-elevator",
    file: "international_space_elevator.glb",
    title: "International space elevator",
    categories: ["Planetary", "Orbital Compute", "Science", "Researcher", "Programmer", "Workforce", "Continent", "DigitalHut Presentation"],
    tags: ["space", "planetary", "science", "engineering", "research", "international", "observatory"],
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-15T20:17:56.000Z"
  },
  {
    id: "firecuda-glaceon-christmas",
    file: "glaceons_christmas_miracle.glb",
    title: "Glaceon's Christmas Miracle scene",
    categories: ["Gamer", "Mainstream Streaming"],
    tags: ["gaming", "viral", "mainstream", "winter", "character scene", "presentation"],
    thumbnail: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-15T20:17:56.000Z"
  },
  {
    id: "firecuda-transformers-bumblebee",
    file: "transformers_prime_game_bumblebee.glb",
    title: "Transformers Prime game Bumblebee",
    categories: ["Gamer", "Mainstream Streaming"],
    tags: ["gaming", "viral", "mainstream", "game model", "robot", "character scene"],
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-15T20:17:56.000Z"
  },
  {
    id: "firecuda-abandoned-farm-house",
    file: "abandoned_farm_house_with_hay.glb",
    title: "Abandoned farm house with hay",
    categories: ["Real Estate", "History", "Continent", "Researcher"],
    tags: ["real estate", "farm house", "rural", "history", "environment", "property"],
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-cape-town-south-africa",
    file: "cape_town_-_south_africa.glb",
    title: "Cape Town South Africa",
    categories: ["Continent", "Real Estate", "Mainstream Streaming", "Businesses"],
    tags: ["cape town", "south africa", "city", "continent", "travel", "urban environment"],
    thumbnail: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-earth",
    file: "earth.glb",
    title: "Earth",
    categories: ["Planetary", "Orbital Compute", "Science", "Researcher", "Continent"],
    tags: ["earth", "planet", "science", "global", "observatory", "research"],
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-europe-heightmap",
    file: "europe_with_4k_heightmap.glb",
    title: "Europe with 4K heightmap",
    categories: ["Continent", "Science", "Researcher", "Planetary"],
    tags: ["europe", "heightmap", "terrain", "continent", "geography", "science"],
    thumbnail: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-international-space-station",
    file: "international_space_station.glb",
    title: "International Space Station",
    categories: ["Planetary", "Orbital Compute", "Science", "Researcher", "Programmer"],
    tags: ["space station", "orbit", "science", "planetary", "research", "engineering"],
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-low-poly-environments",
    file: "low_poly_environments_01.glb",
    title: "Low poly environments 01",
    categories: ["Gamer", "Mainstream Streaming", "DigitalHut Presentation"],
    tags: ["gaming", "environment", "low poly", "presentation", "viral"],
    thumbnail: "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-mars-one-base",
    file: "mars_one_mission_-_base.glb",
    title: "Mars One mission base",
    categories: ["Planetary", "Orbital Compute", "Science", "Researcher"],
    tags: ["mars", "base", "planetary", "science", "research", "space"],
    thumbnail: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-morgantown-west-virginia",
    file: "morgantown_west_virginia_usa_x2.glb",
    title: "Morgantown West Virginia USA",
    categories: ["Continent", "Real Estate", "Workforce"],
    tags: ["morgantown", "west virginia", "usa", "city", "housing", "local environment"],
    thumbnail: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-new-york-city",
    file: "new_york_city.glb",
    title: "New York City",
    categories: ["Continent", "Real Estate", "Businesses", "Mainstream Streaming"],
    tags: ["new york", "city", "business", "real estate", "urban", "mainstream"],
    thumbnail: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-puertas-verdes",
    file: "puertas_verdes.glb",
    title: "Puertas Verdes",
    categories: ["Real Estate", "History", "Continent"],
    tags: ["architecture", "doors", "building", "real estate", "historic", "environment"],
    thumbnail: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-real-estate-demo",
    file: "real_estate_demo.glb",
    title: "Real estate demo",
    categories: ["Real Estate", "Businesses", "DigitalHut Presentation"],
    tags: ["real estate", "property", "housing", "demo", "business"],
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-rio-de-janeiro-brazil",
    file: "rio_de_janeiro_-_brazil.glb",
    title: "Rio de Janeiro Brazil",
    categories: ["Continent", "Mainstream Streaming", "Real Estate"],
    tags: ["rio de janeiro", "brazil", "city", "continent", "travel", "urban"],
    thumbnail: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-snowy-village",
    file: "snowy_village__ps1_environment.glb",
    title: "Snowy village PS1 environment",
    categories: ["Gamer", "Mainstream Streaming", "Continent"],
    tags: ["snowy village", "gaming", "environment", "winter", "mainstream"],
    thumbnail: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-split-point-victoria",
    file: "split_point_victoria_australia.glb",
    title: "Split Point Victoria Australia",
    categories: ["Continent", "Science", "Mainstream Streaming"],
    tags: ["australia", "victoria", "coast", "travel", "continent", "environment"],
    thumbnail: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-trappist-1-system",
    file: "the_planetary_system_of_trappist-1.glb",
    title: "The planetary system of TRAPPIST-1",
    categories: ["Planetary", "Orbital Compute", "Science", "Researcher"],
    tags: ["trappist-1", "planetary system", "space", "science", "research"],
    thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-tourist-colonial-zone",
    file: "tourist_colonial_zone_dominican_republic.glb",
    title: "Tourist colonial zone Dominican Republic",
    categories: ["Continent", "History", "Mainstream Streaming", "Real Estate"],
    tags: ["dominican republic", "tourism", "colonial zone", "history", "travel", "city"],
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  },
  {
    id: "firecuda-zed-league-of-legends",
    file: "zed_-_league_of_legends.glb",
    title: "Zed League of Legends",
    categories: ["Gamer", "Mainstream Streaming"],
    tags: ["league of legends", "zed", "gaming", "viral", "character scene"],
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-06-16T00:47:17.000Z"
  }
]

export function firecudaUrl(file){
  if(localDeployableFirecudaFiles.has(file)) return `${firecudaBase}${file}`
  return `${firecudaExternalBase || firecudaBase}${file}`
}

export function firecudaLocalFallbackUrl(value){
  const source = String(value || "")
  const file = source.split("?")[0].split("#")[0].split("/").pop()
  if(file && localDeployableFirecudaFiles.has(file)) return `${firecudaBase}${file}`
  return ""
}

function isFirecudaAssetAvailable(asset){
  return Boolean(firecudaExternalBase) || localDeployableFirecudaFiles.has(asset.file)
}

export function isEnvironmentAsset(asset){
  if(!asset || defaultBlockedSingleObjectFiles.has(asset.file)) return false
  const value = `${asset.title || ""} ${(asset.tags || []).join(" ")}`.toLowerCase()
  return environmentSignals.some((signal) => value.includes(signal))
}

export function firecudaModelPool(category){
  return firecudaLibraryAssets
    .filter((asset) => asset.categories.includes(category) && isFirecudaAssetAvailable(asset) && isEnvironmentAsset(asset))
    .map((asset) => firecudaUrl(asset.file))
}

export function firecudaAssetsForCategory(category){
  return firecudaLibraryAssets.filter((asset) => asset.categories.includes(category) && isFirecudaAssetAvailable(asset) && isEnvironmentAsset(asset))
}

export function firecudaDiscoveryAssets(){
  return firecudaLibraryAssets.filter(isFirecudaAssetAvailable).map((asset) => ({
    id: asset.id,
    name: `FireCuda library - ${asset.title}`,
    type: "Personal GLB Library",
    url: firecudaUrl(asset.file),
    thumbnail: asset.thumbnail,
    tags: asset.tags,
    permission: "owner-personal-library",
    genericDemo: false,
    createdAt: asset.createdAt,
    views: 1
  }))
}

export function firecudaLibraryStatus(){
  const available = firecudaLibraryAssets.filter(isFirecudaAssetAvailable)
  const defaultEnvironments = available.filter(isEnvironmentAsset)
  return {
    mode: firecudaExternalBase ? "uploaded-personal-library" : "local-git-library",
    baseUrl: firecudaExternalBase || firecudaBase,
    externalBaseRejected: Boolean(configuredFirecudaExternalBase && !firecudaExternalBase),
    availableCount: available.length,
    defaultEnvironmentCount: defaultEnvironments.length,
    totalCount: firecudaLibraryAssets.length
  }
}
