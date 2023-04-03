import fs from "fs";
import { createCanvas, loadImage } from "canvas";

import constants from "./constants.js";

const PATCH_TEMPLATE_URL = "./assets/patch_template.svg";
const VIEWS_PATCH_URL = "./assets/VIEWS.png";

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  roundingMode: "floor",
});

const originalThumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

export async function generateThumbnail(video) {
  console.log(
    `> Gerando thumbnail do vídeo de id ${video.id} com patch ${video.patch} ${video.views} de views `
  );

  const thumbnailCanvas = createCanvas(1280, 720);
  const context = thumbnailCanvas.getContext("2d");

  const thumbnailUrl = originalThumbnailUrl(video.id);

  const image = await loadImage(thumbnailUrl);

  context.drawImage(image, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  const patch = await loadImage(video.patchImage);

  context.drawImage(patch, 56, 720 - 244 - 44, 350, 244);

  const buffer = thumbnailCanvas.toBuffer("image/jpeg");

  fs.writeFileSync(`./out/${video.id}.jpg`, buffer);
}

export async function generatePatchImage(statistics) {
  if (statistics.patch == "none") return;

  const patchCanvas = createCanvas(350, 244);
  const context = patchCanvas.getContext("2d");

  const image = await loadImage(PATCH_TEMPLATE_URL);

  context.drawImage(image, 0, 0, patchCanvas.width, patchCanvas.height);

  const text = formatter.format(statistics.views);

  const center = patchCanvas.width / 2;
  const fontSize = Math.min(96);

  context.font = `${fontSize}px "Roboto Condensed" bold`;
  context.textAlign = "center";
  context.fillText(text, center, 22 + 15 + fontSize);

  context.globalCompositeOperation = "multiply";
  backgroundPlate(context, constants.colors[statistics.patch]);
  context.globalCompositeOperation = "source-over";

  // replacing views label to stay white
  // todo: find a better way to do this

  const whiteLabel = await loadImage(VIEWS_PATCH_URL);
  context.drawImage(whiteLabel, 111, 185, 127, 37);

  return patchCanvas.toBuffer("image/png");
}

function backgroundPlate(ctx, color) {
  const x = 0;
  const y = 0;
  const width = 350;
  const height = 244;
  const cornerRadius = 26;

  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.arcTo(
    x + width,
    y + height,
    x + width - cornerRadius,
    y + height,
    cornerRadius
  );
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}
