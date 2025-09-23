// ICS (Calendar) file generation utility
import ics from 'ics'
import { Appointment, Tenant } from '@/lib/types'

export interface ICSData {
  title: string
  description?: string
  start: [number, number, number, number, number] // [year, month, day, hour, minute]
  duration: { minutes: number }
  location?: string
  organizer?: { name: string; email: string }
  attendees?: Array<{ name: string; email: string }>
}

export function generateICS(appointment: Appointment, tenant: Tenant): string | null {
  try {
    // Parse the appointment date and time
    const appointmentDateTime = new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.time}:00`)
    
    const eventData: ICSData = {
      title: `Appointment with ${tenant.name}`,
      description: [
        `Appointment Details:`,
        `Customer: ${appointment.customerName}`,
        `Email: ${appointment.customerEmail}`,
        appointment.customerPhone ? `Phone: ${appointment.customerPhone}` : '',
        appointment.notes ? `Notes: ${appointment.notes}` : '',
        '',
        `Business: ${tenant.name}`,
        tenant.address ? `Address: ${tenant.address}` : '',
        tenant.phone ? `Phone: ${tenant.phone}` : '',
        '',
        `To cancel this appointment, visit:`,
        `${process.env.APP_URL}/cancel/${appointment.cancellationToken}`
      ].filter(Boolean).join('\n'),
      start: [
        appointmentDateTime.getFullYear(),
        appointmentDateTime.getMonth() + 1, // ICS months are 1-based
        appointmentDateTime.getDate(),
        appointmentDateTime.getHours(),
        appointmentDateTime.getMinutes()
      ],
      duration: { minutes: 60 }, // Default duration, can be customized per service
      location: tenant.address || undefined,
      organizer: {
        name: tenant.name,
        email: tenant.email
      },
      attendees: [
        {
          name: appointment.customerName,
          email: appointment.customerEmail
        }
      ]
    }

    const { error, value } = ics.createEvent(eventData)
    
    if (error) {
      console.error('Error generating ICS:', error)
      return null
    }

    return value || null
  } catch (error) {
    console.error('Error generating ICS calendar event:', error)
    return null
  }
}

export function generateICSFileName(appointment: Appointment, tenant: Tenant): string {
  const date = appointment.date.toISOString().split('T')[0]
  const sanitizedTenantName = tenant.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  return `appointment-${sanitizedTenantName}-${date}-${appointment.time.replace(':', '')}.ics`
}