export function startComposite(video,canvas){

  const ctx=canvas.getContext("2d")
  let tick=0

  function frame(){
    tick++

    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.drawImage(video,0,0,canvas.width,canvas.height)

    ctx.fillStyle="rgba(0,8,20,.34)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    const selfX=canvas.width*.22+Math.sin(tick*.025)*18
    const selfY=canvas.height*.42+Math.cos(tick*.02)*12

    // moving self-lock scanner
    for(let i=0;i<10;i++){
      ctx.strokeStyle=`rgba(56,189,248,${.26-i*.022})`
      ctx.lineWidth=2
      ctx.beginPath()
      ctx.ellipse(
        selfX,
        selfY,
        55+i*15+Math.sin(tick*.05+i)*7,
        130+i*18,
        Math.sin(tick*.018)*.18,
        0,
        Math.PI*2
      )
      ctx.stroke()
    }

    // ghost-body duplicates
    for(let g=0;g<5;g++){
      ctx.globalAlpha=.07
      ctx.filter=`blur(${g+1}px)`
      ctx.drawImage(
        video,
        Math.sin(tick*.035+g)*18-g*4,
        Math.cos(tick*.026+g)*12,
        canvas.width,
        canvas.height
      )
    }
    ctx.globalAlpha=1
    ctx.filter="none"

    // procedural environment wireframe
    ctx.strokeStyle="rgba(124,58,237,.24)"
    ctx.lineWidth=1
    for(let i=0;i<16;i++){
      ctx.beginPath()
      ctx.moveTo(canvas.width*.42+i*26+Math.sin(tick*.02+i)*12,0)
      ctx.lineTo(canvas.width*.20+i*18,canvas.height)
      ctx.stroke()
    }

    // scan lines
    ctx.strokeStyle="rgba(56,189,248,.18)"
    for(let y=(tick*4)%42;y<canvas.height;y+=42){
      ctx.beginPath()
      ctx.moveTo(0,y)
      ctx.lineTo(canvas.width,y)
      ctx.stroke()
    }

    // infected silhouettes crossing background
    for(let i=0;i<7;i++){
      const x=canvas.width*.55+i*85+Math.sin(tick*.03+i)*35
      const y=canvas.height*.25+i*58+Math.cos(tick*.022+i)*18

      ctx.fillStyle="rgba(0,0,0,.62)"
      ctx.beginPath()
      ctx.arc(x,y,16,0,7)
      ctx.fill()
      ctx.fillRect(x-8,y+16,16,48)

      ctx.fillStyle="rgba(255,0,0,.16)"
      ctx.beginPath()
      ctx.arc(x-5,y-2,3,0,7)
      ctx.arc(x+5,y-2,3,0,7)
      ctx.fill()
    }

    // helicopter/searchlight sweep
    const sweep=(Math.sin(tick*.018)+1)/2
    const sx=canvas.width*sweep
    const grad=ctx.createRadialGradient(sx,0,20,sx,canvas.height*.45,canvas.width*.55)
    grad.addColorStop(0,"rgba(255,255,255,.16)")
    grad.addColorStop(.45,"rgba(56,189,248,.05)")
    grad.addColorStop(1,"rgba(0,0,0,0)")
    ctx.fillStyle=grad
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // ash and dust
    ctx.fillStyle="rgba(255,255,255,.055)"
    for(let i=0;i<85;i++){
      ctx.beginPath()
      ctx.arc(
        ((i*53)+(tick*.75))%canvas.width,
        (i*79+tick*.45)%canvas.height,
        1+Math.sin(tick*.02+i)*1.6,
        0,
        7
      )
      ctx.fill()
    }

    // emergency red pulse
    if(tick%95<30){
      ctx.fillStyle="rgba(255,0,0,.055)"
      ctx.fillRect(0,0,canvas.width,canvas.height)
    }

    // cinematic bars + Dojj UI
    ctx.fillStyle="rgba(0,0,0,.78)"
    ctx.fillRect(0,0,canvas.width,64)
    ctx.fillRect(0,canvas.height-64,canvas.width,64)

    ctx.fillStyle="#38bdf8"
    ctx.font="22px Arial"
    ctx.fillText("DOJJ SELF-CGI SCAN",24,98)

    ctx.fillStyle="#fff"
    ctx.font="16px Arial"
    ctx.fillText("Body lock unstable. Infected movement detected nearby.",24,128)

    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
