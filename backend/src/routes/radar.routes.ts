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
    const docs = await Radar.find().sort({ createdAt: -1 });
    res.json(docs.map(d => d.toJSON()));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/radar
 * Neues Radar-Item anlegen (geschützt)
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

    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
});

// PATCH /api/radar/:id/classification  (geschützt)
router.patch('/:id/classification', jwtCheck, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, quadrant, reason } = req.body || {};

    const validStatus   = ['adopt', 'trial', 'assess', 'hold'];
    const validQuadrant = ['languages-frameworks', 'techniques', 'tools', 'platforms'];

    console.log('[PATCH classification]', { id, status, quadrant, reasonLen: reason?.length });

    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
      return res.status(400).json({ error: 'Reason is required (min 3 chars).' });
    }
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatus.join(', ')}` });
    }
    if (quadrant && !validQuadrant.includes(quadrant)) {
      return res.status(400).json({ error: `Invalid quadrant. Allowed: ${validQuadrant.join(', ')}` });
    }

    const doc = await Radar.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const changed =
      (status && status !== doc.status) ||
      (quadrant && quadrant !== doc.quadrant);

    if (!changed) {
      return res.status(400).json({ error: 'No change in status/quadrant detected.' });
    }

    if (status) doc.status = status;
    if (quadrant) doc.quadrant = quadrant;
    doc.reason = reason.trim();
    await doc.save();

    return res.json(doc.toJSON());
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/radar/:id/technology  (geschützt)
router.patch('/:id/technology', jwtCheck, async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, description, quadrant } = req.body || {};

    const validQuadrant = ['languages-frameworks', 'techniques', 'tools', 'platforms'];

    if (typeof title === 'string') title = title.trim();
    if (typeof description === 'string') description = description.trim();

    if (quadrant && !validQuadrant.includes(quadrant)) {
      return res.status(400).json({ error: `Invalid quadrant. Allowed: ${validQuadrant.join(', ')}` });
    }

    const doc = await Radar.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const changed =
      (title && title.length >= 3 && title !== doc.title) ||
      (typeof description === 'string' && description !== doc.description) ||
      (quadrant && quadrant !== doc.quadrant);

    if (!changed) {
      return res.status(400).json({ error: 'No change detected or title too short.' });
    }

    if (title && title.length >= 3 && title !== doc.title) doc.title = title;
    if (typeof description === 'string' && description !== doc.description) doc.description = description;
    if (quadrant && quadrant !== doc.quadrant) doc.quadrant = quadrant;

    await doc.save();

    return res.json(doc.toJSON());
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /api/radar/:id
 * existierendes Item löschen (geschützt)
 */
router.delete('/:id', jwtCheck, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Radar.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send(); // kein Body bei Erfolg
  } catch (err) {
    next(err);
  }
});

export default router;
