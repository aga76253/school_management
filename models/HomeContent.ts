import { model, models, Schema, type InferSchemaType } from "mongoose";

const HomeContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "home" },
    hero: {
      badge: { type: String, default: "" },
      titleStart: { type: String, default: "" },
      titleAccent: { type: String, default: "" },
      description: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
    },
    notices: [
      {
        date: { type: String, default: "" },
        title: { type: String, default: "" },
        badge: { type: String, default: "" },
      },
    ],
    events: [
      {
        day: { type: String, default: "" },
        monthYear: { type: String, default: "" },
        title: { type: String, default: "" },
      },
    ],
    principal: {
      name: { type: String, default: "" },
      designation: { type: String, default: "" },
      message: { type: String, default: "" },
      experience: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
      campusImageUrl: { type: String, default: "" },
    },
    galleryImages: [{ type: String, default: "" }],
  },
  {
    timestamps: true,
  }
);

export type HomeContentDoc = InferSchemaType<typeof HomeContentSchema>;

const HomeContent = models.HomeContent || model("HomeContent", HomeContentSchema);

export default HomeContent;
