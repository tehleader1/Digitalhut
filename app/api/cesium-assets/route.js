export const dynamic = "force-dynamic"

export async function GET() {
  const token = process.env.CESIUM_ION_TOKEN

  if (!token) {
    return Response.json({
      provider: "cesium-fallback",
      tokenPresent: false,
      assets: [],
      message: "Set CESIUM_ION_TOKEN in Render to enable Cesium Ion asset metadata."
    })
  }

  try {
    const response = await fetch("https://api.cesium.com/v1/assets", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
    const data = await response.json()
    const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []

    return Response.json({
      provider: response.ok ? "cesium-live" : "cesium-error",
      tokenPresent: true,
      requestStatus: response.status,
      assets: items.slice(0, 12).map((asset) => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        description: asset.description || "Cesium Ion asset"
      })),
      message: response.ok ? "Cesium Ion asset metadata confirmed." : data.message || "Cesium Ion request returned an error."
    })
  } catch (error) {
    return Response.json({
      provider: "cesium-error",
      tokenPresent: true,
      assets: [],
      message: error?.message || "Cesium Ion request failed."
    })
  }
}
