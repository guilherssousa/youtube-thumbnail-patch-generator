import { registerFont } from "canvas";

import client from "./client.js";

import config from "./config.js";

import { generatePatchImage, generateThumbnail } from "./image.js";

registerFont(config.font.url, {
  family: config.font.name,
  weight: "bold",
  style: "normal",
});

async function main() {
  try {
    const { items: mostPopularVideos } = await fetchMostPopularChannelVideos(
      config.channel_id
    );

    const mostPopularVideosIds = mostPopularVideos.map(
      (video) => video.id.videoId
    );

    const videosStatistics = await Promise.all(
      mostPopularVideosIds.map(async (videoId) => ({
        id: videoId,
        views: parseInt((await fetchVideoStatistics(videoId)).viewCount, 10),
      }))
    );

    const statisticsWithPatches = videosStatistics.map((video) => ({
      ...video,
      patch: getViewPatch(video.views),
    }));

    // generate patches for each video

    const patches = await Promise.all(
      statisticsWithPatches.map(async (video) => ({
        ...video,
        patchImage: await generatePatchImage(video),
      }))
    );

    return patches.forEach(generateThumbnail);
  } catch (e) {
    console.error("Deu erro!");
    console.error(e);
  }
}

main();

async function fetchMostPopularChannelVideos(channel_id) {
  const request = await client.get("search", {
    params: {
      channelId: channel_id,
      part: "snippet",
      order: "viewCount",
      maxResults: 50,
      type: "video",
    },
  });

  return request.data;
}

async function fetchVideoStatistics(video_id) {
  const request = await client.get("videos", {
    params: {
      id: video_id,
      part: "statistics",
    },
  });

  return request.data.items.find((item) => item.id === video_id).statistics;
}

function getViewPatch(viewCount) {
  if (viewCount > config.gold_base) return "gold";
  if (viewCount > config.silver_base) return "silver";
  if (viewCount > config.bronze_base) return "bronze";

  return "none";
}
