import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTimeSlots, defaultBusinessHours } from '@/lib/utils'
import { BusinessHours } from '@/lib/types'

// GET: Get available time slots for a tenant on a specific date
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantSlug = url.searchParams.get('tenant')
    const date = url.searchParams.get('date')

    if (!tenantSlug || !date) {
      return NextResponse.json(
        { error: 'Tenant slug and date are required' },
        { status: 400 }
      )
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Parse the date
    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Get business hours (use default if not set)
    let businessHours: BusinessHours = defaultBusinessHours
    if (tenant.businessHours) {
      try {
        businessHours = JSON.parse(tenant.businessHours)
      } catch (error) {
        console.warn('Invalid business hours JSON, using defaults')
      }
    }

    // Get booked appointments for this date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        date: targetDate,
        status: 'active'
      },
      select: {
        time: true
      }
    })

    const bookedTimes = bookedAppointments.map((apt: any) => apt.time)

    // Generate available time slots
    const timeSlots = generateTimeSlots(
      businessHours,
      targetDate,
      tenant.timeInterval,
      bookedTimes
    )

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      slots: timeSlots,
      tenant: {
        name: tenant.name,
        timeInterval: tenant.timeInterval
      }
    })

  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}