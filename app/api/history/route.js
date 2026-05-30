let db = globalThis.digitalhutDb ||= { users:{}, history:[] }
export async function POST(req){
  const item = await req.json()
  db.history.unshift({...item,time:Date.now()})
  return Response.json({ok:true,history:db.history.slice(0,20)})
}
export async function GET(){ return Response.json({history:db.history||[]}) }
