import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import BookingForm from '@/components/booking/BookingForm'

interface TenantPageProps {
  params: {
    tenantSlug: string
  }
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = params

  // Fetch tenant data
  const tenant = await prisma.tenant.findUnique({
    where: { 
      slug: tenantSlug,
      subscriptionStatus: 'active'
    }
  })

  if (!tenant) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {tenant.name}
          </h1>
          {tenant.description && (
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              {tenant.description}
            </p>
          )}
          
          {/* Contact Information */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            {tenant.address && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tenant.address}
              </div>
            )}
            
            {tenant.phone && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${tenant.phone}`} className="hover:text-blue-600">
                  {tenant.phone}
                </a>
              </div>
            )}
            
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${tenant.email}`} className="hover:text-blue-600">
                {tenant.email}
              </a>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="flex justify-center">
          <BookingForm 
            tenantSlug={tenant.slug} 
            tenantName={tenant.name}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Appointment Booking System</p>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TenantPageProps) {
  const { tenantSlug } = params
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug }
  })

  if (!tenant) {
    return {
      title: 'Business Not Found',
      description: 'The requested business could not be found.'
    }
  }

  return {
    title: `Book Appointment - ${tenant.name}`,
    description: tenant.description || `Book an appointment with ${tenant.name}`,
  }
}