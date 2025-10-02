import { PrismaClient, CompanyRole, CalendarType } from '@prisma/client';
import { hashPassword } from '../src/lib/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo owner user
  const ownerPassword = await hashPassword('password123');
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      password: ownerPassword,
      firstName: 'John',
      lastName: 'Owner',
      phone: '+36301234567',
    },
  });
  console.log('✅ Created owner user:', owner.email);

  // Create demo staff user
  const staffPassword = await hashPassword('password123');
  const staff = await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: {},
    create: {
      email: 'staff@demo.com',
      password: staffPassword,
      firstName: 'Jane',
      lastName: 'Staff',
      phone: '+36301234568',
    },
  });
  console.log('✅ Created staff user:', staff.email);

  // Create demo company
  const company = await prisma.company.upsert({
    where: { slug: 'demo-salon' },
    update: {},
    create: {
      name: 'Demo Salon',
      slug: 'demo-salon',
      description: 'A demo beauty salon for testing',
      settings: {
        timezone: 'Europe/Budapest',
        currency: 'HUF',
      },
    },
  });
  console.log('✅ Created company:', company.name);

  // Create owner membership
  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: owner.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: owner.id,
      companyId: company.id,
      role: CompanyRole.OWNER,
    },
  });
  console.log('✅ Created owner membership');

  // Create staff membership
  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: staff.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: staff.id,
      companyId: company.id,
      role: CompanyRole.STAFF,
    },
  });
  console.log('✅ Created staff membership');

  // Create owner personal calendar
  await prisma.calendar.upsert({
    where: { id: `${company.id}-${owner.id}-personal` },
    update: {},
    create: {
      id: `${company.id}-${owner.id}-personal`,
      companyId: company.id,
      ownerUserId: owner.id,
      name: `${owner.firstName}'s Calendar`,
      type: CalendarType.PERSONAL,
      color: '#3B82F6',
    },
  });
  console.log('✅ Created owner calendar');

  // Create staff personal calendar
  await prisma.calendar.upsert({
    where: { id: `${company.id}-${staff.id}-personal` },
    update: {},
    create: {
      id: `${company.id}-${staff.id}-personal`,
      companyId: company.id,
      ownerUserId: staff.id,
      name: `${staff.firstName}'s Calendar`,
      type: CalendarType.PERSONAL,
      color: '#10B981',
    },
  });
  console.log('✅ Created staff calendar');

  // Create sample services
  await prisma.service.upsert({
    where: { id: `${company.id}-haircut` },
    update: {},
    create: {
      id: `${company.id}-haircut`,
      companyId: company.id,
      name: 'Haircut',
      description: 'Professional haircut service',
      duration: 30,
      price: 5000,
      active: true,
    },
  });

  await prisma.service.upsert({
    where: { id: `${company.id}-massage` },
    update: {},
    create: {
      id: `${company.id}-massage`,
      companyId: company.id,
      name: 'Relaxation Massage',
      description: 'Full body relaxation massage',
      duration: 60,
      price: 12000,
      active: true,
    },
  });
  console.log('✅ Created sample services');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Owner: owner@demo.com / password123');
  console.log('Staff: staff@demo.com / password123');
  console.log(`Company ID: ${company.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
