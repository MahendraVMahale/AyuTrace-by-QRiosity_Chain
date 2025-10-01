// Core domain types for Ayurvedic herbal traceability

export type Role = 'collector' | 'processor' | 'lab' | 'manufacturer' | 'consumer' | 'regulator';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  timestamp: string;
}

export interface FHIRMetadata {
  resourceType: string;
  id: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueDateTime?: string;
    valueCodeableConcept?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
}

// Collection Event
export interface CollectionEvent {
  id: string;
  lotId: string;
  collectorId: string;
  species: string; // Botanical name
  commonName: string;
  partUsed: string; // root, leaf, flower, etc.
  quantityKg: number;
  collectionDate: string;
  location: GeoLocation;
  weatherConditions?: string;
  soilType?: string;
  wildHarvested: boolean;
  organicCertified: boolean;
  fhirMetadata: FHIRMetadata;
  blockchainTxId?: string;
  createdAt: string;
}

// Processing Event
export interface ProcessingEvent {
  id: string;
  lotId: string;
  processorId: string;
  processType: 'cleaning' | 'drying' | 'grinding' | 'extraction' | 'decoction';
  inputQuantityKg: number;
  outputQuantityKg: number;
  processDate: string;
  temperature?: number;
  duration?: number; // in minutes
  equipment?: string;
  location: GeoLocation;
  fhirMetadata: FHIRMetadata;
  blockchainTxId?: string;
  createdAt: string;
}

// Quality Test Event
export interface QualityTestEvent {
  id: string;
  lotId: string;
  labId: string;
  testDate: string;
  testType: 'microbial' | 'heavy-metals' | 'pesticide' | 'potency' | 'authenticity';
  parameters: Record<string, {
    measured: number | string;
    unit: string;
    threshold: {
      min?: number;
      max?: number;
      acceptable?: string[];
    };
    status: 'pass' | 'fail' | 'warning';
  }>;
  overallStatus: 'pass' | 'fail' | 'conditional';
  certificationNumber?: string;
  certificationBody?: string;
  labAccreditation?: string;
  fhirMetadata: FHIRMetadata;
  blockchainTxId?: string;
  createdAt: string;
}

// Pack/SKU
export interface Pack {
  id: string; // QR code scannable ID
  lotId: string;
  manufacturerId: string;
  sku: string;
  productName: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  netWeight: string;
  ingredients: Array<{
    name: string;
    percentage: number;
    lotId?: string;
  }>;
  dosage?: string;
  storage?: string;
  ayushLicense?: string;
  gmpCertified: boolean;
  qrCodeUrl: string;
  fhirMetadata: FHIRMetadata;
  blockchainTxId?: string;
  createdAt: string;
}

// Lot (aggregates raw material)
export interface Lot {
  id: string;
  name: string;
  species: string;
  originRegion: string;
  status: 'collected' | 'processing' | 'tested' | 'approved' | 'rejected' | 'packed';
  currentQuantityKg: number;
  createdAt: string;
  updatedAt: string;
}

// Compliance Threshold
export interface ComplianceThreshold {
  id: string;
  testType: string;
  parameter: string;
  min?: number;
  max?: number;
  unit: string;
  regulatoryBody: string;
  standard: string; // e.g., "WHO", "AYUSH", "FDA"
  createdAt: string;
}

// Blockchain Ledger Entry (Corda-style)
export interface BlockchainEntry {
  txId: string;
  timestamp: string;
  eventType: 'collection' | 'processing' | 'quality-test' | 'pack-mint';
  eventId: string;
  lotId: string;
  previousTxId?: string;
  hash: string;
  participants: string[]; // participant IDs
  data: any;
  cordaFlowId?: string; // stub for Corda flow
}

// Consumer Provenance View
export interface ProvenanceTrace {
  pack: Pack;
  lot: Lot;
  collectionEvents: CollectionEvent[];
  processingEvents: ProcessingEvent[];
  qualityTests: QualityTestEvent[];
  blockchainPath: BlockchainEntry[];
  complianceStatus: {
    overallStatus: 'compliant' | 'non-compliant' | 'pending';
    details: Array<{
      checkpoint: string;
      status: 'pass' | 'fail' | 'pending';
      message: string;
    }>;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}