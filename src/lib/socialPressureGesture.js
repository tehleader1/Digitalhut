export function settleSocialPressureGesture({cancelled = false, moved = false, startProgress = 0, progress = startProgress, openThreshold = .42} = {}){
  if(cancelled) return {open:Boolean(startProgress), suppressNextClick:false}
  if(!moved) return {open:Boolean(startProgress), suppressNextClick:false}
  return {open:progress >= openThreshold, suppressNextClick:true}
}

export function applySocialPressureClick({open = false, suppressNextClick = false} = {}){
  return suppressNextClick ? {open, suppressNextClick:false} : {open:!open, suppressNextClick:false}
}
