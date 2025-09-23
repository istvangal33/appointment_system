import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AdminDashboard from '@/components/admin/AdminDashboard'

interface AdminPageProps {
  params: {
    tenantSlug: string
  }
}

export default async function AdminPage({ params }: AdminPageProps) {
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
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard tenant={tenant} />
    </div>
  )
}

// Generate metadata for admin page
export async function generateMetadata({ params }: AdminPageProps) {
  const { tenantSlug } = params
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug }
  })

  if (!tenant) {
    return {
      title: 'Admin Dashboard - Business Not Found',
    }
  }

  return {
    title: `Admin Dashboard - ${tenant.name}`,
    description: `Manage appointments for ${tenant.name}`,
  }
}