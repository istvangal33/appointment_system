// Database seeding script
import { prisma } from './db'
import { defaultBusinessHours } from './utils'

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')

    // Create sample tenants
    const tenants = await Promise.all([
      prisma.tenant.upsert({
        where: { slug: 'harmony-massage' },
        update: {},
        create: {
          name: 'Harmony Massage Salon',
          slug: 'harmony-massage',
          description: 'Relaxing massage and wellness services in downtown.',
          address: '1051 Budapest, József Attila utca 12.',
          phone: '+36 1 345 6789',
          email: 'info@harmonymassage.hu',
          timeInterval: 60,
          businessHours: JSON.stringify(defaultBusinessHours),
          subscriptionStatus: 'active'
        }
      }),
      
      prisma.tenant.upsert({
        where: { slug: 'style-barber' },
        update: {},
        create: {
          name: 'Style Barber Shop',
          slug: 'style-barber',
          description: 'Professional barber services for all ages.',
          address: '1052 Budapest, Váci utca 15.',
          phone: '+36 1 234 5678',
          email: 'info@stylebarber.hu',
          timeInterval: 30,
          businessHours: JSON.stringify({
            ...defaultBusinessHours,
            sunday: { start: '10:00', end: '14:00', enabled: true }
          }),
          subscriptionStatus: 'active'
        }
      }),

      prisma.tenant.upsert({
        where: { slug: 'expert-consulting' },
        update: {},
        create: {
          name: 'Expert Consulting',
          slug: 'expert-consulting',
          description: 'Personalized consultation and expert advice.',
          address: '1053 Budapest, Kossuth Lajos utca 8.',
          phone: '+36 1 456 7890',
          email: 'info@expertconsulting.hu',
          timeInterval: 60,
          businessHours: JSON.stringify(defaultBusinessHours),
          subscriptionStatus: 'active'
        }
      })
    ])

    console.log(`✅ Created ${tenants.length} tenants`)

    // Create services for each tenant
    const massageServices = await Promise.all([
      prisma.service.upsert({
        where: { id: 'massage-swedish' },
        update: {},
        create: {
          id: 'massage-swedish',
          name: 'Swedish Massage',
          duration: 60,
          price: 8000,
          tenantId: tenants[0].id
        }
      }),
      prisma.service.upsert({
        where: { id: 'massage-deep-tissue' },
        update: {},
        create: {
          id: 'massage-deep-tissue',
          name: 'Deep Tissue Massage',
          duration: 90,
          price: 12000,
          tenantId: tenants[0].id
        }
      })
    ])

    const barberServices = await Promise.all([
      prisma.service.upsert({
        where: { id: 'barber-haircut' },
        update: {},
        create: {
          id: 'barber-haircut',
          name: 'Haircut',
          duration: 30,
          price: 3000,
          tenantId: tenants[1].id
        }
      }),
      prisma.service.upsert({
        where: { id: 'barber-shave' },
        update: {},
        create: {
          id: 'barber-shave',
          name: 'Beard Trim & Shave',
          duration: 45,
          price: 2500,
          tenantId: tenants[1].id
        }
      })
    ])

    const consultingServices = await Promise.all([
      prisma.service.upsert({
        where: { id: 'consulting-business' },
        update: {},
        create: {
          id: 'consulting-business',
          name: 'Business Consultation',
          duration: 60,
          price: 15000,
          tenantId: tenants[2].id
        }
      }),
      prisma.service.upsert({
        where: { id: 'consulting-strategy' },
        update: {},
        create: {
          id: 'consulting-strategy',
          name: 'Strategy Session',
          duration: 90,
          price: 20000,
          tenantId: tenants[2].id
        }
      })
    ])

    const totalServices = massageServices.length + barberServices.length + consultingServices.length
    console.log(`✅ Created ${totalServices} services`)

    // Create sample appointments for demonstration
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const sampleAppointments = await Promise.all([
      prisma.appointment.upsert({
        where: { id: 'sample-appointment-1' },
        update: {},
        create: {
          id: 'sample-appointment-1',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          customerPhone: '+36 30 123 4567',
          date: tomorrow,
          time: '10:00',
          status: 'active',
          notes: 'First time customer',
          tenantId: tenants[0].id,
          serviceId: massageServices[0].id
        }
      }),
      
      prisma.appointment.upsert({
        where: { id: 'sample-appointment-2' },
        update: {},
        create: {
          id: 'sample-appointment-2',
          customerName: 'Jane Smith',
          customerEmail: 'jane.smith@example.com',
          date: dayAfterTomorrow,
          time: '14:30',
          status: 'active',
          tenantId: tenants[1].id,
          serviceId: barberServices[0].id
        }
      }),

      prisma.appointment.upsert({
        where: { id: 'sample-appointment-3' },
        update: {},
        create: {
          id: 'sample-appointment-3',
          customerName: 'Mike Johnson',
          customerEmail: 'mike.johnson@example.com',
          customerPhone: '+36 20 987 6543',
          date: tomorrow,
          time: '15:00',
          status: 'completed',
          notes: 'Strategy planning session',
          tenantId: tenants[2].id,
          serviceId: consultingServices[1].id
        }
      })
    ])

    console.log(`✅ Created ${sampleAppointments.length} sample appointments`)

    console.log('🎉 Database seeding completed successfully!')
    
    // Print access URLs
    console.log('\n📋 Access URLs:')
    console.log(`• Harmony Massage: http://localhost:3000/harmony-massage`)
    console.log(`• Style Barber: http://localhost:3000/style-barber`) 
    console.log(`• Expert Consulting: http://localhost:3000/expert-consulting`)
    console.log('\n🔧 Admin URLs:')
    console.log(`• Harmony Massage Admin: http://localhost:3000/admin/harmony-massage`)
    console.log(`• Style Barber Admin: http://localhost:3000/admin/style-barber`)
    console.log(`• Expert Consulting Admin: http://localhost:3000/admin/expert-consulting`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}