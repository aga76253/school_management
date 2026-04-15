import type { MongoId } from "./common";

export interface IResult {
  _id?: MongoId;
  studentId: MongoId;
  examId: MongoId;
  marksObtained: number;
  grade: string;
}
