import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BusinessHours, TimeSlot } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time slot generation utility
export function generateTimeSlots(
  businessHours: BusinessHours,
  date: Date,
  intervalMinutes: number = 60,
  bookedSlots: string[] = []
): TimeSlot[] {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours
  const dayConfig = businessHours[dayOfWeek]
  
  if (!dayConfig.enabled) {
    return []
  }
  
  const slots: TimeSlot[] = []
  const [startHour, startMinute] = dayConfig.start.split(':').map(Number)
  const [endHour, endMinute] = dayConfig.end.split(':').map(Number)
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    const endTimeMinutes = currentMinute + intervalMinutes
    const endHourCalc = currentHour + Math.floor(endTimeMinutes / 60)
    const endMinuteCalc = endTimeMinutes % 60
    const endTimeString = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`
    
    // Don't add slots that would end after business hours
    if (endHourCalc < endHour || (endHourCalc === endHour && endMinuteCalc <= endMinute)) {
      slots.push({
        start: timeString,
        end: endTimeString,
        available: !bookedSlots.includes(timeString)
      })
    }
    
    // Move to next slot
    currentMinute += intervalMinutes
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }
  
  return slots
}

// Generate cancellation token
export function generateCancellationToken(): string {
  return crypto.randomUUID()
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format time for display
export function formatTime(time: string): string {
  const [hour, minute] = time.split(':')
  const hourNum = parseInt(hour, 10)
  const ampm = hourNum >= 12 ? 'PM' : 'AM'
  const displayHour = hourNum % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Default business hours
export const defaultBusinessHours: BusinessHours = {
  monday: { start: '09:00', end: '17:00', enabled: true },
  tuesday: { start: '09:00', end: '17:00', enabled: true },
  wednesday: { start: '09:00', end: '17:00', enabled: true },
  thursday: { start: '09:00', end: '17:00', enabled: true },
  friday: { start: '09:00', end: '17:00', enabled: true },
  saturday: { start: '10:00', end: '16:00', enabled: true },
  sunday: { start: '10:00', end: '16:00', enabled: false }
}