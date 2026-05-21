import {generateSection}
from "../tilemap/generator"

export function renderWorld(
  ctx,
  w,
  h,
  section,
  scroll
){

  ctx.fillStyle="#06111f"

  ctx.fillRect(0,0,w,h)

  for(let y=-200;y<h+200;y+=180){

    ctx.fillStyle="rgba(71,85,105,.72)"

    ctx.fillRect(
      0,
      y+(scroll%180),
      w,
      24
    )

    ctx.fillStyle="rgba(148,163,184,.65)"

    for(let x=0;x<w;x+=120){

      ctx.fillRect(
        x,
        y+10+(scroll%180),
        58,
        4
      )
    }
  }

  const props=
    generateSection(section,w,h)

  props.forEach(p=>{

    const py =
      p.y + (scroll%180)

    if(p.type==="car"){

      ctx.fillStyle="#475569"

      ctx.fillRect(
        p.x,
        py,
        80,
        40
      )
    }

    if(p.type==="wreck"){

      ctx.fillStyle="#7f1d1d"

      ctx.fillRect(
        p.x,
        py,
        90,
        50
      )
    }

    if(p.type==="building"){

      ctx.fillStyle="#111827"

      ctx.fillRect(
        p.x,
        py,
        120,
        180
      )
    }

    if(p.type==="cliff"){

      ctx.fillStyle="#1e293b"

      ctx.fillRect(
        p.x,
        py,
        220,
        120
      )
    }
  })
}
