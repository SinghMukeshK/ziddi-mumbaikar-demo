import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function EnvironmentalActionPage() {
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
            <span className="text-gray-900 font-medium">Environmental Action</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Environmental Action</h1>
          </div>
          <p className="text-xl text-teal-100 max-w-3xl">
            Protecting Mumbai&apos;s environment through sustainable initiatives, tree plantation, and awareness campaigns
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
                  Mumbai&apos;s environment faces unique challenges—from air pollution to shrinking green spaces, coastal 
                  erosion to plastic waste. Our Environmental Action initiatives focus on creating sustainable solutions 
                  that protect and restore the natural ecosystems of our city.
                </p>
                <p className="mt-4">
                  Through tree plantation drives, plastic-free campaigns, waste segregation awareness, and coastal 
                  conservation efforts, we&apos;re working to make Mumbai greener and more sustainable. Every action 
                  counts, and every citizen can contribute to protecting our environment.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Tree Plantation Drives</h3>
                    <p className="text-gray-600">
                      Regular tree planting campaigns across Mumbai to increase green cover and improve air quality
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Plastic-Free Campaigns</h3>
                    <p className="text-gray-600">
                      Initiatives to reduce single-use plastic through awareness, distribution of cloth bags, and alternatives
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Waste Segregation Awareness</h3>
                    <p className="text-gray-600">
                      Educating communities about proper waste segregation and promoting composting practices
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Coastal Conservation</h3>
                    <p className="text-gray-600">
                      Protecting Mumbai&apos;s coastline through mangrove restoration and beach conservation efforts
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
                    <h3 className="font-bold text-navy-900 mb-1">Join Plantation Drives</h3>
                    <p className="text-gray-600">Participate in our tree planting campaigns and adopt trees in your area</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Reduce Plastic Use</h3>
                    <p className="text-gray-600">Take the plastic-free pledge and spread awareness in your community</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Start at Home</h3>
                    <p className="text-gray-600">Implement waste segregation, composting, and sustainable practices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100">
                <h3 className="font-bold text-xl text-navy-900 mb-4">Go Green with Us</h3>
                <p className="text-gray-600 mb-6">
                  Join Mumbai&apos;s environmental movement. Participate in our green initiatives and make a difference.
                </p>
                <Link
                  href="/volunteer"
                  className="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center font-bold py-3 rounded-xl transition-colors mb-3"
                >
                  Join Initiative
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50 text-center font-bold py-3 rounded-xl transition-colors"
                >
                  Learn More
                </Link>
              </div>

              {/* Quick Info */}
              <div className="bg-teal-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-navy-900 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Monthly Drives</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">City-Wide Impact</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700">Everyone Welcome</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
