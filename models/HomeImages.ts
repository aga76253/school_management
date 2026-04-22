import { model, models, Schema } from "mongoose";

const HomeImagesSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "home-images" },
    hero: { type: String, default: "" },
    principalProfile: { type: String, default: "" },
    campus: { type: String, default: "" },
    gallery1: { type: String, default: "" },
    gallery2: { type: String, default: "" },
    gallery3: { type: String, default: "" },
    gallery4: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const HomeImages = models.HomeImages || model("HomeImages", HomeImagesSchema);

export default HomeImages;
