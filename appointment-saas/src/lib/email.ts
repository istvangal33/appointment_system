// Email service using Resend
import { Resend } from 'resend'
import { Appointment, Tenant } from '@/lib/types'
import { generateICS, generateICSFileName } from './ics'
import { formatDate, formatTime } from './utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function generateBookingConfirmationEmail(
  appointment: Appointment, 
  tenant: Tenant
): EmailTemplate {
  const cancelUrl = `${process.env.APP_URL}/cancel/${appointment.cancellationToken}`
  
  const subject = `Appointment Confirmation - ${tenant.name}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; text-align: center;">Appointment Confirmed</h1>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>
        <p><strong>Business:</strong> ${tenant.name}</p>
        <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
        <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
        <p><strong>Customer:</strong> ${appointment.customerName}</p>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
      </div>
      
      ${tenant.address ? `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Location</h3>
          <p>${tenant.address}</p>
          ${tenant.phone ? `<p><strong>Phone:</strong> ${tenant.phone}</p>` : ''}
        </div>
      ` : ''}
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Important Information</h3>
        <p>Please arrive 5-10 minutes before your scheduled appointment time.</p>
        <p>If you need to cancel or reschedule, please click the link below:</p>
        <p><a href="${cancelUrl}" style="color: #dc3545; text-decoration: underline;">Cancel Appointment</a></p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px;">
          This appointment was booked through our online booking system.<br>
          If you have any questions, please contact ${tenant.email}
        </p>
      </div>
    </div>
  `
  
  const text = `
Appointment Confirmed

Appointment Details:
Business: ${tenant.name}
Date: ${formatDate(appointment.date)}
Time: ${formatTime(appointment.time)}
Customer: ${appointment.customerName}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}

${tenant.address ? `Location: ${tenant.address}` : ''}
${tenant.phone ? `Phone: ${tenant.phone}` : ''}

Important Information:
Please arrive 5-10 minutes before your scheduled appointment time.

To cancel or reschedule your appointment, visit: ${cancelUrl}

If you have any questions, please contact ${tenant.email}
  `
  
  return { subject, html, text }
}

export function generateCancellationConfirmationEmail(
  appointment: Appointment,
  tenant: Tenant
): EmailTemplate {
  const subject = `Appointment Cancelled - ${tenant.name}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc3545; text-align: center;">Appointment Cancelled</h1>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
        <h2 style="color: #721c24; margin-top: 0;">Cancelled Appointment Details</h2>
        <p><strong>Business:</strong> ${tenant.name}</p>
        <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
        <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
        <p><strong>Customer:</strong> ${appointment.customerName}</p>
        ${appointment.cancellationReason ? `<p><strong>Reason:</strong> ${appointment.cancellationReason}</p>` : ''}
      </div>
      
      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee5eb;">
        <p style="color: #0c5460; margin: 0;">
          Your appointment has been successfully cancelled. If you would like to reschedule, 
          please visit our booking page to select a new time.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact ${tenant.email}
        </p>
      </div>
    </div>
  `
  
  const text = `
Appointment Cancelled

Cancelled Appointment Details:
Business: ${tenant.name}
Date: ${formatDate(appointment.date)}
Time: ${formatTime(appointment.time)}
Customer: ${appointment.customerName}
${appointment.cancellationReason ? `Reason: ${appointment.cancellationReason}` : ''}

Your appointment has been successfully cancelled. If you would like to reschedule, 
please visit our booking page to select a new time.

If you have any questions, please contact ${tenant.email}
  `
  
  return { subject, html, text }
}

export async function sendBookingConfirmationEmail(
  appointment: Appointment,
  tenant: Tenant
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return false
    }

    const emailTemplate = generateBookingConfirmationEmail(appointment, tenant)
    const icsContent = generateICS(appointment, tenant)
    
    const emailData: any = {
      from: `${tenant.name} <noreply@yourdomain.com>`, // Configure your domain
      to: [appointment.customerEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    }

    // Add ICS attachment if generated successfully
    if (icsContent) {
      emailData.attachments = [
        {
          filename: generateICSFileName(appointment, tenant),
          content: Buffer.from(icsContent).toString('base64'),
        },
      ]
    }

    const response = await resend.emails.send(emailData)
    
    if (response.error) {
      console.error('Error sending confirmation email:', response.error)
      return false
    }

    console.log('Confirmation email sent successfully:', response.data?.id)
    return true
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return false
  }
}

export async function sendCancellationConfirmationEmail(
  appointment: Appointment,
  tenant: Tenant
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return false
    }

    const emailTemplate = generateCancellationConfirmationEmail(appointment, tenant)
    
    const response = await resend.emails.send({
      from: `${tenant.name} <noreply@yourdomain.com>`, // Configure your domain
      to: [appointment.customerEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    })
    
    if (response.error) {
      console.error('Error sending cancellation email:', response.error)
      return false
    }

    console.log('Cancellation email sent successfully:', response.data?.id)
    return true
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    return false
  }
}