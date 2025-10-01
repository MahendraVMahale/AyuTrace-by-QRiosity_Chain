// Graceful fallback: Try Prisma, fallback to in-memory storage
import type { 
  Lot, 
  CollectionEvent, 
  ProcessingEvent, 
  QualityTestEvent, 
  Pack, 
  ComplianceThreshold,
  BlockchainEntry 
} from '@AyuTrace/shared-types';

let prisma: any = null;
let usePrisma = true;

try {
  const db = require('@AyuTrace/database');
  prisma = db.prisma;
  console.log('✅ Using Prisma database');
} catch (error) {
  console.warn('⚠️  Prisma not available, using in-memory storage');
  usePrisma = false;
}

// In-memory storage
const memoryStore = {
  lots: [] as any[],
  collectionEvents: [] as any[],
  processingEvents: [] as any[],
  qualityTests: [] as any[],
  packs: [] as any[],
  complianceThresholds: [] as any[],
  blockchainEntries: [] as any[],
};

export const db = {
  lot: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.lot.findMany(params);
      }
      return memoryStore.lots;
    },
    findUnique: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.lot.findUnique(params);
      }
      return memoryStore.lots.find((l) => l.id === params.where.id);
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.lot.create(params);
      }
      const newLot = {
        id: `lot_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryStore.lots.push(newLot);
      return newLot;
    },
    update: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.lot.update(params);
      }
      const index = memoryStore.lots.findIndex((l) => l.id === params.where.id);
      if (index !== -1) {
        memoryStore.lots[index] = { ...memoryStore.lots[index], ...params.data, updatedAt: new Date().toISOString() };
        return memoryStore.lots[index];
      }
      throw new Error('Lot not found');
    },
  },
  collectionEvent: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.collectionEvent.findMany(params);
      }
      if (params?.where?.lotId) {
        return memoryStore.collectionEvents.filter((e) => e.lotId === params.where.lotId);
      }
      return memoryStore.collectionEvents;
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.collectionEvent.create(params);
      }
      const newEvent = {
        id: `col_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.collectionEvents.push(newEvent);
      return newEvent;
    },
  },
  processingEvent: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.processingEvent.findMany(params);
      }
      if (params?.where?.lotId) {
        return memoryStore.processingEvents.filter((e) => e.lotId === params.where.lotId);
      }
      return memoryStore.processingEvents;
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.processingEvent.create(params);
      }
      const newEvent = {
        id: `proc_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.processingEvents.push(newEvent);
      return newEvent;
    },
  },
  qualityTestEvent: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.qualityTestEvent.findMany(params);
      }
      if (params?.where?.lotId) {
        return memoryStore.qualityTests.filter((e) => e.lotId === params.where.lotId);
      }
      return memoryStore.qualityTests;
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.qualityTestEvent.create(params);
      }
      const newTest = {
        id: `test_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.qualityTests.push(newTest);
      return newTest;
    },
  },
  pack: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.pack.findMany(params);
      }
      return memoryStore.packs;
    },
    findUnique: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.pack.findUnique(params);
      }
      return memoryStore.packs.find((p) => p.id === params.where.id);
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.pack.create(params);
      }
      const newPack = {
        id: `pack_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.packs.push(newPack);
      return newPack;
    },
  },
  complianceThreshold: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.complianceThreshold.findMany(params);
      }
      return memoryStore.complianceThresholds;
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.complianceThreshold.create(params);
      }
      const newThreshold = {
        id: `threshold_${Date.now()}`,
        ...params.data,
        createdAt: new Date().toISOString(),
      };
      memoryStore.complianceThresholds.push(newThreshold);
      return newThreshold;
    },
  },
  blockchainEntry: {
    findMany: async (params?: any) => {
      if (usePrisma && prisma) {
        return await prisma.blockchainEntry.findMany(params);
      }
      if (params?.where?.lotId) {
        return memoryStore.blockchainEntries.filter((e) => e.lotId === params.where.lotId);
      }
      return memoryStore.blockchainEntries;
    },
    create: async (params: any) => {
      if (usePrisma && prisma) {
        return await prisma.blockchainEntry.create(params);
      }
      const newEntry = {
        txId: `tx_${Date.now()}`,
        ...params.data,
        timestamp: new Date().toISOString(),
      };
      memoryStore.blockchainEntries.push(newEntry);
      return newEntry;
    },
  },
};