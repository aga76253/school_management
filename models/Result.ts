import { Schema, model, models } from "mongoose";

const ResultSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    marksObtained: { type: Number, required: true, min: 0 },
    grade: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ResultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Result = models.Result || model("Result", ResultSchema);
export default Result;
