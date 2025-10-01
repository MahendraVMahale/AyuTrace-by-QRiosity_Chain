# 🚀 Quick Start Guide

Get the AyuTrace Platform running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

## Setup (3 commands)

```bash
# 1. Install all dependencies
pnpm install

# 2. Initialize database
pnpm db:push && pnpm db:seed

# 3. Start development (run in 2 separate terminals)
# Terminal 1:
pnpm dev:api

# Terminal 2:
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs

## Test the Platform

### Option 1: Use the UI

1. **Create a Lot**: Visit http://localhost:3000/collector
2. **Add Processing**: Visit http://localhost:3000/processor
3. **Quality Test**: Visit http://localhost:3000/lab
4. **Mint Pack**: Visit http://localhost:3000/manufacturer
5. **View Provenance**: Visit http://localhost:3000/provenance-scan

### Option 2: Use the API

Run these curl commands in sequence:

```bash
# 1. Create a lot
curl -X POST http://localhost:4000/api/lots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TURMERIC-2024-001",
    "species": "Curcuma longa",
    "originRegion": "Kerala, India",
    "currentQuantityKg": 0
  }'

# Note the lot ID returned, use it in subsequent commands

# 2. Record collection
curl -X POST http://localhost:4000/api/collection \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID",
    "collectorId": "COL-001",
    "species": "Curcuma longa",
    "commonName": "Turmeric",
    "partUsed": "rhizome",
    "quantityKg": 100,
    "collectionDate": "2024-01-15",
    "location": {"lat": 10.8505, "lng": 76.2711},
    "wildHarvested": false,
    "organicCertified": true
  }'

# 3. Record processing
curl -X POST http://localhost:4000/api/processing \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID",
    "processorId": "PROC-001",
    "processType": "drying",
    "inputQuantityKg": 100,
    "outputQuantityKg": 90,
    "processDate": "2024-01-20",
    "location": {"lat": 10.8505, "lng": 76.2711}
  }'

# 4. Quality test
curl -X POST http://localhost:4000/api/quality \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID",
    "labId": "LAB-001",
    "testDate": "2024-01-25",
    "testType": "heavy-metals",
    "parameters": {
      "lead": {"measured": 2.5, "unit": "ppm"},
      "mercury": {"measured": 0.3, "unit": "ppm"}
    }
  }'

# 5. Mint pack
curl -X POST http://localhost:4000/api/packs \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID",
    "manufacturerId": "MFG-001",
    "sku": "TRM-CAP-500",
    "productName": "Turmeric Capsules",
    "batchNumber": "BATCH-001",
    "manufactureDate": "2024-02-01",
    "expiryDate": "2026-02-01",
    "netWeight": "60 capsules",
    "ingredients": [{"name": "Turmeric Extract", "percentage": 100}],
    "gmpCertified": true
  }'

# Note the pack ID returned

# 6. View provenance
curl http://localhost:4000/api/provenance/YOUR_PACK_ID
```

## Key Features to Test

✅ **Geo-location tracking** - Collection events capture GPS coordinates  
✅ **Blockchain verification** - Each event recorded on immutable ledger  
✅ **Compliance checking** - Auto-validates against AYUSH/WHO standards  
✅ **QR code generation** - Unique codes for consumer scanning  
✅ **Complete traceability** - View entire journey from field to consumer  
✅ **FHIR metadata** - Healthcare-standard data structures  

## Database Management

```bash
# View data in Prisma Studio
pnpm db:studio

# Reset database
pnpm db:push

# Reseed sample data
pnpm db:seed
```

## Troubleshooting

**API not connecting?**
- Ensure port 4000 is available
- Check if API server is running: `pnpm dev:api`

**Database errors?**
- Run `pnpm db:push` to reset schema
- Run `pnpm db:seed` to add sample data

**Frontend not loading?**
- Ensure port 3000 is available
- Check if Next.js is running: `pnpm dev`

**CORS errors?**
- API is configured to accept requests from all origins
- Check browser console for specific error

## Next Steps

📖 **Full Documentation**: See [README.md](README.md)  
📚 **API Reference**: http://localhost:4000/api-docs  
🔧 **Role Guides**: Check README for collector, processor, lab, manufacturer guides  
🏗️ **Production Setup**: See deployment section in README  

## Support

- Issues: Open on GitHub
- Documentation: Full Swagger API docs at `/api-docs`
- Architecture: See README.md for complete details

---

**Ready to trace!** 🌿