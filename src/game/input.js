export const input = {

  dx:0,
  dy:0
}

window.addEventListener("touchmove",e=>{

  const t = e.touches[0]

  if(!t)return

  input.dx =
    (t.clientX-window.innerWidth/2)/200

  input.dy =
    (t.clientY-window.innerHeight*0.72)/200
})
