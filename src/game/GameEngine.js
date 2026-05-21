import Phaser from "phaser"

export class MainScene extends Phaser.Scene {

  constructor() {
    super("main")

    this.hp = 100
    this.maxHp = 100
    this.wave = 1
    this.score = 0
    this.weapon = "RIFLE"
    this.ammo = 60
    this.zone = "CITY"
    this.bossActive = false
  }

  preload() {
    this.load.image("player","https://labs.phaser.io/assets/sprites/phaser-dude.png")
    this.load.image("john","https://labs.phaser.io/assets/sprites/mushroom2.png")
    this.load.image("zombie","https://labs.phaser.io/assets/sprites/robot.png")
    this.load.image("boss","https://labs.phaser.io/assets/sprites/ufo.png")
    this.load.image("bullet","https://labs.phaser.io/assets/sprites/bullets/bullet11.png")
    this.load.image("medkit","https://labs.phaser.io/assets/sprites/healthbar.png")
    this.load.image("crate","https://labs.phaser.io/assets/sprites/crate.png")
  }

  create() {

    this.createEnvironment()
    this.createPlayer()
    this.createGroups()
    this.spawnWave()
    this.spawnPickups()
    this.createCombat()
    this.createUI()
    this.createTouchControls()
    this.showBanner("CITY BREACH","Escort John through the infected zone")

    this.time.addEvent({
      delay:45000,
      callback:()=>{
        this.activateBossFight()
      },
      loop:false
    })
  }

  createEnvironment() {

    this.cameras.main.setBackgroundColor("#050816")

    const bg = this.add.graphics()

    bg.fillStyle(0x111827)
    bg.fillRect(0,0,window.innerWidth,window.innerHeight)

    bg.fillStyle(0x1f2937)

    for(let i=0;i<14;i++){

      bg.fillRoundedRect(
        Phaser.Math.Between(-80,window.innerWidth),
        Phaser.Math.Between(40,window.innerHeight-200),
        Phaser.Math.Between(120,280),
        Phaser.Math.Between(120,280),
        10
      )
    }

    bg.fillStyle(0x0f172a)

    for(let y=90;y<window.innerHeight;y+=170){
      bg.fillRect(0,y,window.innerWidth,32)
    }

    bg.fillStyle(0x475569)

    for(let x=50;x<window.innerWidth;x+=120){
      bg.fillRect(x,102,60,8)
      bg.fillRect(x,272,60,8)
      bg.fillRect(x,442,60,8)
    }

    this.fog = this.add.rectangle(
      window.innerWidth/2,
      window.innerHeight/2,
      window.innerWidth,
      window.innerHeight,
      0xffffff,
      .03
    )

    this.tweens.add({
      targets:this.fog,
      alpha:.09,
      duration:2200,
      yoyo:true,
      repeat:-1
    })

    for(let i=0;i<7;i++){

      const fire = this.add.circle(
        Phaser.Math.Between(50,window.innerWidth-50),
        Phaser.Math.Between(80,window.innerHeight-160),
        12,
        0xf97316,
        .85
      )

      this.tweens.add({
        targets:fire,
        scale:2,
        alpha:.1,
        duration:650,
        yoyo:true,
        repeat:-1
      })
    }
  }

  createPlayer() {

    this.player = this.physics.add.sprite(
      window.innerWidth/2,
      window.innerHeight/2,
      "player"
    )

    this.player.setScale(1.4)

    this.john = this.physics.add.sprite(
      window.innerWidth/2 + 90,
      window.innerHeight/2 + 90,
      "john"
    )

    this.john.setTint(0x22c55e)

    this.playerShadow = this.add.ellipse(
      this.player.x,
      this.player.y + 18,
      40,
      12,
      0x000000,
      .35
    )

    this.johnShadow = this.add.ellipse(
      this.john.x,
      this.john.y + 18,
      36,
      10,
      0x000000,
      .35
    )
  }

  createGroups() {
    this.zombies = this.physics.add.group()
    this.bullets = this.physics.add.group()
    this.medkits = this.physics.add.group()
    this.crates = this.physics.add.group()
  }

