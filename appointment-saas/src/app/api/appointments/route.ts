import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BookingFormData } from '@/lib/types'
import { isValidEmail, generateCancellationToken } from '@/lib/utils'

// POST: Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body: BookingFormData & { tenantSlug: string } = await request.json()
    
    const { 
      tenantSlug, 
      customerName, 
      customerEmail, 
      customerPhone, 
      date, 
      time, 
      serviceId, 
      notes 
    } = body

    // Validation
    if (!tenantSlug || !customerName || !customerEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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
    const appointmentDate = new Date(date)
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      )
    }

    // Check if time slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        tenantId: tenant.id,
        date: appointmentDate,
        time: time,
        status: 'active'
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      )
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        date: appointmentDate,
        time,
        notes,
        tenantId: tenant.id,
        serviceId,
        cancellationToken: generateCancellationToken()
      },
      include: {
        tenant: true,
        service: true
      }
    })

    // Send confirmation email with ICS attachment
    try {
      const { sendBookingConfirmationEmail } = await import('@/lib/email')
      await sendBookingConfirmationEmail(appointment, tenant)
      
      // Mark confirmation as sent
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { confirmationSent: true }
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        date: appointment.date,
        time: appointment.time,
        cancellationToken: appointment.cancellationToken,
        tenant: appointment.tenant.name,
        service: appointment.service?.name
      }
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: List appointments for a tenant (admin endpoint)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantSlug = url.searchParams.get('tenant')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const search = url.searchParams.get('search')

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
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

    // Build query filters
    const where: any = {
      tenantId: tenant.id
    }

    if (status) {
      where.status = status
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      appointments
    })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}