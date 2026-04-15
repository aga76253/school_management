import type { ActiveStatus, MongoId } from "./common";

export interface ISubject {
  _id?: MongoId;
  subjectName: string;
  subjectCode: string;
  isActive: ActiveStatus;
}
