import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { lotsRouter } from './routes/lots';
import { collectionRouter } from './routes/collection';
import { processingRouter } from './routes/processing';
import { qualityRouter } from './routes/quality';
import { packsRouter } from './routes/packs';
import { provenanceRouter } from './routes/provenance';
import { blockchainRouter } from './routes/blockchain';
import { complianceRouter } from './routes/compliance';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ayurvedic Herbal Traceability API',
      version: '1.0.0',
      description: 'Complete traceability platform for Ayurvedic herbs from collection to consumer',
      contact: {
        name: 'AYUSH Ministry',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Lots', description: 'Raw material lot management' },
      { name: 'Collection', description: 'Field collection events' },
      { name: 'Processing', description: 'Processing events (drying, extraction, etc.)' },
      { name: 'Quality', description: 'Quality testing and certification' },
      { name: 'Packs', description: 'Finished product packaging and QR codes' },
      { name: 'Provenance', description: 'Consumer-facing traceability' },
      { name: 'Blockchain', description: 'Blockchain ledger operations' },
      { name: 'Compliance', description: 'Regulatory compliance and thresholds' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/lots', lotsRouter);
app.use('/api/collection', collectionRouter);
app.use('/api/processing', processingRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/packs', packsRouter);
app.use('/api/provenance', provenanceRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/compliance', complianceRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});