import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { jwtCheck } from './auth';

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(express.json());

// Healthcheck
app.get("/api/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Beispiel: Radar-Model (sehr simpel)
const radarItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ring: { type: String, enum: ["Adopt", "Trial", "Assess", "Hold"], required: true },
  quadrant: { type: String, enum: ["Techniques", "Tools", "Platforms", "Languages"], required: true },
  updatedAt: { type: Date, default: () => new Date() },
});
const RadarItem = mongoose.model("RadarItem", radarItemSchema);

// Öffentliche Route:
app.get("/api/radar", async (_, res) => {
  const items = await RadarItem.find().sort({ quadrant: 1, ring: 1, name: 1 }).lean();
  res.json(items);
});

// Geschützte Route:
app.get('/api/secure/me', jwtCheck, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/radar", async (req, res) => {
  const item = await RadarItem.create(req.body);
  res.status(201).json(item);
});

// Start + DB
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tech-radar";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.get("/", (_, res) => {
      res.type("text").send("Tech-Radar API is running. Try /api/health");
    });
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
