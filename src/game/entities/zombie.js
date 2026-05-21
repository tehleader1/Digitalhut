import {renderZombie}
from "../sprites/zombieRenderer"

export class Zombie{

  constructor(x,y,type="walker"){

    this.x=x

    this.y=y

    this.type=type

    this.speed=
      type==="licker"
        ? 1.8
        : 1.2

    this.hp=100
  }

  update(player){

    const dx=
      player.x-this.x

    const dy=
      player.y-this.y

    const d=
      Math.hypot(dx,dy)||1

    this.x +=
      dx/d*this.speed

    this.y +=
      dy/d*this.speed
  }

  render(ctx){

    renderZombie(
      ctx,
      this
    )
  }
}
