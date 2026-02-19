import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function LocalAssistancePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
            <span className="text-gray-400">›</span>
            <Link href="/#services" className="text-gray-600 hover:text-primary-500">Services</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Local Assistance</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Local Assistance</h1>
          </div>
          <p className="text-xl text-orange-100 max-w-3xl">
            Helping neighbors help neighbors—connecting those who need support with those who can provide it
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">Overview</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  Every neighborhood has people who need help and people ready to help. Our Local Assistance program 
                  bridges this gap by creating a network of community support for everyday challenges—from helping 
                  elderly neighbors with groceries to finding tutors for children.
                </p>
                <p className="mt-4">
                  We believe in the power of local connections. When you know your neighbors and they know you, 
                  communities become stronger and more resilient. Our platform makes it easy to request help or 
                  offer your skills and time to those nearby.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Elderly Care Support</h3>
                    <p className="text-gray-600">
                      Connecting volunteers with senior citizens who need help with daily tasks, companionship, or errands
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Education & Tutoring</h3>
                    <p className="text-gray-600">
                      Free tutoring and educational support for children from underprivileged families
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Skill Development</h3>
                    <p className="text-gray-600">
                      Workshops and training programs to help community members learn new skills and find employment
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Resource Sharing</h3>
                    <p className="text-gray-600">
                      Platform for neighbors to share resources, tools, and services within the community
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
              <h2 className="font-display text-3xl font-bold mb-6">Our Impact</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">300+</div>
                  <div className="text-orange-100">Families Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">1,200+</div>
                  <div className="text-orange-100">Volunteer Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">40+</div>
                  <div className="text-orange-100">Active Neighborhoods</div>
                </div>
              </div>
            </div>

            {/* How to Participate */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">How to Participate</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Request Help</h3>
                    <p className="text-gray-600">Submit a request for assistance—we&apos;ll connect you with local volunteers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Offer Your Skills</h3>
                    <p className="text-gray-600">Share what you can do—teach, cook, repair, or simply spend time with neighbors</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Build Community</h3>
                    <p className="text-gray-600">Connect with neighbors and create a support network in your area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                <h3 className="font-bold text-xl text-navy-900 mb-4">Need Local Help?</h3>
                <p className="text-gray-600 mb-6">
                  Connect with neighbors who can help. Submit a request or offer your skills to support your community.
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center font-bold py-3 rounded-xl transition-colors mb-3"
                >
                  Request Help
                </Link>
                <Link
                  href="/volunteer"
                  className="block w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-center font-bold py-3 rounded-xl transition-colors"
                >
                  Offer Help
                </Link>
              </div>

              {/* Quick Info */}
              <div className="bg-orange-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-navy-900 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Ongoing Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">Neighborhood-Based</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700">All Age Groups</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">No Cost</span>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg text-navy-900 mb-4">Share This Service</h3>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
