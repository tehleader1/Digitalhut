export const UnrealBridge = {
  engine: "Unreal Engine 5.7+",
  renderer: "Vulkan Mobile Renderer",
  api: "DigitalHut Unreal Mobile API",

  gameplay: {
    escortMode: true,
    multiplayer: true,
    bossFights: true,
    johnAI: true,
    pickups: true
  },

  graphics: {
    lumen: true,
    niagara: true,
    fog: true,
    particles: true,
    dynamicLighting: true
  },

  maps: [
    "city",
    "farm",
    "ship",
    "boss arena"
  ],

  damageSystem: {
    burn: true,
    poison: true,
    crit: true,
    hurl: true,
    bazooka: true
  }
}
