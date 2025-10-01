import { Router } from 'express';
import { repo } from '../lib/repo';
import { blockchain } from '../blockchain';
import { requireRole } from '../middleware/auth';
import QRCode from 'qrcode';
import type { ApiResponse, Pack } from '@AyuTrace/shared-types';

export const packsRouter = Router();

/**
 * @swagger
 * /api/packs:
 *   get:
 *     tags: [Packs]
 *     summary: Get all packs
 *     parameters:
 *       - in: query
 *         name: lotId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of packs
 */
packsRouter.get('/', async (req, res) => {
  try {
    const { lotId } = req.query;
    
    const packs = await repo.pack.findMany({
      where: lotId ? { lotId: lotId as string } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    
    const parsed = packs.map((p: any) => ({
      ...p,
      ingredients: JSON.parse(p.ingredients),
      fhirMetadata: JSON.parse(p.fhirMetadata),
    }));
    
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/packs/{id}:
 *   get:
 *     tags: [Packs]
 *     summary: Get pack by ID (Public endpoint for consumers)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pack details
 */
packsRouter.get('/:id', async (req, res) => {
  try {
    const pack = await repo.pack.findUnique({
      where: { id: req.params.id },
    });
    
    if (!pack) {
      return res.status(404).json({ success: false, error: 'Pack not found' });
    }
    
    const response = {
      ...pack,
      ingredients: JSON.parse((pack as any).ingredients),
      fhirMetadata: JSON.parse((pack as any).fhirMetadata),
    };
    
    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/packs:
 *   post:
 *     tags: [Packs]
 *     summary: Mint a new pack with QR code
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lotId
 *               - manufacturerId
 *               - sku
 *               - productName
 *               - batchNumber
 *               - manufactureDate
 *               - expiryDate
 *               - netWeight
 *               - ingredients
 *     responses:
 *       201:
 *         description: Pack created with QR code
 */
packsRouter.post('/', requireRole(["MANUFACTURER", "ADMIN"]), async (req, res) => {
  try {
    const {
      lotId,
      manufacturerId,
      sku,
      productName,
      batchNumber,
      manufactureDate,
      expiryDate,
      netWeight,
      ingredients,
      dosage,
      storage,
      ayushLicense,
      gmpCertified = false,
    } = req.body;
    
    // Generate unique pack ID
    const packId = `PACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate QR code data URL
    const qrData = `https://AyuTracece.gov.in/provenance/${packId}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    
    const fhirMetadata = {
      resourceType: 'Medication',
      id: `medication-${Date.now()}`,
      identifier: [
        {
          system: 'urn:ayurveda:pack',
          value: packId,
        },
        {
          system: 'urn:ayush:license',
          value: ayushLicense || 'N/A',
        },
      ],
      code: {
        coding: [
          {
            system: 'http://ayush.gov.in/fhir/medication',
            code: sku,
            display: productName,
          },
        ],
      },
      batch: {
        lotNumber: batchNumber,
        expirationDate: expiryDate,
      },
    };
    
    const pack = await repo.pack.create({
      data: {
        id: packId,
        lotId,
        manufacturerId,
        sku,
        productName,
        batchNumber,
        manufactureDate: new Date(manufactureDate),
        expiryDate: new Date(expiryDate),
        netWeight,
        ingredients: JSON.stringify(ingredients),
        dosage,
        storage,
        ayushLicense,
        gmpCertified,
        qrCodeUrl,
        fhirMetadata: JSON.stringify(fhirMetadata),
      },
    });
    
    // Record on blockchain
    const txId = await blockchain.recordEvent(
      'pack-mint',
      pack.id,
      lotId,
      { ...req.body, packId, qrCodeUrl, fhirMetadata },
      [manufacturerId]
    );
    
    // Update lot status
    await repo.lot.update({
      where: { id: lotId },
      data: { status: 'packed' },
    });
    
    const response = {
      ...pack,
      ingredients: JSON.parse(pack.ingredients),
      fhirMetadata: JSON.parse(pack.fhirMetadata),
      blockchainTxId: txId,
    };
    
    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});