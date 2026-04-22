import { Schema, model, models } from "mongoose";

const ClassSchema = new Schema(
  {
    className: { type: String, required: true, trim: true },
    classCode: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ClassModel = models.Class || model("Class", ClassSchema);
export default ClassModel;
