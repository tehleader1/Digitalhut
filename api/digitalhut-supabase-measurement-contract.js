import {baseArtifact, measurementEvents, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, {
    ...baseArtifact("DigitalHut Supabase Measurement Contract"),
    table: "public.digitalhut_search_pixel_events",
    requiredColumns: ["event_name", "session_id", "visitor_id", "path", "search", "keyword_hint", "category", "asset_id", "blog_slug", "metadata", "created_at"],
    events: measurementEvents
  })
}
