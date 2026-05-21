import {startLoop}
from "./loop"

import {renderWorld}
from "./world/world"

import {renderSkyline}
from "./render/skyline"

import {renderAtmosphere}
from "./fx/atmosphere"

import {Player}
from "./entities/player"

import {Zombie}
from "./entities/zombie"

import {input}
from "./input"

import {SectionDirector}
from "./cutscenes/sectionDirector"

import {TraversalDirector}
from "./cutscenes/traversalDirector"

import {EncounterDirector}
from "./cutscenes/encounterDirector"

import {FilmTransition}
from "./transitions/filmTransition"

import {renderFire}
from "./hazards/fire"

export function bootEngine(canvas){

  const ctx=canvas.getContext("2d")

  let w=canvas.width=window.innerWidth
  let h=canvas.height=window.innerHeight

  const player=new Player()

  const director=
    new SectionDirector()

  const traversal=
    new TraversalDirector()

  const encounters=
    new EncounterDirector()

  const transition=
    new FilmTransition()

  const zombies=[]

  for(let i=0;i<14;i++){

    zombies.push(
      new Zombie(
        Math.random()*w,
        Math.random()*h*.5
      )
    )
  }

  window.addEventListener(
    "resize",
    ()=>{

      w=canvas.width=
        window.innerWidth

      h=canvas.height=
        window.innerHeight
    }
  )

  startLoop(()=>{

    traversal.update(
      zombies.length
    )

    renderWorld(
      ctx,
      w,
      h,
      director.section.section,
      traversal.scroll
    )

    renderSkyline(ctx,w)

    renderAtmosphere(ctx,w,h)

    renderFire(
      ctx,
      w*.72,
      h*.28
    )

    director.update()

    encounters.update(
      director.section.section
    )

    player.update(input)

    zombies.forEach(z=>{

      z.update(player)

      z.render(ctx)
    })

    player.render(ctx)

    director.render(ctx)

    traversal.render(ctx)

    encounters.render(ctx)

    transition.update()

    transition.render(ctx,w,h)
  })
}
