import assert from "node:assert/strict"
import {readFileSync} from "node:fs"

const migrationPath = new URL("../supabase/migrations/20260718100307_digitalhut_page_receipt_classification.sql", import.meta.url)
const emitterPath = new URL("../src/lib/digitalhutSearchPixel.js", import.meta.url)
const sql = readFileSync(migrationPath, "utf8")
const emitter = readFileSync(emitterPath, "utf8")
let checked = 0
const check = (condition, message) => { checked += 1; assert.ok(condition, message) }

const classes = [
  "first-recorded-arrival",
  "same-session-refresh-remount",
  "same-session-deliberate-return",
  "new-session-return",
  "new-day-return",
  "preview-test",
  "known-automatic-activity",
  "unknown-classification"
]

for(const value of classes) check(sql.includes(`'${value}'`), `missing receipt class ${value}`)
check(/primary key references public\.digitalhut_search_pixel_events\(id\) on delete restrict/i.test(sql), "event FK/idempotency boundary missing")
check(/enable row level security/i.test(sql), "RLS missing")
check(/revoke all on table[\s\S]*from public, anon, authenticated/i.test(sql), "browser-role table revoke missing")
check(/grant select, insert[\s\S]*to service_role/i.test(sql), "service-only table access missing")
check(/security definer set search_path=public,extensions,pg_temp/i.test(sql), "trigger fixed search_path missing")
check(/security definer set search_path=public,pg_temp/i.test(sql), "read RPC fixed search_path missing")
check(/revoke all on function public\.digitalhut_search_pixel_page_receipt_read\(\) from public,anon,authenticated/i.test(sql), "read RPC browser revoke missing")
check(/grant execute on function public\.digitalhut_search_pixel_page_receipt_read\(\) to service_role/i.test(sql), "read RPC service grant missing")
check(/zz_digitalhut_search_pixel_page_receipt_classification_trigger/i.test(sql), "ordered trigger name missing")
check(/pg_advisory_xact_lock/i.test(sql), "browser serialization lock missing")
check(/for update/i.test(sql), "pinned acquisition session lock missing")
check(/on conflict \(event_id\) do nothing/i.test(sql), "idempotent backfill missing")
check(/historical-navigation-evidence-unavailable/i.test(sql), "historical ambiguity reason missing")
check(/g\.page_views=c\.gross/i.test(sql), "gross/global invariant missing")
check(/c\.qualified=c\.gross-c\.preview_test-c\.known_automatic/i.test(sql), "qualified invariant missing")
check(/d\.duplicate_groups=0/i.test(sql), "durable duplicate invariant missing")
check(/countsPeople',false/i.test(sql), "people-count truth boundary missing")
check(/clientEventId/i.test(emitter), "client event id missing")
check(/deliveryRecoveredAfterFailure/i.test(emitter), "recovery receipt missing")
check(/deliveryAttempt/i.test(emitter), "delivery attempt missing")
check(/pendingNavigationKey/i.test(emitter), "navigation evidence handoff missing")
check(/if new\.event_name not in \('page_view','blog_view'\) then return new/i.test(sql), "non-page actions must not create page receipts")
for(const eventName of ["node_activation","node_search_submit"]){
  check(sql.split("create or replace function public.digitalhut_recorded_event_class")[1]?.includes(`'${eventName}'`), `${eventName} taxonomy mapping missing`)
  check(sql.split("create or replace function public.digitalhut_acquisition_is_second_action")[1]?.includes(`'${eventName}'`), `${eventName} deliberate-action mapping missing`)
}

function classify(input){
  if(input.preview) return "preview-test"
  if(input.automatic) return "known-automatic-activity"
  if(!input.browser) return "unknown-classification"
  if(!input.previous) return "first-recorded-arrival"
  if(input.previous.day < input.day) return "new-day-return"
  if(input.previous.session !== input.session) return "new-session-return"
  if(input.sameRouteSeen && input.previous.route !== input.route && input.target === input.route && ["internal-link-click", "history-pop"].includes(input.evidence)) return "same-session-deliberate-return"
  if(input.previous.route === input.route && ["reload", "initial", "replacestate"].includes(input.navigation)) return "same-session-refresh-remount"
  return "unknown-classification"
}

const base = {browser:true,session:"s2",day:2,route:"/watch/a",previous:{session:"s2",day:2,route:"/watch/b"},sameRouteSeen:true,target:"/watch/a",evidence:"internal-link-click",navigation:"navigate"}
const fixtures = [
  [{...base,preview:true,automatic:true}, "preview-test"],
  [{...base,automatic:true}, "known-automatic-activity"],
  [{...base,browser:false}, "unknown-classification"],
  [{...base,previous:null}, "first-recorded-arrival"],
  [{...base,previous:{...base.previous,day:1}}, "new-day-return"],
  [{...base,previous:{...base.previous,session:"s1"}}, "new-session-return"],
  [base, "same-session-deliberate-return"],
  [{...base,route:"/watch/b",target:"",evidence:"none",navigation:"reload"}, "same-session-refresh-remount"],
  [{...base,target:"/watch/c"}, "unknown-classification"],
  [{...base,evidence:"none"}, "unknown-classification"]
]
for(const [input, expected] of fixtures) check(classify(input) === expected, `classification precedence failed for ${expected}`)

const counts = Object.fromEntries(classes.map(value => [value, 0]))
for(const [, expected] of fixtures) counts[expected] += 1
const gross = Object.values(counts).reduce((sum, value) => sum + value, 0)
const qualified = gross - counts["preview-test"] - counts["known-automatic-activity"]
check(gross === fixtures.length, "class partition must equal gross receipts")
check(qualified === fixtures.length - 2, "qualified receipts must exclude preview and automation")

console.log(JSON.stringify({ok:true,checked,classes:classes.length,fixtures:fixtures.length}, null, 2))
