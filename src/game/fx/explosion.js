export function renderExplosion(ctx,x,y){

  ctx.fillStyle="rgba(249,115,22,0.65)"

  ctx.beginPath()

  ctx.arc(x,y,80,0,7)

  ctx.fill()
}
