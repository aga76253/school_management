import { Schema, model, models, type InferSchemaType } from "mongoose";

const AttendanceSchema = new Schema(
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      required: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { studentId: 1, classId: 1, subjectId: 1, date: 1 },
  { unique: true }
);

export type AttendanceDoc = InferSchemaType<typeof AttendanceSchema>;

const Attendance = models.Attendance || model("Attendance", AttendanceSchema);
export default Attendance;
