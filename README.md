# AyuTrace Platform

A complete, blockchain-verified traceability system for Ayurvedic herbal supply chains - from field collection to consumer product.

![Platform Overview](https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=400&fit=crop)

## 🌿 Overview

This monorepo implements a full-stack traceability platform for the Ayurvedic medicine industry, ensuring quality, authenticity, and regulatory compliance at every step of the supply chain.

### Key Features

- **🔗 Blockchain Verified**: Immutable audit trail using permissioned blockchain (Corda integration stubs)
- **📱 QR Code Provenance**: Consumer-facing product journey verification
- **🏥 FHIR Compliant**: Healthcare interoperability standards for metadata
- **📍 Geo-Tagged Events**: Location verification for collection and processing
- **✅ Compliance Checking**: Automated regulatory threshold validation (AYUSH, WHO, FSSAI)
- **🔄 Complete Flow**: Collection → Processing → Quality Testing → Pack Minting → Consumer View
- **🔐 Role-Based Authentication**: Secure access control with NextAuth and JWT tokens

## 🏗️ Architecture

### Monorepo Structure

```
AyuTrace/
├── packages/
│   ├── shared-types/          # TypeScript types shared across apps
│   └── database/              # Prisma schema & SQLite database
├── apps/
│   ├── api/                   # Express REST API with Swagger docs
│   └── (Next.js frontend in root)
├── src/                       # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Platform homepage
│   │   ├── collector/        # Field collection module
│   │   ├── processor/        # Processing module
│   │   ├── lab/              # Quality testing module
│   │   ├── manufacturer/     # Pack minting module
│   │   ├── provenance-scan/  # QR scanner
│   │   └── provenance/[id]/  # Consumer provenance view
│   └── components/ui/        # Shadcn UI components
└── pnpm-workspace.yaml       # Monorepo configuration
```

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI components
- Lucide icons

**Backend:**
- Express.js
- Prisma ORM
- SQLite database
- Swagger/OpenAPI docs
- QR code generation

**Blockchain:**
- Custom blockchain ledger
- SHA-256 hashing
- Corda adapter stubs (production-ready integration points)

## 🔐 Authentication & User Management

### Overview

The platform implements secure role-based authentication using:
- **NextAuth (Auth.js)** with Credentials provider for the web app
- **JWT strategy** for stateless session management
- **PostgreSQL** via Prisma for user storage
- **bcrypt** for password hashing (cost factor 10)
- **jose** library for JWT verification on API routes

### User Roles

Six distinct roles with specific permissions:

1. **COLLECTOR** - Field collection event recording
2. **PROCESSOR** - Processing stage documentation
3. **LAB** - Quality testing and certification
4. **MANUFACTURER** - Pack minting and QR generation
5. **REGULATOR** - Compliance monitoring and threshold management
6. **ADMIN** - Full access to all modules

### Demo User Accounts

The following demo accounts are seeded automatically:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `collector@demo.in` | `collector123` | COLLECTOR | Collection module |
| `processor@demo.in` | `processor123` | PROCESSOR | Processing module |
| `lab@demo.in` | `lab123` | LAB | Quality testing module |
| `manufacturer@demo.in` | `manufacturer123` | MANUFACTURER | Pack minting module |
| `regulator@demo.in` | `regulator123` | REGULATOR | Compliance dashboard |
| `admin@demo.in` | `admin123` | ADMIN | All modules |

### Authentication Flow

1. **Login**: User submits email/password at `/login`
2. **Verification**: NextAuth validates credentials against database
3. **JWT Creation**: Successful login creates JWT with user ID and role
4. **Session Storage**: JWT stored in session cookie
5. **Page Access**: Protected pages check role via `useSession()` hook
6. **API Calls**: JWT sent as Bearer token in Authorization header
7. **API Verification**: Express middleware validates JWT and role

### Protected Routes

**Next.js Pages** (role-based):
- `/collector` - COLLECTOR, ADMIN
- `/processor` - PROCESSOR, ADMIN
- `/lab` - LAB, ADMIN
- `/manufacturer` - MANUFACTURER, ADMIN
- `/compliance` - REGULATOR, ADMIN

**Public Routes** (no authentication):
- `/` - Homepage
- `/login` - Login page
- `/provenance-scan` - QR scanner
- `/provenance/[id]` - Consumer provenance view

