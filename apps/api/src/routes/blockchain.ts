import { Router } from 'express';
import { blockchain } from '../blockchain';
import { db } from '../db';

export const blockchainRouter = Router();

/**
 * @swagger
 * /api/blockchain/verify/{lotId}:
 *   get:
 *     tags: [Blockchain]
 *     summary: Verify blockchain integrity for a lot
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification result
 */
blockchainRouter.get('/verify/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    
    const result = await blockchain.verifyChain(lotId);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/blockchain/chain/{lotId}:
 *   get:
 *     tags: [Blockchain]
 *     summary: Get blockchain chain for a lot
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blockchain entries
 */
blockchainRouter.get('/chain/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    
    const chain = await blockchain.getChainForLot(lotId);
    
    const parsed = chain.map((entry: any) => ({
      ...entry,
      participants: JSON.parse(entry.participants),
      data: JSON.parse(entry.data),
    }));
    
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/blockchain/corda/flows:
 *   get:
 *     tags: [Blockchain]
 *     summary: List Corda flows (stub)
 *     responses:
 *       200:
 *         description: Available Corda flows
 */
blockchainRouter.get('/corda/flows', async (req, res) => {
  try {
    const flows = [
      { name: 'RecordCollectionFlow', description: 'Records a collection event on Corda network' },
      { name: 'RecordProcessingFlow', description: 'Records a processing event' },
      { name: 'RecordQualityTestFlow', description: 'Records quality test results' },
      { name: 'MintPackFlow', description: 'Mints a consumer pack on blockchain' },
      { name: 'TransferOwnershipFlow', description: 'Transfers lot ownership between parties' },
    ];
    
    res.json({ success: true, data: flows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/blockchain/corda/vault:
 *   get:
 *     tags: [Blockchain]
 *     summary: Query Corda vault (stub)
 *     responses:
 *       200:
 *         description: Vault query results
 */
blockchainRouter.get('/corda/vault', async (req, res) => {
  try {
    // In production, this would query the actual Corda vault
    const allEntries = await db.blockchainEntry.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    
    const parsed = allEntries.map((entry: any) => ({
      ...entry,
      participants: JSON.parse(entry.participants),
      data: JSON.parse(entry.data),
    }));
    
    res.json({ 
      success: true, 
      data: {
        states: parsed,
        statesMetadata: {
          totalStates: parsed.length,
          consumed: 0,
          unconsumed: parsed.length,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});