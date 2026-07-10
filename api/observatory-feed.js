const assetCatalog = {
  "museum_of_ice_cream_singapore_-_welcome.glb": ["Museum of Ice Cream Singapore", ["singapore", "museum", "tourism", "indoor environment"]],
  "international_space_elevator.glb": ["International Space Elevator", ["space", "engineering", "planetary", "observatory"]],
  "abandoned_farm_house_with_hay.glb": ["Abandoned Farm House", ["farm", "house", "property", "rural environment"]],
  "cape_town_-_south_africa.glb": ["Cape Town South Africa", ["cape town", "city", "coast", "urban environment"]],
  "earth.glb": ["Earth Observatory", ["earth", "planet", "global", "observatory"]],
  "europe_with_4k_heightmap.glb": ["Europe 4K Heightmap", ["europe", "terrain", "heightmap", "continent"]],
  "international_space_station.glb": ["International Space Station", ["space station", "orbit", "science", "engineering"]],
  "low_poly_environments_01.glb": ["Low Poly Game Environments", ["gaming", "world", "environment", "level"]],
  "mars_one_mission_-_base.glb": ["Mars One Mission Base", ["mars", "base", "planetary", "environment"]],
  "morgantown_west_virginia_usa_x2.glb": ["Morgantown West Virginia", ["morgantown", "city", "housing", "local environment"]],
  "new_york_city.glb": ["New York City", ["new york", "city", "urban", "mainstream"]],
  "real_estate_demo.glb": ["Real Estate Environment", ["real estate", "property", "housing", "environment"]],
  "rio_de_janeiro_-_brazil.glb": ["Rio de Janeiro Brazil", ["rio", "brazil", "city", "travel"]],
  "snowy_village__ps1_environment.glb": ["Snowy Village Game Environment", ["snowy village", "gaming", "winter", "environment"]],
  "split_point_victoria_australia.glb": ["Split Point Victoria Australia", ["australia", "coast", "travel", "environment"]],
  "the_planetary_system_of_trappist-1.glb": ["TRAPPIST-1 Planetary System", ["space", "planetary system", "science", "observatory"]],
  "tourist_colonial_zone_dominican_republic.glb": ["Dominican Republic Colonial Zone", ["dominican republic", "tourism", "history", "city"]]
}

