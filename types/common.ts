import type { Types } from "mongoose";

export type MongoId = Types.ObjectId | string;

export type Gender = "male" | "female" | "other";

export type ActiveStatus = boolean;
