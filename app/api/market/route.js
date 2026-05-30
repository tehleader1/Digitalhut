export async function POST(req){
 const {query="BTC"}=await req.json()
 const q=query.toUpperCase()
 return Response.json({
  symbol:q,
  price:"Live provider placeholder",
  ai:`Market Intelligence scan for ${q}: review trend direction, volatility, liquidity, candle structure, and risk before action. Alpaca keys can power live candles when env vars are added.`,
  candles:[12,15,13,18,17,22,20,26,24,29]
 })
}
