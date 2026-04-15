import type { ActiveStatus, MongoId } from "./common";

export interface IAcademicSession {
  _id?: MongoId;
  sessionName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isActive: ActiveStatus;
}
