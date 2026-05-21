let scroll=0

export function renderSkyline(ctx,w){

  scroll+=0.15

  for(let i=0;i<14;i++){

    ctx.fillStyle="rgba(15,23,42,0.7)"

    ctx.fillRect(
      ((i*180)+(scroll))%w,
      40+(i%4)*40,
      140,
      260
    )
  }
}
