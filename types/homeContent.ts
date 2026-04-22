export type HomeHeroContent = {
  badge: string;
  titleStart: string;
  titleAccent: string;
  description: string;
  imageUrl: string;
};

export type HomeNoticeContent = {
  date: string;
  title: string;
  badge: string;
};

export type HomeEventContent = {
  day: string;
  monthYear: string;
  title: string;
};

export type HomePrincipalContent = {
  name: string;
  designation: string;
  message: string;
  experience: string;
  imageUrl: string;
  campusImageUrl: string;
};

export type HomePageContent = {
  hero: HomeHeroContent;
  notices: HomeNoticeContent[];
  events: HomeEventContent[];
  principal: HomePrincipalContent;
  galleryImages: string[];
};
