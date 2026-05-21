import {renderSurvivor}
from "../sprites/survivorRenderer"

export class Player{

  constructor(){

    this.x=
      window.innerWidth/2

    this.y=
      window.innerHeight*.72

    this.speed=5

    this.hp=100
  }

  update(input){

    this.x +=
      input.dx*this.speed

    this.y +=
      input.dy*this.speed
  }

  render(ctx){

    renderSurvivor(
      ctx,
      this
    )
  }
}
