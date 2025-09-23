import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CancellationForm from '@/components/booking/CancellationForm'

interface CancelPageProps {
  params: {
    token: string
  }
}

export default async function CancelPage({ params }: CancelPageProps) {
  const { token } = params

  // Find the appointment by cancellation token
  const appointment = await prisma.appointment.findUnique({
    where: { 
      cancellationToken: token
    },
    include: {
      tenant: true,
      service: true
    }
  })

  if (!appointment) {
    notFound()
  }

  // Check if appointment is already cancelled
  if (appointment.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-lg font-medium text-yellow-900 mb-2">
                Already Cancelled
              </h1>
              <p className="text-sm text-yellow-700">
                This appointment has already been cancelled.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if appointment is in the past
  const appointmentDateTime = new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.time}:00`)
  const now = new Date()
  
  if (appointmentDateTime < now) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-lg font-medium text-red-900 mb-2">
                Cannot Cancel
              </h1>
              <p className="text-sm text-red-700">
                This appointment is in the past and cannot be cancelled.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <CancellationForm appointment={appointment} />
      </div>
    </div>
  )
}

// Generate metadata
export async function generateMetadata({ params }: CancelPageProps) {
  const { token } = params
  
  const appointment = await prisma.appointment.findUnique({
    where: { cancellationToken: token },
    include: { tenant: true }
  })

  if (!appointment) {
    return {
      title: 'Appointment Not Found',
    }
  }

  return {
    title: `Cancel Appointment - ${appointment.tenant.name}`,
    description: `Cancel your appointment with ${appointment.tenant.name}`,
  }
}