**API Endpoints** (role-protected):
- `POST /api/collection` - COLLECTOR, ADMIN
- `POST /api/processing` - PROCESSOR, ADMIN
- `POST /api/quality` - LAB, ADMIN
- `POST /api/packs` - MANUFACTURER, ADMIN
- `GET /api/compliance/*` - REGULATOR, ADMIN

**Public API Endpoints**:
- `GET /api/provenance/:packId` - Public consumer access
- `GET /api/packs/:id` - Public pack details
- `GET /api/blockchain/verify/:lotId` - Public chain verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- **PostgreSQL database** (local or Neon/Supabase)

### Installation

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

**API** (`apps/api/.env`):
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
CONSUMER_BASE=http://localhost:3000
CHAIN=dummy
DATABASE_URL="postgresql://user:password@localhost:5432/AyuTrace?schema=public"
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-change-this-in-production"
```

**Web** (`.env.local` in root):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-change-this-in-production"
NEXT_PUBLIC_API_BASE=http://localhost:3001
DATABASE_URL="postgresql://user:password@localhost:5432/AyuTrace?schema=public"
```

> **Important**: Use the same `NEXTAUTH_SECRET` in both API and Web for JWT verification to work.

3. **Generate secret** (recommended):

```bash
openssl rand -base64 32
```

4. **Initialize database:**

```bash
cd packages/database

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed demo users and compliance thresholds
pnpm db:seed
```

5. **Start API server:**

```bash
cd apps/api
pnpm dev
# API runs on http://localhost:3001
# Swagger docs at http://localhost:3001/api-docs
```

6. **Start Next.js frontend (in separate terminal):**

```bash
pnpm dev
# Frontend runs on http://localhost:3000
```

### First Login

1. Navigate to http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Use any demo account (e.g., `collector@demo.in` / `collector123`)
4. You'll be redirected to your role's dashboard

## 📋 Complete Demo Flow (Authenticated)

### Step 0: Login

```bash
# Or use the web UI at /login
# For API testing, get a JWT token (simplified example)
```

### Step 1: Create a Lot (ADMIN role)

```bash
curl -X POST http://localhost:3001/api/lots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "ASHWAGANDHA-2024-001",
    "species": "Withania somnifera",
    "originRegion": "Madhya Pradesh, India",
    "currentQuantityKg": 0
  }'
```

### Step 2: Record Collection Event (COLLECTOR role)

**Via UI**: 
1. Login as `collector@demo.in`
2. Navigate to http://localhost:3000/collector
3. Fill out the form

**Via API with JWT**:
```bash
curl -X POST http://localhost:3001/api/collection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "lotId": "clx123abc...",
    "collectorId": "COL-001",
    "species": "Withania somnifera",
    "commonName": "Ashwagandha",
    "partUsed": "root",
    "quantityKg": 200,
    "collectionDate": "2024-01-15T00:00:00Z",
    "location": {
      "lat": 23.2599,
      "lng": 77.4126,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "weatherConditions": "Sunny, 26°C",
    "soilType": "Black cotton soil",
    "wildHarvested": false,
    "organicCertified": true
  }'
```

> **Note**: JWT tokens are automatically included when using the authenticated UI. For API testing, extract the JWT from your browser's session cookie or use the auth helper functions.

### Step 3: Record Processing Event (PROCESSOR role)

Login as `processor@demo.in` and navigate to http://localhost:3000/processor

**Via API**:
```bash
curl -X POST http://localhost:3001/api/processing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "lotId": "clx123abc...",
    "processorId": "PROC-001",
    "processType": "drying",
    "inputQuantityKg": 200,
    "outputQuantityKg": 180,
    "processDate": "2024-01-20T00:00:00Z",
    "temperature": 50,
    "duration": 240,
    "equipment": "Solar dryer",
    "location": {
      "lat": 23.2599,
      "lng": 77.4126,
      "timestamp": "2024-01-20T14:00:00Z"
    }
  }'
```

**Result**: Processing recorded, lot status updated to "processing".

### Step 4: Conduct Quality Tests (LAB role)

Login as `lab@demo.in` and navigate to http://localhost:3000/lab