  spawnPickups() {

    this.medkits.create(
      Phaser.Math.Between(80,window.innerWidth-80),
      Phaser.Math.Between(120,window.innerHeight-180),
      "medkit"
    )

    this.crates.create(
      Phaser.Math.Between(80,window.innerWidth-80),
      Phaser.Math.Between(120,window.innerHeight-180),
      "crate"
    )
  }

  spawnWave() {

    for(let i=0;i<12 + this.wave*2;i++){

      const z = this.zombies.create(
        Phaser.Math.Between(0,window.innerWidth),
        Phaser.Math.Between(0,window.innerHeight),
        "zombie"
      )

      z.hp = 50 + this.wave * 10

      z.speed = Phaser.Math.Between(
        45,
        95 + this.wave * 5
      )

      z.setScale(
        Phaser.Math.FloatBetween(.9,1.2)
      )

      z.setTint(0xef4444)
    }
  }

  activateBossFight() {

    if(this.bossActive) return

    this.bossActive = true

    this.showBanner(
      "BOSS INCOMING",
      "Mutant Titan entering the city"
    )

    this.ping("OPS ALERT: boss signature detected")

    this.boss = this.physics.add.sprite(
      window.innerWidth/2,
      120,
      "boss"
    )

    this.boss.hp = 1200

    this.boss.setScale(3)

    this.boss.setTint(0xa855f7)

    this.bossBarBack = this.add.rectangle(
      window.innerWidth/2,
      34,
      window.innerWidth - 90,
      24,
      0x450a0a
    )

    this.bossBar = this.add.rectangle(
      window.innerWidth/2,
      34,
      window.innerWidth - 90,
      24,
      0xef4444
    )

    this.bossLabel = this.add.text(
      window.innerWidth/2,
      18,
      "MUTANT TITAN",
      {
        font:"18px Arial",
        fill:"#ffffff"
      }
    ).setOrigin(.5)
  }

  createCombat() {

    this.physics.add.overlap(
      this.bullets,
      this.zombies,
      (bullet,zombie)=>{

        bullet.destroy()

        zombie.hp -= this.weapon === "BAZOOKA"
          ? 80
          : 30

        this.damage(
          zombie.x,
          zombie.y,
          "CRIT",
          "#facc15"
        )

        zombie.setTint(0xffffff)

        this.time.delayedCall(
          80,
          ()=> zombie.setTint(0xef4444)
        )

        if(zombie.hp <= 0){

          this.explosion(
            zombie.x,
            zombie.y
          )

          zombie.destroy()

          this.score++

          if(this.score % 8 === 0){

            this.wave++

            this.spawnWave()

            this.spawnPickups()

            this.showBanner(
              "WAVE " + this.wave,
              "More infected entering zone"
            )
          }
        }
      }
    )

    this.physics.add.overlap(
      this.bullets,
      ()=> this.bossActive ? this.boss : null,
      (bullet,boss)=>{

        bullet.destroy()

        boss.hp -= this.weapon === "BAZOOKA"
          ? 60
          : 15

        this.damage(
          boss.x,
          boss.y,
          "BOSS HIT",
          "#ef4444"
        )

        this.explosion(
          boss.x,
          boss.y
        )

        if(boss.hp <= 0){

          this.showBanner(
            "BOSS DEFEATED",
            "City zone secured"
          )

          boss.destroy()

          this.bossBar.destroy()
          this.bossBarBack.destroy()
          this.bossLabel.destroy()

          this.bossActive = false
        }
      }
    )

    this.physics.add.overlap(
      this.player,
      this.zombies,
      (_,zombie)=>{

        zombie.destroy()

        this.hp -= 4

        this.cameras.main.shake(120,.008)

        this.damage(
          this.player.x,
          this.player.y - 30,
          "-4 HP",
          "#ef4444"
        )
      }
    )

    this.physics.add.overlap(
      this.player,
      this.medkits,
      (_,medkit)=>{

        medkit.destroy()

        this.hp = Math.min(
          this.maxHp,
          this.hp + 30
        )

        this.damage(
          this.player.x,
          this.player.y - 40,
          "+30 HP",
          "#22c55e"
        )
      }
    )

    this.physics.add.overlap(
      this.player,
      this.crates,
      (_,crate)=>{

        crate.destroy()

        this.weapon = "BAZOOKA"

        this.ammo = 12

        this.damage(
          this.player.x,
          this.player.y - 40,
          "BAZOOKA READY",
          "#facc15"
        )

        this.ping(
          "OPS PING: heavy weapon online"
        )
      }
    )

    this.input.on("pointerdown",(p)=>{

      if(p.y > window.innerHeight - 150) return
      if(this.ammo <= 0) return

      this.ammo--

      const bullet = this.bullets.create(
        this.player.x,
        this.player.y,
        "bullet"
      )

      bullet.setScale(
        this.weapon === "BAZOOKA"
          ? 2
          : 1.2
      )

      this.physics.moveTo(
        bullet,
        p.x,
        p.y,
        this.weapon === "BAZOOKA"
          ? 520
          : 920
      )

      this.muzzle(
        this.player.x,
        this.player.y
      )
    })
  }

