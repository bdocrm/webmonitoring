import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@websitemonitoring.com' },
    update: {},
    create: {
      email: 'admin@websitemonitoring.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Create websites to monitor
  const websites = [
    {
      domain: 'allianzsynergia.com.ph',
      displayName: 'Allianz Synergia',
      description: 'Main company website',
    },
  ];

  for (const website of websites) {
    const created = await prisma.website.upsert({
      where: { domain: website.domain },
      update: {},
      create: {
        ...website,
        isActive: true,
        seoMetrics: {
          create: {
            siteHealthScore: Math.floor(Math.random() * 30) + 65,
            aiSearchHealth: Math.floor(Math.random() * 20) + 75,
            crawlability: Math.floor(Math.random() * 15) + 80,
            internalLinking: Math.floor(Math.random() * 20) + 75,
            totalPages: Math.floor(Math.random() * 200) + 50,
            pagesCrawled: Math.floor(Math.random() * 150) + 30,
          },
        },
        securityMetrics: {
          create: {
            securityRating: Math.floor(Math.random() * 150) + 750,
            httpsStatus: true,
            sslCertificateValid: true,
            hasCSP: true,
            hasXFrameOptions: true,
            hasHSTS: true,
            hasXContentType: Math.random() > 0.5,
            hasXXSSProtection: Math.random() > 0.5,
          },
        },
        analytics: {
          create: {
            performanceScore: Math.floor(Math.random() * 20) + 70,
            fcp: Math.floor(Math.random() * 2000) + 1000,
            lcp: Math.floor(Math.random() * 2000) + 2000,
            speedIndex: Math.floor(Math.random() * 3000) + 2000,
            cls: Math.random() * 0.5,
          },
        },
      },
    });

    console.log(`✅ Website created: ${created.displayName}`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
