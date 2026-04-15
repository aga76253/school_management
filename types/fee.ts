import type { MongoId } from "./common";

export interface IFee {
  _id?: MongoId;
  studentId: MongoId;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
}
