export function testCesiumLocationSource(target = {}) {
  const token = process.env.CESIUM_ION_TOKEN
  const latitude = target.latitude ?? 40.706
  const longitude = target.longitude ?? -74.009

  return {
    provider: "cesium-ion",
    category: "terrain-3d-tiles",
    keyPresent: Boolean(token),
    status: token ? "configured" : "missing-key",
    sampleTitle: target.label || "Brooklyn / Lower Manhattan property map context",
    location: { latitude, longitude, radiusMeters: target.radiusMeters || 1800 },
    canRender: Boolean(token),
    sampleMapUrl: token ? `cesium://ion?lat=${latitude}&lng=${longitude}` : null,
    fallbackReason: token ? null : "Set CESIUM_ION_TOKEN to enable Cesium terrain, city, and 3D Tiles context."
  }
}
