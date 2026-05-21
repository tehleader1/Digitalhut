export function renderFire(
  ctx,
  x,
  y
){

  ctx.fillStyle=
    "rgba(249,115,22,0.55)"

  ctx.beginPath()

  ctx.arc(
    x,
    y,
    50,
    0,
    7
  )

  ctx.fill()
}
