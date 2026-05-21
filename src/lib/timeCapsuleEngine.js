import { v4 as uuidv4 } from "uuid";

export async function generateTimeCapsule({
  wallet,
  nft,
  location,
  houseStyle,
}) {
  const capsuleId = uuidv4();

  const capsule = {
    capsuleId,
    createdAt: new Date().toISOString(),
    wallet,
    nft,
    location,
    houseStyle,

    routing: {
      continentRouting: true,
      climateRouting: true,
      marketRouting: true,
      trendRouting: true,
      socialRouting: true,
    },

    feeds: [
      "Canada climate updates",
      "Housing market trends",
      "Luxury NFT architecture",
      "TikTok interior trends",
      "Threads real estate discussions",
    ],

    score:
      Math.floor(Math.random() * 40) +
      60,
  };

  return capsule;
}
