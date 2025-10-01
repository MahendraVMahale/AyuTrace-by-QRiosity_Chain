// In-memory fallback storage
interface MemoryStore {
  lots: any[];
  collectionEvents: any[];
  processingEvents: any[];
  qualityTests: any[];
  packs: any[];
  complianceThresholds: any[];
  blockchainEntries: any[];
}

const store: MemoryStore = {
  lots: [],
  collectionEvents: [],
  processingEvents: [],
  qualityTests: [],
  packs: [],
  complianceThresholds: [],
  blockchainEntries: [],
};

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Lot operations
export const memLot = {
  findMany: async (params?: any) => {
    let results = [...store.lots];
    if (params?.orderBy?.createdAt === 'desc') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return results;
  },
  
  findUnique: async (params: any) => {
    return store.lots.find(l => l.id === params.where.id) || null;
  },
  
  create: async (params: any) => {
    const newLot = {
      id: generateId('lot'),
      ...params.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.lots.push(newLot);
    return newLot;
  },
  
  update: async (params: any) => {
    const index = store.lots.findIndex(l => l.id === params.where.id);
    if (index === -1) throw new Error('Lot not found');
    store.lots[index] = {
      ...store.lots[index],
      ...params.data,
      updatedAt: new Date().toISOString(),
    };
    return store.lots[index];
  },
};

// Collection event operations
export const memCollectionEvent = {
  findMany: async (params?: any) => {
    let results = [...store.collectionEvents];
    if (params?.where?.lotId) {
      results = results.filter(e => e.lotId === params.where.lotId);
    }
    if (params?.orderBy?.collectionDate === 'desc') {
      results.sort((a, b) => new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime());
    }
    return results;
  },
  
  create: async (params: any) => {
    const newEvent = {
      id: generateId('col'),
      ...params.data,
      createdAt: new Date().toISOString(),
    };
    store.collectionEvents.push(newEvent);
    return newEvent;
  },
};

// Processing event operations
export const memProcessingEvent = {
  findMany: async (params?: any) => {
    let results = [...store.processingEvents];
    if (params?.where?.lotId) {
      results = results.filter(e => e.lotId === params.where.lotId);
    }
    if (params?.orderBy?.processDate === 'desc') {
      results.sort((a, b) => new Date(b.processDate).getTime() - new Date(a.processDate).getTime());
    }
    return results;
  },
  
  create: async (params: any) => {
    const newEvent = {
      id: generateId('proc'),
      ...params.data,
      createdAt: new Date().toISOString(),
    };
    store.processingEvents.push(newEvent);
    return newEvent;
  },
};

// Quality test operations
export const memQualityTestEvent = {
  findMany: async (params?: any) => {
    let results = [...store.qualityTests];
    if (params?.where?.lotId) {
      results = results.filter(e => e.lotId === params.where.lotId);
    }
    if (params?.where?.testType) {
      results = results.filter(e => e.testType === params.where.testType);
    }
    if (params?.orderBy?.testDate === 'desc') {
      results.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
    }
    return results;
  },
  
  create: async (params: any) => {
    const newTest = {
      id: generateId('test'),
      ...params.data,
      createdAt: new Date().toISOString(),
    };
    store.qualityTests.push(newTest);
    return newTest;
  },
};

// Pack operations
export const memPack = {
  findMany: async (params?: any) => {
    let results = [...store.packs];
    if (params?.where?.lotId) {
      results = results.filter(p => p.lotId === params.where.lotId);
    }
    if (params?.orderBy?.createdAt === 'desc') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return results;
  },
  
  findUnique: async (params: any) => {
    return store.packs.find(p => p.id === params.where.id) || null;
  },
  
  create: async (params: any) => {
    const newPack = {
      ...params.data,
      createdAt: new Date().toISOString(),
    };
    store.packs.push(newPack);
    return newPack;
  },
};

// Compliance threshold operations
export const memComplianceThreshold = {
  findMany: async (params?: any) => {
    let results = [...store.complianceThresholds];
    if (params?.where?.testType) {
      results = results.filter(t => t.testType === params.where.testType);
    }
    return results;
  },
  
  create: async (params: any) => {
    const newThreshold = {
      id: generateId('threshold'),
      ...params.data,
      createdAt: new Date().toISOString(),
    };
    store.complianceThresholds.push(newThreshold);
    return newThreshold;
  },
};

// Blockchain entry operations
export const memBlockchainEntry = {
  findMany: async (params?: any) => {
    let results = [...store.blockchainEntries];
    if (params?.where?.lotId) {
      results = results.filter(e => e.lotId === params.where.lotId);
    }
    if (params?.orderBy?.timestamp === 'desc') {
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return results;
  },
  
  create: async (params: any) => {
    const newEntry = {
      txId: generateId('tx'),
      ...params.data,
      timestamp: new Date().toISOString(),
    };
    store.blockchainEntries.push(newEntry);
    return newEntry;
  },
};