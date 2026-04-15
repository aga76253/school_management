import { Schema, model, models, type InferSchemaType } from "mongoose";

const ExamSchema = new Schema(
  {
    examName: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    totalMarks: { type: Number, required: true, min: 0 },
    passingMarks: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type ExamDoc = InferSchemaType<typeof ExamSchema>;

const Exam = models.Exam || model("Exam", ExamSchema);
export default Exam;
