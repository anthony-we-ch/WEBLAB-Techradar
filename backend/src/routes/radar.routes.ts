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
    const { title, private: isPrivate = false, status, quadrant,  reason = "", description = ""  } = req.body || {};
    
    const validStatus   = ['adopt', 'trial', 'assess', 'hold'];
    const validQuadrant = ['languages-frameworks', 'techniques', 'tools', 'platforms'];

    if (!title || !status || !quadrant || !reason) {
      return res.status(400).json({ error: 'Invalid payload. A title, a status, the quadrant, a reason and a description are required' });
    }
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatus.join(', ')}` });
    }
    if (!validQuadrant.includes(quadrant)) {
      return res.status(400).json({ error: `Invalid quadrant. Allowed: ${validQuadrant.join(', ')}` });
    }

    const created = await Radar.create({
      title,
      private: Boolean(isPrivate),
      status,
      quadrant,
      reason,
      description
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
