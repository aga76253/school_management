import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "guardian"],
      required: true,
      default: "guardian",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

const User = models.User || model("User", UserSchema);
export default User;
