import { Schema, model, models, type InferSchemaType } from "mongoose";

const FeeSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type FeeDoc = InferSchemaType<typeof FeeSchema>;

const Fee = models.Fee || model("Fee", FeeSchema);
export default Fee;
