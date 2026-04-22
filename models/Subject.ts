import { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subject = models.Subject || model("Subject", SubjectSchema);
export default Subject;
