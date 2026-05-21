import { Howl, Howler } from "howler"

Howler.volume(0.85)

export const SFX = {
  ping: new Howl({
    src: ["/audio/ui/ping.mp3"],
    volume: 0.7
  }),

  gunshot: new Howl({
    src: ["/audio/guns/rifle.mp3"],
    volume: 0.8
  }),

  bazooka: new Howl({
    src: ["/audio/guns/bazooka.mp3"],
    volume: 1
  }),

  zombieDeath: new Howl({
    src: ["/audio/zombies/death.mp3"],
    volume: 0.9
  }),

  zombieRush: new Howl({
    src: ["/audio/zombies/rush.mp3"],
    volume: 0.7
  }),

  fireball: new Howl({
    src: ["/audio/ui/fireball.mp3"],
    volume: 0.85
  }),

  poison: new Howl({
    src: ["/audio/ui/poison.mp3"],
    volume: 0.75
  }),

  rope: new Howl({
    src: ["/audio/ui/rope.mp3"],
    volume: 0.75
  }),

  crit: new Howl({
    src: ["/audio/ui/crit.mp3"],
    volume: 1
  }),

  pickup: new Howl({
    src: ["/audio/ui/pickup.mp3"],
    volume: 0.7
  }),

  bossWarning: new Howl({
    src: ["/audio/boss/warning.mp3"],
    volume: 1
  })
}

export const MUSIC = {
  lobby: new Howl({
    src: ["/audio/music/lobby.mp3"],
    loop: true,
    volume: 0.45
  }),

  city: new Howl({
    src: ["/audio/music/city.mp3"],
    loop: true,
    volume: 0.5
  }),

  farm: new Howl({
    src: ["/audio/music/farm.mp3"],
    loop: true,
    volume: 0.5
  }),

  ship: new Howl({
    src: ["/audio/music/ship.mp3"],
    loop: true,
    volume: 0.55
  }),

  boss: new Howl({
    src: ["/audio/music/boss.mp3"],
    loop: true,
    volume: 0.7
  })
}

export const VOICE = {
  johnIntro: new Howl({
    src: ["/audio/voice/john_intro.mp3"],
    volume: 1
  }),

  johnHelp: new Howl({
    src: ["/audio/voice/john_help.mp3"],
    volume: 1
  }),

  missionAlert: new Howl({
    src: ["/audio/voice/mission_alert.mp3"],
    volume: 1
  })
}
