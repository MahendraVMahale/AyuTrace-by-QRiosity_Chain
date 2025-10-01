import crypto from 'crypto';
import { db } from './db';

// Dummy blockchain ledger with Corda adapter stubs
export class BlockchainLedger {
  /**
   * Record an event on the blockchain (Corda stub)
   */
  async recordEvent(
    eventType: 'collection' | 'processing' | 'quality-test' | 'pack-mint',
    eventId: string,
    lotId: string,
    data: any,
    participants: string[]
  ): Promise<string> {
    // Get previous transaction for chain
    const previousTx = await this.getLatestTxForLot(lotId);
    
    // Create hash
    const hash = this.createHash({
      eventType,
      eventId,
      lotId,
      previousTxId: previousTx?.txId,
      data,
      timestamp: new Date().toISOString(),
    });

    // Simulate Corda flow ID
    const cordaFlowId = `corda.flow.${eventType}.${Date.now()}`;

    // Create blockchain entry
    const entry = await db.blockchainEntry.create({
      data: {
        eventType,
        eventId,
        lotId,
        previousTxId: previousTx?.txId || null,
        hash,
        participants: JSON.stringify(participants),
        data: JSON.stringify(data),
        cordaFlowId,
      },
    });

    console.log(`⛓️  Blockchain entry created: ${entry.txId} (Corda: ${cordaFlowId})`);
    
    return entry.txId;
  }

  /**
   * Verify blockchain integrity for a lot
   */
  async verifyChain(lotId: string): Promise<{ valid: boolean; message: string }> {
    const entries = await db.blockchainEntry.findMany({
      where: { lotId },
    });

    if (entries.length === 0) {
      return { valid: true, message: 'No blockchain entries found' };
    }

    // Sort by timestamp
    const sorted = entries.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Verify chain
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      
      // Verify hash
      const data = JSON.parse(entry.data);
      const computedHash = this.createHash({
        eventType: entry.eventType,
        eventId: entry.eventId,
        lotId: entry.lotId,
        previousTxId: entry.previousTxId,
        data,
        timestamp: entry.timestamp,
      });

      if (computedHash !== entry.hash) {
        return { valid: false, message: `Hash mismatch at tx ${entry.txId}` };
      }

      // Verify previous link
      if (i > 0) {
        const prevEntry = sorted[i - 1];
        if (entry.previousTxId !== prevEntry.txId) {
          return { valid: false, message: `Chain break at tx ${entry.txId}` };
        }
      }
    }

    return { valid: true, message: 'Blockchain verified successfully' };
  }

  /**
   * Get blockchain path for a lot
   */
  async getChainForLot(lotId: string): Promise<any[]> {
    const entries = await db.blockchainEntry.findMany({
      where: { lotId },
    });

    return entries.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private async getLatestTxForLot(lotId: string) {
    const entries = await db.blockchainEntry.findMany({
      where: { lotId },
    });

    if (entries.length === 0) return null;

    return entries.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }

  private createHash(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Corda-specific adapter stubs
   */
  async cordaStartFlow(flowName: string, params: any): Promise<string> {
    console.log(`🔵 [Corda Stub] Starting flow: ${flowName}`, params);
    return `flow_${Date.now()}`;
  }

  async cordaQueryVault(query: string): Promise<any[]> {
    console.log(`🔵 [Corda Stub] Querying vault: ${query}`);
    return [];
  }

  async cordaVerifyParty(partyId: string): Promise<boolean> {
    console.log(`🔵 [Corda Stub] Verifying party: ${partyId}`);
    return true;
  }
}

export const blockchain = new BlockchainLedger();