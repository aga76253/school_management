import { Schema, model, models, type InferSchemaType } from "mongoose";

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

export type AcademicSessionDoc = InferSchemaType<typeof AcademicSessionSchema>;

const AcademicSession =
  models.AcademicSession || model("AcademicSession", AcademicSessionSchema);
export default AcademicSession;
