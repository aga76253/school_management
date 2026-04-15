import type { ActiveStatus, Gender, MongoId } from "./common";

export interface ITeacher {
  _id?: MongoId;
  fullName: string;
  teacherId: string;
  dateOfBirth: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  isActive: ActiveStatus;
}
