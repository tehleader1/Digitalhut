export async function GET() {
  return Response.json({
    status: "ready-for-runtime-check",
    observatory: {
      rawHttpStatusHidden: true,
      expectedSearchStatusLabel: "Sketchfab search connected; no ranked downloadable model matched",
      expectedConnectedLabel: "Sketchfab search connected",
      providerLabelField: "providerLabel",
      searchStatusLabelField: "searchStatusLabel",
      userFacingRequirement: "Do not show raw 200 as the observatory status. Show the Sketchfab status label instead."
    },
    market: {
      apiPickupRequired: true,
      expectedFields: ["selected", "mode", "label", "live", "attempts", "credentialsDetected", "requestedSymbol", "technicalsPreloaded"],
      uiSurfaces: ["Market API", "Selected feed", "API mode", "Technicals", "provider attempts"],
      userFacingRequirement: "Market renderer must show which API path was selected and whether technicals are preloaded."
    }
  })
}
