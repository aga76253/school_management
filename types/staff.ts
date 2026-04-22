import type { ActiveStatus, Gender, MongoId } from "./common";

export interface IStaff {
  _id?: MongoId;
  fullName: string;
  staffId: string;
  userId?: MongoId;
  department: string;
  designation: string;
  joiningDate: Date;
  gender?: Gender;
  phone?: string;
  address?: string;
  salary?: number;
  isActive: ActiveStatus;
}
