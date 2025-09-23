'use client'

import { useState } from 'react'
import { formatDate, formatTime } from '@/lib/utils'

interface CancellationFormProps {
  appointment: {
    id: string
    customerName: string
    customerEmail: string
    date: Date
    time: string
    cancellationToken: string
    tenant: {
      name: string
    }
    service?: {
      name: string
    }
  }
}

export default function CancellationForm({ appointment }: CancellationFormProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellationToken: appointment.cancellationToken,
          reason: reason.trim()
        })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Appointment Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully cancelled. You will receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Cancelled Appointment Details:</h3>
            <p className="text-sm text-gray-600">Business: {appointment.tenant.name}</p>
            <p className="text-sm text-gray-600">Date: {formatDate(appointment.date)}</p>
            <p className="text-sm text-gray-600">Time: {formatTime(appointment.time)}</p>
            <p className="text-sm text-gray-600">Customer: {appointment.customerName}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cancel Appointment
        </h1>
        <p className="text-gray-600">
          Are you sure you want to cancel your appointment?
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Appointment Details</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium text-gray-700">Business:</span> {appointment.tenant.name}
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-700">Date:</span> {formatDate(appointment.date)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-700">Time:</span> {formatTime(appointment.time)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-700">Customer:</span> {appointment.customerName}
          </p>
          {appointment.service && (
            <p className="text-sm">
              <span className="font-medium text-gray-700">Service:</span> {appointment.service.name}
            </p>
          )}
        </div>
      </div>

      {/* Cancellation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Cancellation (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Let us know why you're cancelling (optional)"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Keep Appointment
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelling...
              </div>
            ) : (
              'Cancel Appointment'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}