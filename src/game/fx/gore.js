export function renderGore(ctx,x,y){

  ctx.fillStyle="#7f1d1d"

  for(let i=0;i<10;i++){

    ctx.beginPath()

    ctx.arc(
      x+(Math.random()*50-25),
      y+(Math.random()*50-25),
      4+Math.random()*8,
      0,
      7
    )

    ctx.fill()
  }
}