  createUI() {

    this.panel = this.add.rectangle(
      12,
      12,
      290,
      138,
      0x020617,
      .82
    ).setOrigin(0,0)
     .setStrokeStyle(2,0x7c3aed)

    this.hpBack = this.add.rectangle(
      30,
      35,
      200,
      18,
      0x450a0a
    ).setOrigin(0,.5)

    this.hpBar = this.add.rectangle(
      30,
      35,
      200,
      18,
      0x22c55e
    ).setOrigin(0,.5)

    this.hpText = this.add.text(
      30,
      52,
      "HP 100/100",
      {
        font:"16px Arial",
        fill:"#ffffff"
      }
    )

    this.waveText = this.add.text(
      30,
      76,
      "WAVE 1",
      {
        font:"18px Arial",
        fill:"#c4b5fd"
      }
    )

    this.weaponText = this.add.text(
      30,
      102,
      "RIFLE | 60",
      {
        font:"17px Arial",
        fill:"#facc15"
      }
    )

    this.zoneText = this.add.text(
      window.innerWidth - 120,
      18,
      "CITY",
      {
        font:"18px Arial",
        fill:"#38bdf8",
        backgroundColor:"#00000099",
        padding:{x:10,y:6}
      }
    )

    this.minimap = this.add.rectangle(
      window.innerWidth - 84,
      82,
      92,
      92,
      0x020617,
      .75
    ).setStrokeStyle(2,0x38bdf8)
  }

  createTouchControls() {

    this.joystick = {
      up:false,
      down:false,
      left:false,
      right:false
    }

    this.base = this.add.circle(
      78,
      window.innerHeight - 82,
      58,
      0x111827,
      .82
    ).setStrokeStyle(3,0x7c3aed)

    this.knob = this.add.circle(
      78,
      window.innerHeight - 82,
      24,
      0x7c3aed,
      .95
    )

    this.ops = this.add.circle(
      window.innerWidth - 78,
      window.innerHeight - 82,
      58,
      0x7c2d12,
      .92
    ).setStrokeStyle(3,0xf97316)

    this.add.text(
      window.innerWidth - 106,
      window.innerHeight - 94,
      "FIRE\nOPS",
      {
        font:"16px Arial",
        fill:"#ffffff",
        align:"center"
      }
    )

    this.input.on("pointermove",(p)=>{

      if(!p.isDown) return

      if(
        p.x < window.innerWidth * .45 &&
        p.y > window.innerHeight * .55
      ){

        const dx = p.x - 78
        const dy = p.y - (window.innerHeight - 82)

        this.joystick.left = dx < -18
        this.joystick.right = dx > 18
        this.joystick.up = dy < -18
        this.joystick.down = dy > 18

        this.knob.x = Phaser.Math.Clamp(
          p.x,
          35,
          121
        )

        this.knob.y = Phaser.Math.Clamp(
          p.y,
          window.innerHeight - 125,
          window.innerHeight - 39
        )
      }
    })

    this.input.on("pointerup",()=>{

      this.joystick = {
        up:false,
        down:false,
        left:false,
        right:false
      }

      this.knob.x = 78
      this.knob.y = window.innerHeight - 82
    })
  }

