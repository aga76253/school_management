import type { ActiveStatus, MongoId } from "./common";

export interface IClass {
  _id?: MongoId;
  className: string;
  classCode: string;
  isActive: ActiveStatus;
}
