import { Schema, model, models, type InferSchemaType } from "mongoose";

const StudentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    admissionSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: "AdmissionSubmission",
      unique: true,
      sparse: true,
    },
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    guardianId: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type StudentDoc = InferSchemaType<typeof StudentSchema>;

const Student = models.Student || model("Student", StudentSchema);
export default Student;
