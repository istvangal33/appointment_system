import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils'

// GET: Export appointments as CSV
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantSlug = url.searchParams.get('tenant')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const format = url.searchParams.get('format')

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
        { status: 400 }
      )
    }

    if (format !== 'csv') {
      return NextResponse.json(
        { error: 'Only CSV format is supported' },
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

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    // Prepare CSV data
    const csvData = appointments.map((appointment: any) => ({
      id: appointment.id,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone || '',
      date: formatDate(new Date(appointment.date)),
      time: formatTime(appointment.time),
      status: appointment.status,
      service: appointment.service?.name || '',
      notes: appointment.notes || '',
      createdAt: appointment.createdAt.toISOString(),
      cancelledAt: appointment.cancelledAt?.toISOString() || '',
      cancellationReason: appointment.cancellationReason || ''
    }))

    // Generate CSV string
    let csvContent = 'ID,Customer Name,Email,Phone,Date,Time,Status,Service,Notes,Created At,Cancelled At,Cancellation Reason\n'
    
    csvData.forEach((row: any) => {
      const values = [
        row.id,
        `"${row.customerName}"`,
        row.customerEmail,
        row.customerPhone,
        row.date,
        row.time,
        row.status,
        `"${row.service}"`,
        `"${row.notes}"`,
        row.createdAt,
        row.cancelledAt,
        `"${row.cancellationReason}"`
      ]
      csvContent += values.join(',') + '\n'
    })

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="appointments-${tenant.slug}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}