import type { ActiveStatus, MongoId } from "./common";

export interface ISection {
  _id?: MongoId;
  classId: MongoId;
  sectionName: string;
  sectionCode: string;
  isActive: ActiveStatus;
}
