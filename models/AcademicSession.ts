import { Schema, model, models } from "mongoose";

const AcademicSessionSchema = new Schema(
  {
    sessionName: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AcademicSession =
  models.AcademicSession || model("AcademicSession", AcademicSessionSchema);
export default AcademicSession;
