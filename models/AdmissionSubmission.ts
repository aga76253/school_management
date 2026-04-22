import { Schema, model, models } from "mongoose";

const AdmissionSubmissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: { type: String, trim: true },
    guardianIdCardNumber: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    academicCertificateImage: { type: String, trim: true },
    birthOrIdImage: { type: String, trim: true },
    previousSchool: { type: String, trim: true },
    desiredClassName: { type: String, trim: true },
    desiredClassId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    desiredSectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "AcademicSession", index: true },
    applicationNote: { type: String, trim: true },
    dynamicFields: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    admissionStudentNumber: {
      type: Number,
      index: true,
      unique: true,
      sparse: true,
      min: 1,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdmissionSubmissionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const AdmissionSubmission =
  models.AdmissionSubmission ||
  model("AdmissionSubmission", AdmissionSubmissionSchema);
export default AdmissionSubmission;
