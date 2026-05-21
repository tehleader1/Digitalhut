export class EncounterDirector{

  constructor(){

    this.event="HIGHWAY ENTRY"

    this.timer=0
  }

  update(section){

    this.timer++

    if(section===1){

      this.event=
        "ABANDONED HIGHWAY"
    }

    if(section===2){

      this.event=
        "TRAFFIC JAM TRAP"
    }

    if(section===3){

      this.event=
        "SPITTER INFECTED DETECTED"
    }

    if(section===4){

      this.event=
        "LICKER AMBUSH"
    }

    if(section===5){

      this.event=
        "CITY DESCENT"
    }
  }

  render(ctx){

    ctx.fillStyle="#f97316"

    ctx.font="18px Arial"

    ctx.fillText(
      this.event,
      30,
      250
    )
  }
}