const environmentPools = {
  "Mainstream Streaming": ["new_york_city.glb", "rio_de_janeiro_-_brazil.glb", "cape_town_-_south_africa.glb", "split_point_victoria_australia.glb", "museum_of_ice_cream_singapore_-_welcome.glb"],
  Mobility: ["new_york_city.glb", "cape_town_-_south_africa.glb", "morgantown_west_virginia_usa_x2.glb"],
  Planetary: ["the_planetary_system_of_trappist-1.glb", "mars_one_mission_-_base.glb", "earth.glb", "international_space_station.glb", "international_space_elevator.glb"],
  "Orbital Compute": ["international_space_elevator.glb", "international_space_station.glb", "earth.glb", "the_planetary_system_of_trappist-1.glb", "mars_one_mission_-_base.glb"],
  "Real Estate": ["real_estate_demo.glb", "abandoned_farm_house_with_hay.glb", "morgantown_west_virginia_usa_x2.glb", "new_york_city.glb", "cape_town_-_south_africa.glb"],
  Science: ["earth.glb", "international_space_station.glb", "europe_with_4k_heightmap.glb", "mars_one_mission_-_base.glb"],
  Researcher: ["europe_with_4k_heightmap.glb", "earth.glb", "international_space_station.glb", "tourist_colonial_zone_dominican_republic.glb"],
  Continent: ["cape_town_-_south_africa.glb", "rio_de_janeiro_-_brazil.glb", "new_york_city.glb", "europe_with_4k_heightmap.glb", "split_point_victoria_australia.glb"],
  Gamer: ["low_poly_environments_01.glb", "snowy_village__ps1_environment.glb"],
  Workforce: ["international_space_elevator.glb", "morgantown_west_virginia_usa_x2.glb", "new_york_city.glb"],
  Businesses: ["new_york_city.glb", "cape_town_-_south_africa.glb", "museum_of_ice_cream_singapore_-_welcome.glb"],
  History: ["tourist_colonial_zone_dominican_republic.glb", "abandoned_farm_house_with_hay.glb", "museum_of_ice_cream_singapore_-_welcome.glb"],
  Programmer: ["international_space_station.glb", "international_space_elevator.glb", "new_york_city.glb"],
  Political: ["new_york_city.glb", "morgantown_west_virginia_usa_x2.glb", "europe_with_4k_heightmap.glb"],
  "DigitalHut Presentation": ["museum_of_ice_cream_singapore_-_welcome.glb", "international_space_elevator.glb", "low_poly_environments_01.glb"]
}

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function isRejectedAssetBase(value){
  const source = String(value || "").trim()
  if(!source) return false
  const lower = source.toLowerCase()
  if(lower.includes("xxxxx") || lower.includes("your-store") || lower.includes("store-id")) return true
  try {
    const url = new URL(source)
    const host = url.hostname.toLowerCase()
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

function externalAssetBase(){
  const direct = envValue("SUPABASE_FIRECUDA_ASSET_BASE") || envValue("VITE_SUPABASE_FIRECUDA_ASSET_BASE") || envValue("FIRECUDA_ASSET_BASE") || envValue("VITE_FIRECUDA_ASSET_BASE")
  if(direct && !isRejectedAssetBase(direct)) return `${direct.replace(/\/+$/, "")}/`
  const supabaseUrl = envValue("SUPABASE_URL") || envValue("VITE_SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL")
  if(!supabaseUrl) return ""
  const bucket = envValue("SUPABASE_ASSET_BUCKET") || envValue("VITE_SUPABASE_ASSET_BUCKET") || envValue("SUPABASE_STORAGE_BUCKET") || "digitalhut-assets"
  const folder = envValue("SUPABASE_FIRECUDA_FOLDER") || envValue("VITE_SUPABASE_FIRECUDA_FOLDER") || "firecuda-library"
  const value = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${folder}`
  return value ? `${value.replace(/\/+$/, "")}/` : ""
}

function assetBaseDiagnostics(){
  const direct = envValue("SUPABASE_FIRECUDA_ASSET_BASE") || envValue("VITE_SUPABASE_FIRECUDA_ASSET_BASE") || envValue("FIRECUDA_ASSET_BASE") || envValue("VITE_FIRECUDA_ASSET_BASE")
  const supabaseUrl = envValue("SUPABASE_URL") || envValue("VITE_SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL")
  const directRejected = Boolean(direct && isRejectedAssetBase(direct))
  return {
    mode: direct && !directRejected ? "direct-base" : supabaseUrl ? "derived-supabase-storage-base" : "local-backup-only",
    hasDirectBase: Boolean(direct),
    directBaseRejected: directRejected,
    hasSupabaseUrl: Boolean(supabaseUrl),
    bucket: envValue("SUPABASE_ASSET_BUCKET") || envValue("VITE_SUPABASE_ASSET_BUCKET") || envValue("SUPABASE_STORAGE_BUCKET") || "digitalhut-assets",
    folder: envValue("SUPABASE_FIRECUDA_FOLDER") || envValue("VITE_SUPABASE_FIRECUDA_FOLDER") || "firecuda-library",
    allowedFilesConfigured: allowedStorageFiles().size,
    requiredForFullProduction: [
      "SUPABASE_FIRECUDA_ASSET_BASE or VITE_SUPABASE_FIRECUDA_ASSET_BASE",
      "SUPABASE_FIRECUDA_AVAILABLE_FILES for verified storage object names",
      "or SUPABASE_URL/VITE_SUPABASE_URL plus SUPABASE_ASSET_BUCKET and SUPABASE_FIRECUDA_FOLDER"
    ]
  }
}

function allowedStorageFiles(){
  const raw = envValue("SUPABASE_FIRECUDA_AVAILABLE_FILES") || envValue("VITE_SUPABASE_FIRECUDA_AVAILABLE_FILES") || envValue("FIRECUDA_AVAILABLE_FILES")
  return new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))
}

export default function handler(req, res){
  const category = String(req.query?.category || "Mainstream Streaming")
  const query = String(req.query?.query || category).replace(/\s+/g, " ").trim().slice(0, 160)
  const firecudaDisabled = process.env.ENABLE_FIRECUDA_ASSETS !== "true"
  if(firecudaDisabled){
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
    return res.status(200).json({
      category,
      query,
      policy: "FireCuda owner-library assets are temporarily disabled so live API feeds can surface without broken storage GLB URLs.",
      assetBase: {...assetBaseDiagnostics(), disabled: true},
      assets: []
    })
  }
  const pool = environmentPools[category] || environmentPools["Mainstream Streaming"]
  const base = externalAssetBase()
  const localFiles = new Set(["museum_of_ice_cream_singapore_-_welcome.glb", "international_space_elevator.glb"])
  const verifiedStorageFiles = allowedStorageFiles()
  const canUseExternal = Boolean(base && verifiedStorageFiles.size)
  const assets = pool
    .filter((file) => localFiles.has(file) || (canUseExternal && verifiedStorageFiles.has(file)))
    .map((file, index) => {
      const external = canUseExternal && verifiedStorageFiles.has(file)
      return {
        id: `digitalhut-environment-${category}-${index}`,
        title: assetCatalog[file]?.[0] || file,
        description: `Verified DigitalHut owner-library environment for ${query}. All-access production lane with structure, terrain, routes, facilities, and surrounding context.`,
        modelUrl: external ? `${base}${encodeURIComponent(file)}` : `/models/firecuda-library/${encodeURIComponent(file)}`,
        viewerUrl: "",
        apiSource: external ? "Supabase FireCuda Verified Library" : "Vercel FireCuda Backup API",
        apiStatus: external ? "verified-supabase-glb" : "verified-local-backup-glb",
        tags: [category, "environment", "structure", "mapping", "terrain", "scene", ...(assetCatalog[file]?.[1] || [])]
      }
    })
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900")
  return res.status(200).json({
    category,
    query,
    policy: "No synthetic fallback models. Only verified owner-library or API GLBs are returned.",
    assetBase: assetBaseDiagnostics(),
    assets
  })
}
