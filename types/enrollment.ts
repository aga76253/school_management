import type { ActiveStatus, MongoId } from "./common";

export interface IEnrollment {
  _id?: MongoId;
  studentId: MongoId;
  classId: MongoId;
  sectionId: MongoId;
  sessionId: MongoId;
  rollNumber?: number;
  admissionDate: Date;
  isActive: ActiveStatus;
}
