export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Appointment Booking System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Multi-tenant SaaS solution for appointment management
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v2m4-6v2m-4-10a4 4 0 00-4 4v10a2 2 0 002 2h8a2 2 0 002-2V7a4 4 0 00-4-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Tenant</h3>
            <p className="text-gray-600">
              Each business gets their own booking page and admin dashboard
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-green-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Notifications</h3>
            <p className="text-gray-600">
              Automatic confirmation emails with ICS calendar attachments
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-indigo-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
            <p className="text-gray-600">
              Complete appointment management with search, filters, and CSV export
            </p>
          </div>
        </div>

        {/* Demo Links */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Demo Businesses
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Harmony Massage</h3>
              <p className="text-gray-600 mb-4">Wellness & massage services</p>
              <div className="space-y-2">
                <a
                  href="/harmony-massage"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </a>
                <a
                  href="/admin/harmony-massage"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Admin Dashboard
                </a>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Barber</h3>
              <p className="text-gray-600 mb-4">Professional barber services</p>
              <div className="space-y-2">
                <a
                  href="/style-barber"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </a>
                <a
                  href="/admin/style-barber"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Admin Dashboard
                </a>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Consulting</h3>
              <p className="text-gray-600 mb-4">Business consultation services</p>
              <div className="space-y-2">
                <a
                  href="/expert-consulting"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </a>
                <a
                  href="/admin/expert-consulting"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Built with Next.js, Prisma, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
