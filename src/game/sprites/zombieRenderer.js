const zombieImg = new Image()

zombieImg.src =
"/assets/dojj/imports/tds_zombie/zombie_idle.png"

export function renderZombie(
  ctx,
  zombie
){

  if(zombieImg.complete){

    ctx.drawImage(
      zombieImg,
      zombie.x-28,
      zombie.y-28,
      56,
      56
    )
  }

  else{

    ctx.fillStyle=
      zombie.type==="licker"
        ? "#22c55e"
        : "#ef4444"

    ctx.beginPath()

    ctx.arc(
      zombie.x,
      zombie.y,
      18,
      0,
      7
    )

    ctx.fill()
  }
}
