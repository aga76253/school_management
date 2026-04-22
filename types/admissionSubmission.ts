import type { ActiveStatus, Gender, MongoId } from "./common";

export type AdmissionStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected";

export type AdmissionFieldValue = string | number | boolean | null;

export interface IAdmissionSubmission {
  _id?: MongoId;
  userId: MongoId;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  phone?: string;
  guardianIdCardNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  academicCertificateImage?: string;
  birthOrIdImage?: string;
  previousSchool?: string;
  desiredClassName?: string;
  desiredClassId?: MongoId;
  desiredSectionId?: MongoId;
  sessionId?: MongoId;
  applicationNote?: string;
  dynamicFields?: Record<string, AdmissionFieldValue>;
  status: AdmissionStatus;
  reviewedBy?: MongoId;
  reviewedAt?: Date;
  rejectionReason?: string;
  admissionStudentNumber?: number;
  isActive: ActiveStatus;
}
