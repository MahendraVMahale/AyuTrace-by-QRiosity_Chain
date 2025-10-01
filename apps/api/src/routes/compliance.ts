import { Router } from 'express';
import { repo } from '../lib/repo';
import { requireRole } from '../middleware/auth';
import type { ApiResponse, ComplianceThreshold } from '@AyuTrace/shared-types';

export const complianceRouter = Router();

/**
 * @swagger
 * /api/compliance/thresholds:
 *   get:
 *     tags: [Compliance]
 *     summary: Get all compliance thresholds
 *     security:
 *       - BearerAuth: []
 */
complianceRouter.get('/thresholds', requireRole(["REGULATOR", "ADMIN"]), async (req, res) => {
  try {
    const { testType } = req.query;
    
    const thresholds = await repo.complianceThreshold.findMany({
      where: testType ? { testType: testType as string } : undefined,
    });
    
    res.json({ success: true, data: thresholds });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/compliance/thresholds:
 *   post:
 *     tags: [Compliance]
 *     summary: Set compliance thresholds
 *     security:
 *       - BearerAuth: []
 */
complianceRouter.post('/thresholds', requireRole(["REGULATOR", "ADMIN"]), async (req, res) => {
  try {
    const { testType, parameter, min, max, unit, regulatoryBody, standard } = req.body;
    
    const threshold = await repo.complianceThreshold.create({
      data: {
        testType,
        parameter,
        min: min ? parseFloat(min) : null,
        max: max ? parseFloat(max) : null,
        unit,
        regulatoryBody,
        standard,
      },
    });
    
    res.status(201).json({ success: true, data: threshold });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/compliance/flags:
 *   get:
 *     tags: [Compliance]
 *     summary: Get all compliance flags
 *     security:
 *       - BearerAuth: []
 */
complianceRouter.get('/flags', requireRole(["REGULATOR", "ADMIN"]), async (req, res) => {
  try {
    const { testType } = req.query;
    
    const flags = await repo.complianceFlag.findMany({
      where: testType ? { testType: testType as string } : undefined,
    });
    
    res.json({ success: true, data: flags });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/compliance/report:
 *   get:
 *     tags: [Compliance]
 *     summary: Generate CSV compliance report
 *     security:
 *       - BearerAuth: []
 */
complianceRouter.get('/report', requireRole(["REGULATOR", "ADMIN"]), async (req, res) => {
  try {
    const { lotId } = req.params;
    
    const lot = await repo.lot.findUnique({ where: { id: lotId } });
    if (!lot) {
      return res.status(404).json({ success: false, error: 'Lot not found' });
    }
    
    const qualityTests = await repo.qualityTestEvent.findMany({
      where: { lotId },
    });
    
    const collectionEvents = await repo.collectionEvent.findMany({
      where: { lotId },
    });
    
    const processingEvents = await repo.processingEvent.findMany({
      where: { lotId },
    });
    
    // Generate compliance summary
    const report = {
      lot: {
        id: lotId,
        name: (lot as any).name,
        species: (lot as any).species,
        status: (lot as any).status,
      },
      collection: {
        totalEvents: collectionEvents.length,
        organicCertified: collectionEvents.filter((e: any) => e.organicCertified).length,
        wildHarvested: collectionEvents.filter((e: any) => e.wildHarvested).length,
      },
      processing: {
        totalEvents: processingEvents.length,
        processTypes: [...new Set(processingEvents.map((e: any) => e.processType))],
      },
      qualityTests: {
        totalTests: qualityTests.length,
        passed: qualityTests.filter((t: any) => t.overallStatus === 'pass').length,
        failed: qualityTests.filter((t: any) => t.overallStatus === 'fail').length,
        conditional: qualityTests.filter((t: any) => t.overallStatus === 'conditional').length,
        testTypes: [...new Set(qualityTests.map((t: any) => t.testType))],
      },
      complianceStatus: {
        isCompliant: qualityTests.length > 0 && qualityTests.every((t: any) => t.overallStatus !== 'fail'),
        missingTests: getRecommendedTests().filter(
          (testType) => !qualityTests.some((t: any) => t.testType === testType)
        ),
      },
      generatedAt: new Date().toISOString(),
    };
    
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getRecommendedTests(): string[] {
  return ['microbial', 'heavy-metals', 'pesticide', 'potency', 'authenticity'];
}