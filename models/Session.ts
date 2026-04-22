import { Schema, model, models, type InferSchemaType } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type SessionDoc = InferSchemaType<typeof SessionSchema>;

const Session = models.Session || model("Session", SessionSchema);
export default Session;
