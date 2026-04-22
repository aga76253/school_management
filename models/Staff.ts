import { Schema, model, models, type InferSchemaType } from "mongoose";

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    staffId: { type: String, required: true, unique: true, trim: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
      index: true,
    },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type StaffDoc = InferSchemaType<typeof StaffSchema>;

const Staff = models.Staff || model("Staff", StaffSchema);
export default Staff;
