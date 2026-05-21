export class TraversalDirector{

  constructor(){

    this.scroll=0

    this.speed=0.6

    this.locked=false
  }

  update(enemyCount){

    if(enemyCount>18){

      this.locked=true

      this.speed=0
    }

    else{

      this.locked=false

      this.speed=0.6
    }

    this.scroll += this.speed
  }

  render(ctx){

    ctx.fillStyle="#facc15"

    ctx.font="16px Arial"

    ctx.fillText(
      this.locked
        ? "HORDE BLOCKING ROUTE"
        : "ADVANCING TOWARD CITY",
      30,
      220
    )
  }
}