**Via API**:
```bash
curl -X POST http://localhost:3001/api/quality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "lotId": "clx123abc...",
    "labId": "LAB-NABL-001",
    "testDate": "2024-01-25T00:00:00Z",
    "testType": "heavy-metals",
    "parameters": {
      "lead": {
        "measured": 2.5,
        "unit": "ppm"
      },
      "mercury": {
        "measured": 0.3,
        "unit": "ppm"
      },
      "arsenic": {
        "measured": 1.2,
        "unit": "ppm"
      }
    },
    "certificationNumber": "CERT-2024-001",
    "certificationBody": "NABL",
    "labAccreditation": "ISO/IEC 17025:2017"
  }'
```

**Result**: Test results validated against regulatory thresholds, lot status updated to "approved" or "rejected".

### Step 5: Mint Consumer Pack (MANUFACTURER role)

Login as `manufacturer@demo.in` and navigate to http://localhost:3000/manufacturer

**Via API**:
```bash
curl -X POST http://localhost:3001/api/packs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "lotId": "clx123abc...",
    "manufacturerId": "MFG-001",
    "sku": "ASH-CAP-500",
    "productName": "Ashwagandha Capsules",
    "batchNumber": "BATCH-2024-001",
    "manufactureDate": "2024-02-01T00:00:00Z",
    "expiryDate": "2026-02-01T00:00:00Z",
    "netWeight": "60 capsules / 500mg each",
    "ingredients": [
      {
        "name": "Ashwagandha Root Extract",
        "percentage": 95
      },
      {
        "name": "Cellulose (capsule)",
        "percentage": 5
      }
    ],
    "dosage": "1-2 capsules twice daily with milk or water",
    "storage": "Store in cool, dry place away from sunlight",
    "ayushLicense": "AYUSH-LIC-2024-001",
    "gmpCertified": true
  }'
```

**Result**: Pack created with unique ID and QR code, blockchain record finalized.

### Step 6: Verify Consumer Provenance (PUBLIC - No Auth Required)

**Via UI**: 
1. Navigate to http://localhost:3000/provenance-scan (no login needed)
2. Enter the pack ID returned from Step 5
3. View complete traceability information

**Via API (Public endpoint)**:
```bash
curl http://localhost:3001/api/provenance/PACK-xxxxxxxxx
# No Authorization header needed
```

**Result**: Complete provenance trace showing:
- Product information
- Collection events with geo-location
- Processing stages
- Quality test results
- Compliance status
- Blockchain verification

## 🔍 API Documentation

### Base URL
```
http://localhost:3001
```

### Interactive Docs
Full Swagger/OpenAPI documentation available at:
```
http://localhost:3001/api-docs
```

### Key Endpoints

#### Lots
- `GET /api/lots` - List all lots
- `POST /api/lots` - Create new lot
- `GET /api/lots/:id` - Get lot details
- `PATCH /api/lots/:id/status` - Update lot status

#### Collection
- `GET /api/collection` - List collection events
- `POST /api/collection` - Record collection event

#### Processing
- `GET /api/processing` - List processing events
- `POST /api/processing` - Record processing event

#### Quality
- `GET /api/quality` - List quality tests
- `POST /api/quality` - Record quality test

#### Packs
- `GET /api/packs` - List packs
- `POST /api/packs` - Mint new pack with QR
- `GET /api/packs/:id` - Get pack details

#### Provenance
- `GET /api/provenance/:packId` - Get complete provenance trace

#### Blockchain
- `GET /api/blockchain/verify/:lotId` - Verify chain integrity
- `GET /api/blockchain/chain/:lotId` - Get blockchain entries
- `GET /api/blockchain/corda/flows` - List Corda flows (stub)
- `GET /api/blockchain/corda/vault` - Query Corda vault (stub)

#### Compliance
- `GET /api/compliance/thresholds` - Get regulatory thresholds
- `POST /api/compliance/thresholds` - Add threshold
- `GET /api/compliance/report/:lotId` - Generate compliance report

## 👥 Role Guides

### Authentication Required

All role-specific modules require authentication. Login at http://localhost:3000/login with the appropriate demo account.

### Field Collector
**Access**: http://localhost:3000/collector  
**Demo Account**: `collector@demo.in` / `collector123`

**Responsibilities:**
- Record field collection events
- Capture botanical information
- Add geo-location data
- Mark organic/wild-harvested status

**Required Data:**
- Lot ID
- Collector ID
- Species (botanical name)
- Part used (root, leaf, etc.)
- Quantity in kg
- Collection date & location

