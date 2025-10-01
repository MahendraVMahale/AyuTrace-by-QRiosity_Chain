import { Router } from 'express';
import { repo } from '../lib/repo';
import { blockchain } from '../blockchain';
import { requireRole } from '../middleware/auth';
import type { ApiResponse, QualityTestEvent } from '@AyuTrace/shared-types';

export const qualityRouter = Router();

/**
 * @swagger
 * /api/quality:
 *   get:
 *     tags: [Quality]
 *     summary: Get all quality test events
 *     parameters:
 *       - in: query
 *         name: lotId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quality tests
 */
qualityRouter.get('/', async (req, res) => {
  try {
    const { lotId } = req.query;
    
    const tests = await repo.qualityTestEvent.findMany({
      where: lotId ? { lotId: lotId as string } : undefined,
      orderBy: { testDate: 'desc' },
    });
    
    const parsed = tests.map((t: any) => ({
      ...t,
      parameters: JSON.parse(t.parameters),
      fhirMetadata: JSON.parse(t.fhirMetadata),
    }));
    
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/quality:
 *   post:
 *     tags: [Quality]
 *     summary: Record a new quality test event
 *     security:
 *       - BearerAuth: []
 */
qualityRouter.post('/', requireRole(["LAB", "ADMIN"]), async (req, res) => {
  try {
    const {
      lotId,
      labId,
      testDate,
      testType,
      parameters,
      certificationNumber,
      certificationBody,
      labAccreditation,
    } = req.body;
    
    // Check compliance against thresholds
    const thresholds = await repo.complianceThreshold.findMany({
      where: { testType },
    });
    
    let overallStatus: 'pass' | 'fail' | 'conditional' = 'pass';
    const enrichedParameters: any = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      const param = value as any;
      const threshold = thresholds.find((t: any) => t.parameter === key);
      
      if (threshold) {
        let status: 'pass' | 'fail' | 'warning' = 'pass';
        
        if (threshold.max !== null && typeof param.measured === 'number' && param.measured > threshold.max) {
          status = 'fail';
          overallStatus = 'fail';
        } else if (threshold.min !== null && typeof param.measured === 'number' && param.measured < threshold.min) {
          status = 'fail';
          overallStatus = 'fail';
        }
        
        enrichedParameters[key] = {
          ...param,
          threshold: {
            min: threshold.min,
            max: threshold.max,
            unit: threshold.unit,
          },
          status,
        };
      } else {
        enrichedParameters[key] = { ...param, status: 'pass' };
      }
    }
    
    const fhirMetadata = {
      resourceType: 'DiagnosticReport',
      id: `diagnostic-${Date.now()}`,
      identifier: [
        {
          system: 'urn:ayurveda:quality-test',
          value: `${lotId}-${testType}`,
        },
      ],
      status: overallStatus === 'pass' ? 'final' : 'amended',
      conclusion: overallStatus === 'pass' ? 'All parameters within acceptable limits' : 'Some parameters out of range',
    };
    
    const test = await repo.qualityTestEvent.create({
      data: {
        lotId,
        labId,
        testDate: new Date(testDate),
        testType,
        parameters: JSON.stringify(enrichedParameters),
        overallStatus,
        certificationNumber,
        certificationBody,
        labAccreditation,
        fhirMetadata: JSON.stringify(fhirMetadata),
      },
    });
    
    // Record on blockchain
    const txId = await blockchain.recordEvent(
      'quality-test',
      test.id,
      lotId,
      { ...req.body, parameters: enrichedParameters, overallStatus, fhirMetadata },
      [labId]
    );
    
    // Update lot status
    await repo.lot.update({
      where: { id: lotId },
      data: {
        status: overallStatus === 'pass' ? 'approved' : 'rejected',
      },
    });
    
    const response = {
      ...test,
      parameters: JSON.parse(test.parameters),
      fhirMetadata: JSON.parse(test.fhirMetadata),
      blockchainTxId: txId,
    };
    
    res.status(201).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/quality/bulk-csv:
 *   post:
 *     tags: [Quality]
 *     summary: Bulk import quality tests from CSV
 *     security:
 *       - BearerAuth: []
 */
qualityRouter.post('/bulk-csv', requireRole(["LAB", "ADMIN"]), async (req, res) => {
  // ... existing code ...
});