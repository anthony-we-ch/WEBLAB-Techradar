import mongoose, { InferSchemaType, Schema } from "mongoose";

const RadarSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["adopt", "trial", "assess", "hold"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type RadarDoc = InferSchemaType<typeof RadarSchema>;

export const Radar = mongoose.model<RadarDoc>("Radar", RadarSchema);
