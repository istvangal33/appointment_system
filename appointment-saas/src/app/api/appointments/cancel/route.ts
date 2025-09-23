import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST: Cancel appointment using cancellation token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cancellationToken, reason } = body

    if (!cancellationToken) {
      return NextResponse.json(
        { error: 'Cancellation token is required' },
        { status: 400 }
      )
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { cancellationToken },
      include: { tenant: true }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Invalid cancellation token' },
        { status: 404 }
      )
    }

    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      }
    })

    // Send cancellation confirmation email
    try {
      const { sendCancellationConfirmationEmail } = await import('@/lib/email')
      await sendCancellationConfirmationEmail(updatedAppointment, appointment.tenant)
    } catch (error) {
      console.error('Failed to send cancellation confirmation email:', error)
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        id: updatedAppointment.id,
        customerName: updatedAppointment.customerName,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        status: updatedAppointment.status
      }
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}