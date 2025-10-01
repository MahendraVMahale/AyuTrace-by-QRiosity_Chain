import { Router } from 'express';
import { repo } from '../lib/repo';
import { blockchain } from '../blockchain';
import { requireRole } from '../middleware/auth';
import type { ApiResponse, CollectionEvent } from '@AyuTrace/shared-types';

export const collectionRouter = Router();

/**
 * @swagger
 * /api/collection:
 *   get:
 *     tags: [Collection]
 *     summary: Get all collection events
 */
collectionRouter.get('/', async (req, res) => {
  try {
    const { lotId } = req.query;
    
    const events = await repo.collectionEvent.findMany({
      where: lotId ? { lotId: lotId as string } : undefined,
      orderBy: { collectionDate: 'desc' },
    });
    
    // Parse JSON fields
    const parsed = events.map((e: any) => ({
      ...e,
      location: JSON.parse(e.location),
      fhirMetadata: JSON.parse(e.fhirMetadata),
    }));
    
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/collection:
 *   post:
 *     tags: [Collection]
 *     summary: Record a new collection event
 *     security:
 *       - BearerAuth: []
 */
collectionRouter.post('/', requireRole(["COLLECTOR", "ADMIN"]), async (req, res) => {
  try {
    const {
      lotId,
      collectorId,
      species,
      commonName,
      partUsed,
      quantityKg,
      collectionDate,
      location,
      weatherConditions,
      soilType,
      wildHarvested = false,
      organicCertified = false,
    } = req.body;
    
    // Create FHIR metadata
    const fhirMetadata = {
      resourceType: 'Substance',
      id: `substance-${Date.now()}`,
      identifier: [
        {
          system: 'urn:ayurveda:lot',
          value: lotId,
        },
      ],
      extension: [
        {
          url: 'http://ayush.gov.in/fhir/collection-method',
          valueString: wildHarvested ? 'wild-harvested' : 'cultivated',
        },
        {
          url: 'http://ayush.gov.in/fhir/organic-certified',
          valueString: organicCertified ? 'yes' : 'no',
        },
      ],
    };
    
    const event = await repo.collectionEvent.create({
      data: {
        lotId,
        collectorId,
        species,
        commonName,
        partUsed,
        quantityKg: parseFloat(quantityKg),
        collectionDate: new Date(collectionDate),
        location: JSON.stringify(location),
        weatherConditions,
        soilType,
        wildHarvested,
        organicCertified,
        fhirMetadata: JSON.stringify(fhirMetadata),
      },
    });
    
    // Record on blockchain
    const txId = await blockchain.recordEvent(
      'collection',
      event.id,
      lotId,
      { ...req.body, fhirMetadata },
      [collectorId]
    );
    
    // Update lot quantity
    const lot = await repo.lot.findUnique({ where: { id: lotId } });
    if (lot) {
      await repo.lot.update({
        where: { id: lotId },
        data: {
          currentQuantityKg: (lot as any).currentQuantityKg + parseFloat(quantityKg),
          status: 'collected',
        },
      });
    }
    
    const response = {
      ...event,
      location: JSON.parse(event.location),
      fhirMetadata: JSON.parse(event.fhirMetadata),
      blockchainTxId: txId,
    };
    
    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});