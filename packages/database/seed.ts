import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed users
  console.log("Creating demo users...");
  const users = [
    { name: "Asha Collector", email: "collector@demo.in", role: Role.COLLECTOR, pwd: "collector123" },
    { name: "Prem Processor", email: "processor@demo.in", role: Role.PROCESSOR, pwd: "processor123" },
    { name: "Lakshmi Lab", email: "lab@demo.in", role: Role.LAB, pwd: "lab123" },
    { name: "Maya Manufacturer", email: "manufacturer@demo.in", role: Role.MANUFACTURER, pwd: "manufacturer123" },
    { name: "Ravi Regulator", email: "regulator@demo.in", role: Role.REGULATOR, pwd: "regulator123" },
    { name: "Admin Admin", email: "admin@demo.in", role: Role.ADMIN, pwd: "admin123" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.pwd, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, password: hash, role: u.role },
    });
    console.log(`✅ Created user: ${u.email} (${u.role})`);
  }

  // Seed compliance thresholds
  console.log("\nCreating compliance thresholds...");
  const thresholds = [
    {
      testType: "microbial",
      parameter: "total_aerobic_count",
      max: 100000,
      unit: "CFU/g",
      regulatoryBody: "AYUSH",
      standard: "AS 3.6.1",
    },
    {
      testType: "heavy-metals",
      parameter: "lead",
      max: 10,
      unit: "ppm",
      regulatoryBody: "AYUSH",
      standard: "AS 2.3.13",
    },
    {
      testType: "pesticide",
      parameter: "organophosphates",
      max: 0.1,
      unit: "ppm",
      regulatoryBody: "FSSAI",
      standard: "PFA-1954",
    },
  ];

  for (const t of thresholds) {
    await prisma.complianceThreshold.upsert({
      where: { id: `${t.testType}-${t.parameter}` },
      update: {},
      create: { id: `${t.testType}-${t.parameter}`, ...t },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });