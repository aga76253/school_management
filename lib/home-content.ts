import dbConnect from "@/lib/db";
import HomeContent from "@/models/HomeContent";
import type { HomePageContent } from "@/types/homeContent";

export const defaultHomeContent: HomePageContent = {
  hero: {
    badge: "Admission Open 2026-27",
    titleStart: "Nurturing Minds,",
    titleAccent: "Building Futures",
    description:
      "Bright Future School provides world-class education with state-of-the-art facilities, dedicated faculty, and a holistic approach to student development.",
    imageUrl: "/uploads/home-content/placeholders/hero.svg",
  },
  notices: [
    { date: "Apr 10, 2026", title: "Final Exam Schedule Released", badge: "Important" },
    { date: "Apr 08, 2026", title: "Summer Vacation: May 15 - June 30", badge: "Holiday" },
    { date: "Apr 05, 2026", title: "Parent-Teacher Meeting on April 25", badge: "Event" },
    { date: "Apr 01, 2026", title: "Admission Open for Session 2026-27", badge: "Admission" },
  ],
  events: [
    { day: "15", monthYear: "April 2026", title: "Annual Sports Day" },
    { day: "22", monthYear: "April 2026", title: "Science Exhibition" },
  ],
  principal: {
    name: "Dr. Sarah Ahmed",
    designation: "M.Ed, Ph.D. | Principal",
    message:
      '"At Bright Future School, we believe every child is unique and has infinite potential. Our mission is to provide an environment where students can discover their passions, develop critical thinking skills, and grow into compassionate global citizens."',
    experience: "25+ Years Experience",
    imageUrl: "/uploads/home-content/placeholders/principal.svg",
    campusImageUrl: "/uploads/home-content/placeholders/campus.svg",
  },
  galleryImages: [
    "/uploads/home-content/placeholders/gallery-1.svg",
    "/uploads/home-content/placeholders/gallery-2.svg",
    "/uploads/home-content/placeholders/gallery-3.svg",
    "/uploads/home-content/placeholders/gallery-4.svg",
  ],
};

function mergeWithDefaults(raw: unknown): HomePageContent {
  if (!raw || typeof raw !== "object") return defaultHomeContent;

  const content = raw as Partial<HomePageContent>;
  return {
    hero: {
      badge: content.hero?.badge || defaultHomeContent.hero.badge,
      titleStart: content.hero?.titleStart || defaultHomeContent.hero.titleStart,
      titleAccent: content.hero?.titleAccent || defaultHomeContent.hero.titleAccent,
      description: content.hero?.description || defaultHomeContent.hero.description,
      imageUrl: content.hero?.imageUrl || defaultHomeContent.hero.imageUrl,
    },
    notices:
      Array.isArray(content.notices) && content.notices.length > 0
        ? content.notices.slice(0, 8)
        : defaultHomeContent.notices,
    events:
      Array.isArray(content.events) && content.events.length > 0
        ? content.events.slice(0, 4)
        : defaultHomeContent.events,
    principal: {
      name: content.principal?.name || defaultHomeContent.principal.name,
      designation:
        content.principal?.designation || defaultHomeContent.principal.designation,
      message: content.principal?.message || defaultHomeContent.principal.message,
      experience:
        content.principal?.experience || defaultHomeContent.principal.experience,
      imageUrl: content.principal?.imageUrl || defaultHomeContent.principal.imageUrl,
      campusImageUrl:
        content.principal?.campusImageUrl || defaultHomeContent.principal.campusImageUrl,
    },
    galleryImages:
      Array.isArray(content.galleryImages) && content.galleryImages.length > 0
        ? content.galleryImages.slice(0, 8)
        : defaultHomeContent.galleryImages,
  };
}

export async function getHomeContent(): Promise<HomePageContent> {
  try {
    await dbConnect();
    const doc = await HomeContent.findOne({ key: "home" }).lean();
    return mergeWithDefaults(doc);
  } catch {
    return defaultHomeContent;
  }
}
