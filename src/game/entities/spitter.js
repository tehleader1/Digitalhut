export class Spitter{

  constructor(x,y){

    this.x=x
    this.y=y

    this.speed=0.8

    this.hp=120
  }

  update(player){

    const dx=player.x-this.x
    const dy=player.y-this.y

    const d=Math.hypot(dx,dy)||1

    this.x += dx/d*this.speed
    this.y += dy/d*this.speed
  }

  render(ctx){

    ctx.fillStyle="#22c55e"

    ctx.beginPath()

    ctx.arc(this.x,this.y,22,0,7)

    ctx.fill()
  }
}
