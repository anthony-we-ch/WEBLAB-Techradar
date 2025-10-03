import type { InferSchemaType, Types } from "mongoose";
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
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

RadarSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toHexString();
});

type TransformRet = {
  _id?: Types.ObjectId;
  id?: string;
} & Record<string, unknown>;

RadarSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: TransformRet) => {
    if (ret._id !== undefined) {
      delete ret._id;
    }
    return ret;
  },
});

RadarSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: TransformRet) => {
    if (ret._id !== undefined) {
      delete ret._id;
    }
    return ret;
  },
});

export type RadarDoc = InferSchemaType<typeof RadarSchema>;

export const Radar = mongoose.model<RadarDoc>("Radar", RadarSchema);
