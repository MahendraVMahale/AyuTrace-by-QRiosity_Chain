// Repository layer: Wraps all Prisma calls with try/catch and fallbacks to memory store
import { 
  memLot, 
  memCollectionEvent, 
  memProcessingEvent, 
  memQualityTestEvent, 
  memPack, 
  memComplianceThreshold, 
  memBlockchainEntry 
} from './memory-store';

let prisma: any = null;

// Try to load Prisma
try {
  const db = require('@AyuTrace/database');
  prisma = db.prisma;
  console.log('✅ Repo layer using Prisma database');
} catch (error) {
  console.warn('⚠️  Prisma not available in repo layer, using memory store fallback');
}

// Helper function to wrap Prisma calls with fallback
async function withFallback<T>(
  prismaFn: () => Promise<T>,
  memoryFn: () => Promise<T>
): Promise<T> {
  if (!prisma) {
    return await memoryFn();
  }
  
  try {
    return await prismaFn();
  } catch (error) {
    console.warn('⚠️  Prisma call failed, falling back to memory store:', error);
    return await memoryFn();
  }
}

// Lot repository
export const repo = {
  lot: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.lot.findMany(params),
        () => memLot.findMany(params)
      );
    },
    
    findUnique: async (params: any) => {
      return withFallback(
        () => prisma.lot.findUnique(params),
        () => memLot.findUnique(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.lot.create(params),
        () => memLot.create(params)
      );
    },
    
    update: async (params: any) => {
      return withFallback(
        () => prisma.lot.update(params),
        () => memLot.update(params)
      );
    },
  },
  
  collectionEvent: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.collectionEvent.findMany(params),
        () => memCollectionEvent.findMany(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.collectionEvent.create(params),
        () => memCollectionEvent.create(params)
      );
    },
  },
  
  processingEvent: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.processingEvent.findMany(params),
        () => memProcessingEvent.findMany(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.processingEvent.create(params),
        () => memProcessingEvent.create(params)
      );
    },
  },
  
  qualityTestEvent: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.qualityTestEvent.findMany(params),
        () => memQualityTestEvent.findMany(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.qualityTestEvent.create(params),
        () => memQualityTestEvent.create(params)
      );
    },
  },
  
  pack: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.pack.findMany(params),
        () => memPack.findMany(params)
      );
    },
    
    findUnique: async (params: any) => {
      return withFallback(
        () => prisma.pack.findUnique(params),
        () => memPack.findUnique(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.pack.create(params),
        () => memPack.create(params)
      );
    },
  },
  
  complianceThreshold: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.complianceThreshold.findMany(params),
        () => memComplianceThreshold.findMany(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.complianceThreshold.create(params),
        () => memComplianceThreshold.create(params)
      );
    },
  },
  
  blockchainEntry: {
    findMany: async (params?: any) => {
      return withFallback(
        () => prisma.blockchainEntry.findMany(params),
        () => memBlockchainEntry.findMany(params)
      );
    },
    
    create: async (params: any) => {
      return withFallback(
        () => prisma.blockchainEntry.create(params),
        () => memBlockchainEntry.create(params)
      );
    },
  },
};