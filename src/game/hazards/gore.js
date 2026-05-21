export function renderGore(
  ctx,
  x,
  y
){

  ctx.fillStyle="#7f1d1d"

  for(let i=0;i<12;i++){

    ctx.beginPath()

    ctx.arc(
      x+(Math.random()*60-30),
      y+(Math.random()*60-30),
      5+Math.random()*10,
      0,
      7
    )

    ctx.fill()
  }
}
