export function startLoop(update){

  let running=true

  function frame(){

    if(!running)return

    update()

    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)

  return ()=>{
    running=false
  }
}
