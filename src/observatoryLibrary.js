export const observatoryLibrary = {
  "north america": [
    "/glbs/canada.glb",
    "/glbs/florida-house.glb",
    "/glbs/north-carolina-house.glb"
  ],

  "asia": [
    "/glbs/japan.glb",
    "/glbs/thai-house.glb",
    "/glbs/india.glb"
  ],

  "africa": [
    "/glbs/africa-house.glb",
    "/glbs/bamboo-house.glb"
  ],

  "business": [
    "/glbs/office.glb",
    "/glbs/lobby.glb"
  ]
};

export function getRandomObservatory(region) {

  const key = region.toLowerCase();

  const items = observatoryLibrary[key];

  if (!items?.length) {
    return null;
  }

  return items[
    Math.floor(Math.random() * items.length)
  ];
}
