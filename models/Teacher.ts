import { Schema, model, models, type InferSchemaType } from "mongoose";

const TeacherSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    teacherId: { type: String, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type TeacherDoc = InferSchemaType<typeof TeacherSchema>;

const Teacher = models.Teacher || model("Teacher", TeacherSchema);
export default Teacher;
