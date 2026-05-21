export const GAME = {
  title: "DigitalHut Zombie Escort Adventure",

  core: {
    movement: "auto-forward escort progression",
    combatZone: "free movement inside active radius",
    multiplayer: true,
    mobile: true
  },

  maps: [
    {
      id: 1,
      name: "City Outskirts",
      type: "city",
      boss: false,
      freeTimePop: true
    },
    {
      id: 2,
      name: "Dead Corn Farm",
      type: "farm",
      boss: false,
      freeTimePop: true
    },
    {
      id: 3,
      name: "Infected Cargo Ship",
      type: "ship",
      boss: false,
      freeTimePop: false
    },
    {
      id: 4,
      name: "Mutant King Arena",
      type: "boss",
      boss: true,
      freeTimePop: false
    }
  ],

  abilities: [
    {
      name: "Melee Shout",
      effect: "buff pulse knockback"
    },
    {
      name: "Fireball",
      effect: "burn splash damage"
    },
    {
      name: "Rodeo Rope",
      effect: "grab hurl spin"
    },
    {
      name: "Poison Fog",
      effect: "damage over time"
    }
  ],

  damageSystem: {
    crit: true,
    poison: true,
    burn: true,
    hurl: true,
    bazooka: true
  },

  buffs: {
    fireMonster: "burn buff",
    poisonMonster: "poison buff",
    bruteMonster: "hurl buff",
    fastMonster: "crit speed buff"
  },

  pickups: [
    "health pack",
    "rapid fire",
    "bazooka",
    "armor plate",
    "crit boost"
  ],

  multiplayerLobby: {
    createSession: true,
    joinSession: true,
    playerColors: [
      "red",
      "blue",
      "green",
      "yellow",
      "purple"
    ]
  },

  cutscenes: {
    johnMovement: true,
    progressionScenes: true,
    mapTransitionScenes: true
  },

  ui: {
    pingAlerts: true,
    bossWarnings: true,
    damageNumbers: true,
    mobileFriendly: true
  }
}