  showBanner(title,subtitle) {

    const box = this.add.rectangle(
      window.innerWidth/2,
      85,
      window.innerWidth - 50,
      74,
      0x000000,
      .8
    ).setStrokeStyle(2,0xa855f7)

    const t = this.add.text(
      window.innerWidth/2,
      66,
      title,
      {
        font:"26px Arial",
        fill:"#ffffff"
      }
    ).setOrigin(.5)

    const s = this.add.text(
      window.innerWidth/2,
      96,
      subtitle,
      {
        font:"15px Arial",
        fill:"#c4b5fd"
      }
    ).setOrigin(.5)

    this.tweens.add({
      targets:[box,t,s],
      alpha:0,
      delay:1800,
      duration:700,
      onComplete:()=>{
        box.destroy()
        t.destroy()
        s.destroy()
      }
    })
  }

  ping(msg) {

    const t = this.add.text(
      window.innerWidth/2,
      window.innerHeight - 165,
      msg,
      {
        font:"18px Arial",
        fill:"#facc15",
        backgroundColor:"#000000bb",
        padding:{x:12,y:8}
      }
    ).setOrigin(.5)

    this.tweens.add({
      targets:t,
      y:t.y - 30,
      alpha:0,
      delay:900,
      duration:700,
      onComplete:()=> t.destroy()
    })
  }

  muzzle(x,y) {

    const m = this.add.circle(
      x,
      y,
      10,
      0xfacc15,
      .9
    )

    this.tweens.add({
      targets:m,
      scale:2.2,
      alpha:0,
      duration:150,
      onComplete:()=> m.destroy()
    })
  }

  explosion(x,y) {

    const e = this.add.circle(
      x,
      y,
      18,
      0xf97316,
      .9
    )

    this.cameras.main.shake(120,.008)

    this.tweens.add({
      targets:e,
      scale:5,
      alpha:0,
      duration:450,
      onComplete:()=> e.destroy()
    })
  }

  damage(x,y,msg,color) {

    const t = this.add.text(
      x,
      y,
      msg,
      {
        font:"22px Arial",
        fill:color,
        stroke:"#000000",
        strokeThickness:4
      }
    ).setOrigin(.5)

    this.tweens.add({
      targets:t,
      y:y - 45,
      alpha:0,
      duration:950,
      onComplete:()=> t.destroy()
    })
  }

  update() {

    const speed = 245

    this.player.setVelocity(0)

    if(this.joystick.left)
      this.player.setVelocityX(-speed)

    if(this.joystick.right)
      this.player.setVelocityX(speed)

    if(this.joystick.up)
      this.player.setVelocityY(-speed)

    if(this.joystick.down)
      this.player.setVelocityY(speed)

    this.zombies.children.iterate((z)=>{

      if(!z) return

      this.physics.moveToObject(
        z,
        this.player,
        z.speed
      )
    })

    if(this.bossActive && this.boss){

      this.physics.moveToObject(
        this.boss,
        this.player,
        70
      )

      this.bossBar.width =
        ((window.innerWidth - 90) *
        (this.boss.hp / 1200))
    }

    this.physics.moveToObject(
      this.john,
      this.player,
      150
    )

    this.playerShadow.x = this.player.x
    this.playerShadow.y = this.player.y + 18

    this.john
this.johnShadow.x = this.john.x
this.johnShadow.y = this.john.y + 18

this.hpBar.width =
  Math.max(
    0,
    200 * (this.hp / this.maxHp)
  )

this.hpText.setText(
  "HP " + Math.max(0,this.hp) + "/100"
)

this.waveText.setText(
  "WAVE " + this.wave +
  " | KILLS " + this.score
)

this.weaponText.setText(
  this.weapon +
  " | AMMO " + this.ammo
)

if(this.hp <= 0){

  this.showBanner(
    "MISSION FAILED",
    "John was overwhelmed"
  )

  this.scene.pause()
}
}
}

export const config = {
type: Phaser.AUTO,
width: window.innerWidth,
height: window.innerHeight,

physics:{
default:"arcade",
arcade:{
debug:false
}
},

scene:MainScene
}

export default config
