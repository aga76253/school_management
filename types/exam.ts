import type { MongoId } from "./common";

export interface IExam {
  _id?: MongoId;
  examName: string;
  examDate: Date;
  subjectId: MongoId;
  classId: MongoId;
  totalMarks: number;
  passingMarks: number;
}
