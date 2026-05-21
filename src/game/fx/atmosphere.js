let tick=0

export function renderAtmosphere(ctx,w,h){

  tick+=0.4

  ctx.fillStyle="rgba(255,255,255,0.02)"

  for(let i=0;i<30;i++){

    ctx.beginPath()

    ctx.arc(
      ((i*90)+(tick))%w,
      60+(i%8)*90,
      16+Math.sin(tick*.02+i)*5,
      0,
      7
    )

    ctx.fill()
  }

  ctx.fillStyle="rgba(0,0,0,0.25)"

  ctx.fillRect(0,0,w,60)

  ctx.fillRect(0,h-60,w,60)
}
