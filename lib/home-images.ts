import dbConnect from "@/lib/db";
import HomeImages from "@/models/HomeImages";
import {
  doesBlobExist,
  extractBlobNameFromAppImageUrl,
  toAppImageUrl,
} from "@/lib/azureblob";

export const HOME_IMAGE_SLOTS = [
  "hero",
  "principalProfile",
  "campus",
  "gallery1",
  "gallery2",
  "gallery3",
  "gallery4",
] as const;

export type HomeImageSlot = (typeof HOME_IMAGE_SLOTS)[number];

type HomeImageDoc = Partial<Record<HomeImageSlot, string>>;

export type HomeImagesPayload = {
  hero: string;
  principalProfile: string;
  campus: string;
  gallery: string[];
};

const DEFAULT_HOME_IMAGES: HomeImagesPayload = {
  hero: "/uploads/home-content/placeholders/hero.svg",
  principalProfile: "/uploads/home-content/placeholders/principal.svg",
  campus: "/uploads/home-content/placeholders/campus.svg",
  gallery: [
    "/uploads/home-content/placeholders/gallery-1.svg",
    "/uploads/home-content/placeholders/gallery-2.svg",
    "/uploads/home-content/placeholders/gallery-3.svg",
    "/uploads/home-content/placeholders/gallery-4.svg",
  ],
};

export function isHomeImageSlot(value: string): value is HomeImageSlot {
  return HOME_IMAGE_SLOTS.includes(value as HomeImageSlot);
}

export async function getHomeImages(): Promise<HomeImagesPayload> {
  try {
    await dbConnect();
    const doc = (await HomeImages.findOne({ key: "home-images" }).lean()) as
      | HomeImageDoc
      | null;

    const heroCandidate = toAppImageUrl(doc?.hero || DEFAULT_HOME_IMAGES.hero);
    const principalCandidate = toAppImageUrl(
      doc?.principalProfile || DEFAULT_HOME_IMAGES.principalProfile
    );
    const campusCandidate = toAppImageUrl(doc?.campus || DEFAULT_HOME_IMAGES.campus);
    const galleryCandidates = [
      toAppImageUrl(doc?.gallery1 || DEFAULT_HOME_IMAGES.gallery[0]),
      toAppImageUrl(doc?.gallery2 || DEFAULT_HOME_IMAGES.gallery[1]),
      toAppImageUrl(doc?.gallery3 || DEFAULT_HOME_IMAGES.gallery[2]),
      toAppImageUrl(doc?.gallery4 || DEFAULT_HOME_IMAGES.gallery[3]),
    ];

    async function resolveSlotImage(
      candidate: string,
      fallback: string
    ): Promise<string> {
      const blobName = extractBlobNameFromAppImageUrl(candidate);
      if (!blobName) return candidate;
      const exists = await doesBlobExist(blobName);
      return exists ? candidate : fallback;
    }

    const [hero, principalProfile, campus, g1, g2, g3, g4] = await Promise.all([
      resolveSlotImage(heroCandidate, DEFAULT_HOME_IMAGES.hero),
      resolveSlotImage(principalCandidate, DEFAULT_HOME_IMAGES.principalProfile),
      resolveSlotImage(campusCandidate, DEFAULT_HOME_IMAGES.campus),
      resolveSlotImage(galleryCandidates[0], DEFAULT_HOME_IMAGES.gallery[0]),
      resolveSlotImage(galleryCandidates[1], DEFAULT_HOME_IMAGES.gallery[1]),
      resolveSlotImage(galleryCandidates[2], DEFAULT_HOME_IMAGES.gallery[2]),
      resolveSlotImage(galleryCandidates[3], DEFAULT_HOME_IMAGES.gallery[3]),
    ]);

    return {
      hero,
      principalProfile,
      campus,
      gallery: [g1, g2, g3, g4],
    };
  } catch {
    return DEFAULT_HOME_IMAGES;
  }
}

export async function saveHomeImageSlot(slot: HomeImageSlot, imagePath: string) {
  await dbConnect();
  await HomeImages.findOneAndUpdate(
    { key: "home-images" },
    { $set: { [slot]: imagePath }, $setOnInsert: { key: "home-images" } },
    { upsert: true, new: true }
  );
}

export async function clearHomeImageSlot(slot: HomeImageSlot) {
  await dbConnect();
  await HomeImages.findOneAndUpdate(
    { key: "home-images" },
    { $unset: { [slot]: 1 }, $setOnInsert: { key: "home-images" } },
    { upsert: true, new: true }
  );
}
