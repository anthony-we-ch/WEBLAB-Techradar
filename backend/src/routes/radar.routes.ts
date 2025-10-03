import { Router } from "express";
import { jwtCheck } from "../auth";
import { Radar } from "../models/radar.model";

const router = Router();

/**
 * GET /api/radar
 * Liste aller Radar-Items (öffentlich)
 */
router.get("/", async (_req, res, next) => {
  try {
    const items = await Radar.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/radar
 * Neues Radar-Item anlegen (geschützt)
 * body: { title: string; description?: string; status: 'adopt'|'trial'|'assess'|'hold' }
 */
router.post('/', jwtCheck, async (req, res, next) => {
  try {
    // TEMP: Debug – sehen, ob Token korrekt ankommt
    // console.log('req.auth:', (req as any).auth);

    const { title, description = '', status } = req.body || {};
    if (!title || !status || !['adopt', 'trial', 'assess', 'hold'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payload: { title, status } required' });
    }
    const created = await Radar.create({ title, description, status });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
