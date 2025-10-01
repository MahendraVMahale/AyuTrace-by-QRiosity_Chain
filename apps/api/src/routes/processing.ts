import { Router } from 'express';
import { repo } from '../lib/repo';
import { blockchain } from '../blockchain';
import { requireRole } from '../middleware/auth';
import type { ApiResponse, ProcessingEvent } from '@AyuTrace/shared-types';

export const processingRouter = Router();

/**
 * @swagger
 * /api/processing:
 *   get:
 *     tags: [Processing]
 *     summary: Get all processing events
 */
processingRouter.get('/', async (req, res) => {
  try {
    const { lotId } = req.query;
    
    const events = await repo.processingEvent.findMany({
      where: lotId ? { lotId: lotId as string } : undefined,
      orderBy: { processDate: 'desc' },
    });
    
    const parsed = events.map((e: any) => ({
      ...e,
      parameters: JSON.parse(e.parameters),
      fhirMetadata: JSON.parse(e.fhirMetadata),
    }));
    
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/processing:
 *   post:
 *     tags: [Processing]
 *     summary: Record a new processing event
 *     security:
 *       - BearerAuth: []
 */
processingRouter.post('/', requireRole(["PROCESSOR", "ADMIN"]), async (req, res) => {
  try {
    const {
      lotId,
      processorId,
      processType,
      processDate,
      parameters,
      inputQuantityKg,
      outputQuantityKg,
      yieldPercentage,
      equipmentId,
      operatorId,
    } = req.body;
    
    const fhirMetadata = {
      resourceType: 'Procedure',
      id: `procedure-${Date.now()}`,
      identifier: [
        {
          system: 'urn:ayurveda:processing',
          value: `${lotId}-${processType}`,
        },
      ],
      status: 'completed',
      code: {
        coding: [
          {
            system: 'http://ayush.gov.in/fhir/processing',
            code: processType,
            display: processType.toUpperCase(),
          },
        ],
      },
    };
    
    const event = await repo.processingEvent.create({
      data: {
        lotId,
        processorId,
        processType,
        processDate: new Date(processDate),
        parameters: JSON.stringify(parameters),
        inputQuantityKg: parseFloat(inputQuantityKg),
        outputQuantityKg: parseFloat(outputQuantityKg),
        yieldPercentage: parseFloat(yieldPercentage),
        equipmentId,
        operatorId,
        fhirMetadata: JSON.stringify(fhirMetadata),
      },
    });
    
    // Record on blockchain
    const txId = await blockchain.recordEvent(
      'processing',
      event.id,
      lotId,
      { ...req.body, fhirMetadata },
      [processorId]
    );
    
    // Update lot status
    await repo.lot.update({
      where: { id: lotId },
      data: { status: 'processing' },
    });
    
    const response = {
      ...event,
      parameters: JSON.parse(event.parameters),
      fhirMetadata: JSON.parse(event.fhirMetadata),
      blockchainTxId: txId,
    };
    
    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});