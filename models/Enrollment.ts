import { Schema, model, models } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
      index: true,
    },
    rollNumber: { type: Number, min: 1 },
    admissionDate: { type: Date, required: true, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });
EnrollmentSchema.index(
  { classId: 1, sectionId: 1, sessionId: 1, rollNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { rollNumber: { $exists: true } },
  }
);

const Enrollment = models.Enrollment || model("Enrollment", EnrollmentSchema);
export default Enrollment;
