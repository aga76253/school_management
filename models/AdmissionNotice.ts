import { Schema, model, models, type InferSchemaType } from "mongoose";

const AdmissionNoticeSchema = new Schema(
  {
    message: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type AdmissionNoticeDoc = InferSchemaType<typeof AdmissionNoticeSchema>;

const AdmissionNotice =
  models.AdmissionNotice || model("AdmissionNotice", AdmissionNoticeSchema);

export default AdmissionNotice;
