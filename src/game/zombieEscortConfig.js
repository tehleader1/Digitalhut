export const GAME_CONFIG = {
  title: "DigitalHut Zombie Escort",
  version: "0.1 Vertical Slice",

  identityOptions: [
    "male",
    "female",
    "protoss-zerg"
  ],

  abilities: [
    {
      id: "melee_shout",
      name: "Melee Shout",
      description:
        "Pushes enemies back and buffs nearby allies."
    },

    {
      id: "fireball",
      name: "Fireball",
      description:
        "Rapid-fire burn projectile with splash damage."
    },

    {
      id: "rodeo_rope",
      name: "Rodeo Rope",
      description:
        "Grab a zombie and swing it into nearby enemies."
    },

    {
      id: "poison_drip",
      name: "Poison Drip",
      description:
        "Fog DOT spell that slowly kills grouped enemies."
    }
  ],

  waves: [
    {
      id: 1,
      title: "Highway Entrance",
      duration: 90,
      enemies: ["walker", "runner"],
      environment: "forest-road"
    },

    {
      id: 2,
      title: "Collapsed Street",
      duration: 120,
      enemies: ["walker", "runner", "brute"],
      environment: "small-town"
    },

    {
      id: 3,
      title: "Northern Barrier Collapse",
      duration: 180,
      enemies: ["runner", "crawler", "brute"],
      environment: "city-defense",

      ally: {
        name: "John",
        abilities: [
          "heal",
          "rapid_fire",
          "barrier"
        ]
      },

      story:
        "John survived an apartment ambush. His wife did not."
    }
  ],

  rewards: {
    healthPack: true,
    rapidFire: true,
    bazooka: {
      unlockWave: 5
    }
  }
};
