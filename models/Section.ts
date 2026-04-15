import { Schema, model, models, type InferSchemaType } from "mongoose";

const SectionSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionName: { type: String, required: true, trim: true },
    sectionCode: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SectionSchema.index({ classId: 1, sectionCode: 1 }, { unique: true });

export type SectionDoc = InferSchemaType<typeof SectionSchema>;

const Section = models.Section || model("Section", SectionSchema);
export default Section;
