import {LEVEL1}
from "../levels/level1"

export class SectionDirector{

  constructor(){

    this.index=0

    this.timer=0

    this.section=LEVEL1[0]
  }

  update(){

    this.timer++

    if(this.timer >
      this.section.duration){

      this.index++

      if(this.index>=LEVEL1.length){

        this.index=LEVEL1.length-1
      }

      this.section=LEVEL1[this.index]

      this.timer=0
    }
  }

  render(ctx){

    ctx.fillStyle="#38bdf8"

    ctx.font="20px Arial"

    ctx.fillText(
      this.section.name,
      30,
      160
    )

    ctx.fillStyle="#ffffff"

    ctx.font="16px Arial"

    ctx.fillText(
      this.section.dialogue,
      30,
      190
    )
  }
}
