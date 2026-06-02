export function testCesiumLocationSource(target = {}) {
  const token = process.env.CESIUM_ION_TOKEN
  const latitude = target.latitude ?? 40.706
  const longitude = target.longitude ?? -74.009
  const radiusMeters = target.radiusMeters || 1800
  const label = target.label || "Brooklyn / Lower Manhattan property map context"

  return {
    provider: "cesium-ion",
    category: "terrain-3d-tiles",
    visualType: "location-context",
    keyPresent: Boolean(token),
    status: token ? "configured" : "missing-key",
    sampleTitle: label,
    location: { latitude, longitude, radiusMeters },
    visual: {
      label,
      latitude,
      longitude,
      radiusMeters,
      context: "Cesium terrain / 3D Tiles location context",
      searchTarget: "city terrain buildings property map context"
    },
    canRender: true,
    sampleMapUrl: token ? `cesium://ion?lat=${latitude}&lng=${longitude}` : null,
    fallbackReason: token ? null : "Set CESIUM_ION_TOKEN to enable live Cesium terrain, city, and 3D Tiles context."
  }
}