### Processor
**Access**: http://localhost:3000/processor  
**Demo Account**: `processor@demo.in` / `processor123`

**Responsibilities:**
- Record processing stages
- Track input/output quantities
- Document process parameters

**Process Types:**
- Cleaning
- Drying
- Grinding
- Extraction
- Decoction

### Quality Lab
**Access**: http://localhost:3000/lab  
**Demo Account**: `lab@demo.in` / `lab123`

**Responsibilities:**
- Conduct compliance testing
- Record test parameters
- Validate against thresholds

**Test Types:**
- Microbial
- Heavy metals
- Pesticide residue
- Potency/active compounds
- Authenticity

**Auto-checked against:**
- AYUSH standards
- WHO guidelines
- FSSAI limits

### Manufacturer
**Access**: http://localhost:3000/manufacturer  
**Demo Account**: `manufacturer@demo.in` / `manufacturer123`

**Responsibilities:**
- Create consumer packs
- Generate QR codes
- Record formulation details
- Add regulatory certifications

**Outputs:**
- Unique pack ID
- QR code (data URL)
- Blockchain-verified record

### Regulator
**Access**: http://localhost:3000/compliance  
**Demo Account**: `regulator@demo.in` / `regulator123`

**Responsibilities:**
- Monitor compliance across all lots
- Set regulatory thresholds
- Generate compliance reports
- Review flagged tests

### Administrator
**All Modules**: Full platform access  
**Demo Account**: `admin@demo.in` / `admin123`

**Capabilities:**
- Access all role modules
- Manage users (future feature)
- Override permissions
- System configuration

### Consumer
**Access**: http://localhost:3000/provenance-scan  
**Authentication**: **Not required** (public access)

**Capabilities:**
- Scan QR code on product
- View complete product journey
- Verify blockchain integrity
- Check compliance status

## 🔐 Blockchain Features

### Immutable Audit Trail

Each event creates a blockchain entry with:
- Unique transaction ID
- SHA-256 hash
- Link to previous transaction
- Participant IDs
- Timestamp
- Event data

### Verification

Chain integrity can be verified at any time:
```bash
curl http://localhost:3001/api/blockchain/verify/LOT-ID
```

Returns:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Blockchain verified successfully"
  }
}
```

### Corda Integration (Stubs)

Production-ready integration points for Corda:
- `cordaStartFlow()` - Start Corda flow
- `cordaQueryVault()` - Query vault
- `cordaVerifyParty()` - Verify party identity

## 📊 Database Schema

### Core Tables

**Lot** - Raw material aggregation
- id, name, species, originRegion
- status, currentQuantityKg
- Relationships: collectionEvents, processingEvents, qualityTests, packs

**CollectionEvent** - Field collection records
- lotId, collectorId, species, partUsed
- quantityKg, collectionDate, location (JSON)
- wildHarvested, organicCertified
- fhirMetadata (JSON)

**ProcessingEvent** - Processing records
- lotId, processorId, processType
- inputQuantityKg, outputQuantityKg
- temperature, duration, equipment
- location (JSON), fhirMetadata (JSON)

**QualityTestEvent** - Test results
- lotId, labId, testType, testDate
- parameters (JSON), overallStatus
- certificationNumber, labAccreditation

**Pack** - Consumer products
- id, lotId, manufacturerId, sku
- productName, batchNumber
- manufactureDate, expiryDate
- ingredients (JSON), qrCodeUrl
- gmpCertified, ayushLicense

**ComplianceThreshold** - Regulatory limits
- testType, parameter
- min, max, unit
- regulatoryBody, standard

**BlockchainEntry** - Chain records
- txId, timestamp, eventType
- lotId, eventId, previousTxId
- hash, participants (JSON)
- cordaFlowId

## 🧪 Testing

### Database Operations

```bash
cd packages/database

# View database in Prisma Studio
pnpm db:studio

