import type { InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const RadarSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    isPrivate: { type: Boolean, required: false, default: false },
    status: {
      type: String,
      enum: ["adopt", "trial", "assess", "hold"],
      required: true,
    },
    quadrant: {
      type: String,
      enum: ["languages-frameworks", "techniques", "tools", "platforms"],
      required: true,
    },
    reason: { type: String, default: "siehe Dokumentation", required: true, trim: true },
    description: { type: String, default: "siehe Dokumentation", required: true},
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type RadarDoc = InferSchemaType<typeof RadarSchema>;

export const Radar = mongoose.model<RadarDoc>("Radar", RadarSchema);
