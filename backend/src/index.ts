import cors from "cors";
import dotenv from "dotenv";
import type { ErrorRequestHandler } from 'express';
import express from "express";
import mongoose from "mongoose";
import { jwtCheck } from './auth';
import { CONFIG } from './config';
import { connectDb } from './db';
import radarRoutes from './routes/radar.routes';

dotenv.config();

const app = express();

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {

  const status = (err as any)?.status ?? 500;
  const msg = (err as any)?.message;

  if (status >= 400 && status < 500) {
    // In Dev: alles loggen
    if (process.env.NODE_ENV !== 'production') {
      console.error('[4xx ERROR]', err);
    }
    // Wenn der Fehler bereits ein Body-Objekt mitgibt, sende das durch
    const body = (err as any)?.body;
    if (body && typeof body === 'object') {
      return res.status(status).json(body);
    }
    // sonst generische, aber klare 4xx-Antwort
    return res.status(status).json({ error: 'Bad Request', message: msg ?? undefined });
  }
  
  if (err && (err.name === 'UnauthorizedError' || (err as any).status === 401)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: (err as any).message ?? 'invalid or expired token',
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[500 ERROR]', err);
  }
  return res.status(500).json({ error: 'Internal Server Error' });
};

app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(express.json());

// Healthcheck
app.get("/api/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Radar API
app.use('/api/radar', radarRoutes);

app.get('/api/debug/headers', (req, res) => {
  res.json({
    authorization: req.headers.authorization ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  });
});

// Fehler-Handler
app.use(errorHandler);

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
app.get('/api/secure/me', jwtCheck, (req, res) => {
  res.json({ ok: true });
});

app.post("/api/radar", async (req, res) => {
  const item = await RadarItem.create(req.body);
  res.status(201).json(item);
});

// Start + DB
const PORT = Number(process.env.PORT) || 3000;
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

// Mongoose Events loggen
(async () => {
  await connectDb(CONFIG.MONGODB_URI);
  app.listen(CONFIG.PORT, () => {
    console.log(`API on http://localhost:${CONFIG.PORT}`);
  });
})();
