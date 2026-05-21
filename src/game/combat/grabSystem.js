export class GrabSystem{

  constructor(){

    this.active=false

    this.target=null

    this.timer=0
  }

  grab(enemy){

    this.active=true

    this.target=enemy

    this.timer=0
  }

  update(player){

    if(!this.active)return

    this.timer++

    if(this.target){

      this.target.x=player.x+20

      this.target.y=player.y
    }

    if(
      this.target &&
      this.target.type==="licker"
    ){

      if(this.timer>120){

        player.hp -= 0.2
      }
    }
  }

  release(){

    this.active=false

    this.target=null

    this.timer=0
  }

  render(ctx){

    if(!this.active)return

    ctx.fillStyle="#facc15"

    ctx.font="18px Arial"

    ctx.fillText(
      "GRAB ACTIVE",
      30,
      280
    )
  }
}
