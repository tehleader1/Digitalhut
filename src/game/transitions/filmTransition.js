export class FilmTransition{

  constructor(){

    this.active=true

    this.alpha=1

    this.timer=0
  }

  update(){

    this.timer++

    if(this.timer>240){

      this.alpha -= 0.01

      if(this.alpha<0){

        this.alpha=0

        this.active=false
      }
    }
  }

  render(ctx,w,h){

    if(!this.active)return

    ctx.fillStyle=`rgba(0,0,0,${this.alpha})`

    ctx.fillRect(0,0,w,h)

    ctx.fillStyle="white"

    ctx.font="38px Arial"

    ctx.fillText(
      "DIGITALHUT SURVIVAL",
      w/2-220,
      h/2-20
    )

    ctx.font="20px Arial"

    ctx.fillText(
      "Transitioning from cinematic feed...",
      w/2-190,
      h/2+30
    )
  }
}
