import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function CommunityEventsPage() {
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
            <span className="text-gray-900 font-medium">Community Events</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Community Events</h1>
          </div>
          <p className="text-xl text-purple-100 max-w-3xl">
            Building stronger neighborhoods through cultural celebrations, festivals, and community gatherings
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
                  Mumbai&apos;s strength lies in its diversity and community spirit. Our Community Events bring people together 
                  to celebrate festivals, organize cultural programs, and create spaces for neighbors to connect and build 
                  lasting relationships.
                </p>
                <p className="mt-4">
                  From Ganesh Chaturthi to Diwali celebrations, Independence Day programs to street festivals—we organize 
                  inclusive events that celebrate Mumbai&apos;s unique culture while fostering unity. Every event is designed 
                  to be accessible, inclusive, and community-driven.
                </p>
              </div>
            </div>

            {/* What We Do */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-6">What We Do</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Festival Celebrations</h3>
                    <p className="text-gray-600">
                      Organize community-led celebrations for major festivals with cultural programs and traditional activities
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Cultural Programs</h3>
                    <p className="text-gray-600">
                      Host music, dance, and art events showcasing local talent and promoting cultural exchange
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Street Fairs & Bazaars</h3>
                    <p className="text-gray-600">
                      Organize local markets and fairs supporting small businesses and artisans from the community
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-2">Neighborhood Meetups</h3>
                    <p className="text-gray-600">
                      Regular community gatherings for residents to connect, discuss local issues, and plan initiatives
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
              <h2 className="font-display text-3xl font-bold mb-6">Our Impact</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">120+</div>
                  <div className="text-purple-100">Events Organized</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">15,000+</div>
                  <div className="text-purple-100">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">50+</div>
                  <div className="text-purple-100">Neighborhoods</div>
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
                    <h3 className="font-bold text-navy-900 mb-1">Join Event Planning Committee</h3>
                    <p className="text-gray-600">Help organize and coordinate community events in your neighborhood</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Perform or Showcase</h3>
                    <p className="text-gray-600">Share your talent—music, dance, art, or craft at our cultural programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">Attend & Connect</h3>
                    <p className="text-gray-600">Simply show up, meet your neighbors, and be part of the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                <h3 className="font-bold text-xl text-navy-900 mb-4">Join Our Next Event</h3>
                <p className="text-gray-600 mb-6">
                  Be part of Mumbai&apos;s vibrant community. Participate in upcoming cultural programs and festivals.
                </p>
                <Link
                  href="/volunteer"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-bold py-3 rounded-xl transition-colors mb-3"
                >
                  Get Involved
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-center font-bold py-3 rounded-xl transition-colors"
                >
                  Suggest an Event
                </Link>
              </div>

              {/* Quick Info */}
              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-navy-900 mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Year-Round Events</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">Multiple Locations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700">Family-Friendly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Free Entry</span>
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
