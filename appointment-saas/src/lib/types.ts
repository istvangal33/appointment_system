// Type definitions for the appointment system

export interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email: string
  logo?: string
  timeInterval: number
  businessHours?: string
  subscriptionStatus: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: 'customer' | 'admin' | 'owner'
  tenantId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  duration: number
  price?: number
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: Date
  time: string
  status: 'active' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  cancellationToken: string
  cancelledAt?: Date
  cancellationReason?: string
  reminderSent: boolean
  confirmationSent: boolean
  tenantId: string
  serviceId?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
}

export interface BookingFormData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: string
  time: string
  serviceId?: string
  notes?: string
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface BusinessHours {
  monday: { start: string; end: string; enabled: boolean }
  tuesday: { start: string; end: string; enabled: boolean }
  wednesday: { start: string; end: string; enabled: boolean }
  thursday: { start: string; end: string; enabled: boolean }
  friday: { start: string; end: string; enabled: boolean }
  saturday: { start: string; end: string; enabled: boolean }
  sunday: { start: string; end: string; enabled: boolean }
}