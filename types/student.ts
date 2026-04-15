import type { ActiveStatus, Gender, MongoId } from "./common";

export interface IStudent {
  _id?: MongoId;
  fullName: string;
  studentId: string;
  dateOfBirth: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  guardianId?: MongoId;
  isActive: ActiveStatus;
}
