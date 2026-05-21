const survivorImg = new Image()

survivorImg.src =
"/assets/dojj/imports/survivors/Top_Down_Survivor/feet/run/survivor-run_0.png"

export function renderSurvivor(
  ctx,
  player
){

  if(survivorImg.complete){

    ctx.drawImage(
      survivorImg,
      player.x-32,
      player.y-32,
      64,
      64
    )
  }

  else{

    ctx.fillStyle="#7c3aed"

    ctx.fillRect(
      player.x-18,
      player.y-18,
      36,
      36
    )
  }
}
