import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function CleanlinessDrivesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
            <span className="text-gray-400">›</span>
            <Link href="/services" className="text-gray-600 hover:text-primary-500">Services</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Cleanliness Drives</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Cleanliness Drives</h1>
          </div>
          <p className="text-xl text-green-100 max-w-3xl">
            Making Mumbai cleaner, one neighborhood at a time through community-led cleanup initiatives
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
                  Our Cleanliness Drives are at the heart of the Ziddi Mumbaikar movement. We believe that a clean city
                  starts with active citizens who take responsibility for their surroundings. From beaches to streets,
                  parks to slums, we organize regular cleanup drives across Mumbai.
                </p>
                <p className="mt-4">
                  These aren&apos;t just about picking up trash—they&apos;re about building community, raising awareness,
                  and creating lasting change in how people think about public spaces.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Weekly Neighborhood Drives</h3>
                    <p className="text-gray-600">
                      Regular cleanup activities in residential areas, focusing on streets, parks, and common spaces
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Beach Cleanup Campaigns</h3>
                    <p className="text-gray-600">
                      Monthly drives at Mumbai&apos;s beaches including Versova, Juhu, and Dadar, removing plastic and debris
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Slum Area Sanitation</h3>
                    <p className="text-gray-600">
                      Working with slum communities to improve sanitation and waste management infrastructure
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Public Space Maintenance</h3>
                    <p className="text-gray-600">
                      Ongoing care for parks, gardens, and public spaces to maintain cleanliness standards
                    </p>
                  </div>
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
                    <h3 className="font-bold text-navy-900 mb-1">Join Our WhatsApp Group</h3>
                    <p className="text-gray-600">Stay updated on upcoming drives in your area</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Register as a Volunteer</h3>
                    <p className="text-gray-600">Sign up to receive notifications about cleanup events</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Show Up & Make a Difference</h3>
                    <p className="text-gray-600">Bring gloves, enthusiasm, and invite your friends!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                <h3 className="font-bold text-xl text-navy-900 mb-4">Join Our Next Drive</h3>
                <p className="text-gray-600 mb-6">
                  Be part of the change. Join us this weekend for a cleanup drive in your area.
                </p>
                <Link
                  href="/volunteer"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded-xl transition-colors mb-3"
                >
                  Register Now
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-green-600 text-green-600 hover:bg-green-50 text-center font-bold py-3 rounded-xl transition-colors"
                >
                  Contact Us
                </Link>
              </div>

              {/* Quick Info */}
              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-navy-900 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Every Weekend</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">All Mumbai Areas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700">Open to All Ages</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Free Participation</span>
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
