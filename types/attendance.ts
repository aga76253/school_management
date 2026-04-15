import type { MongoId } from "./common";

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface IAttendance {
  _id?: MongoId;
  studentId: MongoId;
  classId: MongoId;
  subjectId?: MongoId;
  date: Date;
  status: AttendanceStatus;
  markedBy: MongoId;
  remarks?: string;
}
