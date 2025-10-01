import { Router } from 'express';
import { repo } from '../lib/repo';
import { blockchain } from '../blockchain';

export const provenanceRouter = Router();

/**
 * @swagger
 * /api/provenance/{packId}:
 *   get:
 *     tags: [Provenance]
 *     summary: Get complete provenance trace for a pack (consumer view)
 *     parameters:
 *       - in: path
 *         name: packId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complete traceability information
 */
provenanceRouter.get('/:packId', async (req, res) => {
  try {
    const { packId } = req.params;
    
    // Get pack
    const pack = await repo.pack.findUnique({
      where: { id: packId },
    });
    
    if (!pack) {
      return res.status(404).json({ success: false, error: 'Pack not found' });
    }
    
    const lotId = (pack as any).lotId;
    
    // Get lot
    const lot = await repo.lot.findUnique({
      where: { id: lotId },
    });
    
    // Get all events
    const collectionEvents = await repo.collectionEvent.findMany({
      where: { lotId },
      orderBy: { collectionDate: 'asc' },
    });
    
    const processingEvents = await repo.processingEvent.findMany({
      where: { lotId },
      orderBy: { processDate: 'asc' },
    });
    
    const qualityTests = await repo.qualityTestEvent.findMany({
      where: { lotId },
      orderBy: { testDate: 'asc' },
    });
    
    // Get blockchain path
    const blockchainPath = await blockchain.getChainForLot(lotId);
    
    // Verify blockchain
    const verification = await blockchain.verifyChain(lotId);
    
    // Parse JSON fields
    const parsedCollections = collectionEvents.map((e: any) => ({
      ...e,
      location: JSON.parse(e.location),
      fhirMetadata: JSON.parse(e.fhirMetadata),
    }));
    
    const parsedProcessing = processingEvents.map((e: any) => ({
      ...e,
      location: JSON.parse(e.location),
      fhirMetadata: JSON.parse(e.fhirMetadata),
    }));
    
    const parsedQuality = qualityTests.map((t: any) => ({
      ...t,
      parameters: JSON.parse(t.parameters),
      fhirMetadata: JSON.parse(t.fhirMetadata),
    }));
    
    const parsedPack = {
      ...(pack as any),
      ingredients: JSON.parse((pack as any).ingredients),
      fhirMetadata: JSON.parse((pack as any).fhirMetadata),
    };
    
    const parsedBlockchain = blockchainPath.map((entry: any) => ({
      ...entry,
      participants: JSON.parse(entry.participants),
      data: JSON.parse(entry.data),
    }));
    
    // Assess compliance
    const complianceStatus = {
      overallStatus: 'compliant' as 'compliant' | 'non-compliant' | 'pending',
      details: [] as any[],
    };
    
    // Check if collection exists
    if (parsedCollections.length === 0) {
      complianceStatus.overallStatus = 'non-compliant';
      complianceStatus.details.push({
        checkpoint: 'Collection Event',
        status: 'fail',
        message: 'No collection events found',
      });
    } else {
      complianceStatus.details.push({
        checkpoint: 'Collection Event',
        status: 'pass',
        message: `${parsedCollections.length} collection event(s) recorded`,
      });
    }
    
    // Check quality tests
    if (parsedQuality.length === 0) {
      complianceStatus.overallStatus = 'pending';
      complianceStatus.details.push({
        checkpoint: 'Quality Testing',
        status: 'pending',
        message: 'No quality tests performed',
      });
    } else {
      const failedTests = parsedQuality.filter((t: any) => t.overallStatus === 'fail');
      if (failedTests.length > 0) {
        complianceStatus.overallStatus = 'non-compliant';
        complianceStatus.details.push({
          checkpoint: 'Quality Testing',
          status: 'fail',
          message: `${failedTests.length} test(s) failed`,
        });
      } else {
        complianceStatus.details.push({
          checkpoint: 'Quality Testing',
          status: 'pass',
          message: `All ${parsedQuality.length} test(s) passed`,
        });
      }
    }
    
    // Check blockchain integrity
    if (!verification.valid) {
      complianceStatus.overallStatus = 'non-compliant';
      complianceStatus.details.push({
        checkpoint: 'Blockchain Integrity',
        status: 'fail',
        message: verification.message,
      });
    } else {
      complianceStatus.details.push({
        checkpoint: 'Blockchain Integrity',
        status: 'pass',
        message: 'Blockchain verified',
      });
    }
    
    // Check GMP certification
    if (parsedPack.gmpCertified) {
      complianceStatus.details.push({
        checkpoint: 'GMP Certification',
        status: 'pass',
        message: 'GMP certified manufacturing',
      });
    } else {
      complianceStatus.details.push({
        checkpoint: 'GMP Certification',
        status: 'pending',
        message: 'GMP certification not found',
      });
    }
    
    const response = {
      pack: parsedPack,
      lot,
      collectionEvents: parsedCollections,
      processingEvents: parsedProcessing,
      qualityTests: parsedQuality,
      blockchainPath: parsedBlockchain,
      complianceStatus,
      blockchainVerification: verification,
    };
    
    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});