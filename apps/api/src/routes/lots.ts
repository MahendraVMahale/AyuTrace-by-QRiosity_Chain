import { Router } from 'express';
import { repo } from '../lib/repo';
import type { ApiResponse } from '@AyuTrace/shared-types';

export const lotsRouter = Router();

/**
 * @swagger
 * /api/lots:
 *   get:
 *     tags: [Lots]
 *     summary: Get all lots
 *     responses:
 *       200:
 *         description: List of all lots
 */
lotsRouter.get('/', async (req, res) => {
  try {
    const lots = await repo.lot.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: lots } as ApiResponse<typeof lots>);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/lots/{id}:
 *   get:
 *     tags: [Lots]
 *     summary: Get lot by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lot details
 */
lotsRouter.get('/:id', async (req, res) => {
  try {
    const lot = await repo.lot.findUnique({
      where: { id: req.params.id },
    });
    
    if (!lot) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    res.json({ success: true, data: lot });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/lots:
 *   post:
 *     tags: [Lots]
 *     summary: Create a new lot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *               - originRegion
 *               - currentQuantityKg
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               originRegion:
 *                 type: string
 *               currentQuantityKg:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lot created successfully
 */
lotsRouter.post('/', async (req, res) => {
  try {
    const { name, species, originRegion, currentQuantityKg } = req.body;
    
    const lot = await repo.lot.create({
      data: {
        name,
        species,
        originRegion,
        currentQuantityKg: parseFloat(currentQuantityKg),
        status: 'collected',
      },
    });
    
    res.status(201).json({ success: true, data: lot });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/lots/{id}/status:
 *   patch:
 *     tags: [Lots]
 *     summary: Update lot status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [collected, processing, tested, approved, rejected, packed]
 *     responses:
 *       200:
 *         description: Status updated
 */
lotsRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const lot = await repo.lot.update({
      where: { id: req.params.id },
      data: { status },
    });
    
    res.json({ success: true, data: lot });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});