# Reset and reseed
pnpm db:push
pnpm db:seed
```

### API Testing

Use the provided Swagger UI or curl commands shown in the demo flow section.

### End-to-End Testing

1. Follow the complete demo flow (Steps 1-6)
2. Verify data in Prisma Studio
3. Check blockchain integrity
4. View consumer provenance

## 🌐 Deployment

### Production Considerations

**Database:**
- Replace SQLite with PostgreSQL (already configured in schema)
- Use managed service (Neon, Supabase, AWS RDS)
- Set `DATABASE_URL` environment variable
- Run migrations: `pnpx prisma migrate deploy`
- **Enable SSL**: Add `?sslmode=require` to DATABASE_URL

**Authentication:**
- **Generate new NEXTAUTH_SECRET**: Use `openssl rand -base64 32`
- **Same secret for API and Web**: Critical for JWT verification
- **HTTPS required**: For secure cookie transmission
- **Update NEXTAUTH_URL**: Set to production domain

**API Server:**
- Set `PORT` environment variable
- Enable CORS for frontend domain only
- Configure rate limiting (express-rate-limit)
- Set up monitoring (error tracking, performance)
- Configure Corda network connection

**Frontend:**
- Build: `pnpm build`
- Set `NEXT_PUBLIC_API_BASE` to production API URL
- Enable HTTPS
- Configure QR camera access permissions
- Set up CDN for static assets

**Blockchain:**
- Connect to Corda network
- Configure node participants
- Set up flow execution
- Implement vault queries

### Environment Variables

**API** (`apps/api/.env`):
```env
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
CONSUMER_BASE="https://yourdomain.com"
CHAIN=corda
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="production-secret-32-bytes-minimum"

# Corda (production)
CORDA_NODE_URL="https://node.cordanetwork.com"
CORDA_USERNAME="..."
CORDA_PASSWORD="..."
```

**Frontend** (`.env.local`):
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-32-bytes-minimum"
NEXT_PUBLIC_API_BASE="https://api.yourdomain.com"
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
```

### User Management (Production)

**Change Demo Passwords:**
```bash
# Connect to production database
psql $DATABASE_URL

# Update passwords (after hashing with bcrypt)
UPDATE "User" SET password = '$2b$10$...' WHERE email = 'collector@demo.in';
```

**Or use a management script:**
```typescript
// scripts/reset-password.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function resetPassword(email: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hash },
  });
  console.log(`Password updated for ${email}`);
}

// Usage: tsx scripts/reset-password.ts collector@yourdomain.com newStrongPassword
```

## 📚 Compliance Standards

### AYUSH (India)
- Ayurvedic Pharmacopoeia standards
- Good Manufacturing Practices (GMP)
- AYUSH license requirements

### WHO
- Traditional Medicine Strategy
- Quality control methods
- Safety guidelines

### FSSAI
- Food safety standards
- Pesticide residue limits
- Heavy metal thresholds

## 🤝 Contributing

This is a demo/reference implementation. For production use:

1. ✅ **DONE** - NextAuth with JWT
2. ✅ **DONE** - 6 roles implemented
3. Connect to production Corda network
4. Add comprehensive error handling
5. Implement audit logging
6. Add data encryption at rest
7. Configure automated backups
8. Add user management UI (create/edit/delete users)
9. Implement password reset flow
10. Add 2FA support

## 🔒 Security Notes

### Password Security

- **Hashing**: All passwords hashed with bcrypt (cost factor 10)
- **Salting**: Automatic per-password salt generation
- **Storage**: Never store plaintext passwords
- **Rotation**: Change demo passwords in production

### JWT Security

- **Secret**: Use cryptographically secure random string (32+ bytes)
- **Expiration**: Configure appropriate token expiration in `auth.ts`
- **Storage**: Tokens stored in httpOnly cookies (not localStorage)
- **Verification**: API validates signature, expiration, and role on every request

### Production Recommendations

1. **Change all demo passwords immediately**
2. **Rotate NEXTAUTH_SECRET regularly**
3. **Use HTTPS in production** (required for secure cookies)
4. **Implement rate limiting** on login endpoint
5. **Add password complexity requirements**
6. **Enable 2FA for sensitive roles** (ADMIN, REGULATOR)
7. **Audit log all authentication events**
8. **Set up session timeout** (e.g., 1 hour)
9. **Implement password reset flow**
10. **Add CSRF protection** (NextAuth handles this)

## 📄 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

- Ministry of AYUSH, Government of India
- Corda blockchain platform
- FHIR healthcare standards
- Open source community

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: ayush-tech@gov.in (example)
- Documentation: Full Swagger API docs included

---

**Built with ❤️ for the Ayurvedic medicine industry**