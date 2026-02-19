import Link from 'next/link'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">About Us</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              A Citizen-Led Movement Since 2018
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              We Are <span className="text-navy-900">Ziddi</span> Mumbaikar
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Born from the streets of Mumbai, driven by the spirit of its people. We&apos;re not just an NGO—we&apos;re
              a movement of everyday Mumbaikars who refuse to sit back and watch. We act. We serve. We stand together.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                It started during the 2020 lockdown. When the pandemic brought Mumbai to its knees, we saw our neighbors
                struggling—migrants stranded without food, families losing jobs, communities in crisis. The government
                machinery was overwhelmed, and people needed help immediately.
              </p>
              <p>
                A handful of concerned citizens came together. We started with just ₹5,000 and a WhatsApp group.
                We distributed food packets, helped people reach home, and connected those in need with those who could help.
                What began as an emergency response grew into something bigger.
              </p>
              <p>
                Today, Ziddi Mumbaikar is a network of over 5,000 active volunteers across Mumbai. We&apos;re teachers,
                engineers, homemakers, students, and professionals—all united by one belief: that Mumbai&apos;s strength
                lies in its people taking care of each other.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">Founded</h3>
                    <p className="text-2xl font-black text-primary-600">2020</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">During the COVID-19 pandemic</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">Volunteers</h3>
                    <p className="text-2xl font-black text-blue-600">5,000+</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Active community members</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">Projects</h3>
                    <p className="text-2xl font-black text-green-600">250+</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Completed initiatives</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-500 px-4 py-2 rounded-full mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-sm">Our Mission</span>
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">Empowering Communities Through Action</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                To create a self-reliant, compassionate Mumbai where every citizen actively participates in solving
                community challenges. We believe in grassroots action, transparency, and the power of ordinary people
                doing extraordinary things together.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-500 px-4 py-2 rounded-full mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-bold text-sm">Our Vision</span>
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">A Mumbai That Cares</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                To build Mumbai into India&apos;s model city for citizen-led social initiatives—where every neighborhood
                has active volunteers, every person in need finds support, and community bonds are stronger than any crisis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Impact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-4">Our Impact in Numbers</h2>
          <p className="text-xl text-gray-600">
            Real results from real people working together.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-black text-primary-600 mb-2">5,000+</div>
            <div className="text-gray-600 font-medium">Active Volunteers</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-blue-600 mb-2">250+</div>
            <div className="text-gray-600 font-medium">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-green-600 mb-2">50,000+</div>
            <div className="text-gray-600 font-medium">Lives Impacted</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">Support Available</div>
          </div>
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of Mumbaikars who are already part of this movement. Your city needs you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/volunteer"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              Become a Volunteer
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="bg-navy-900 text-white hover:bg-navy-800 px-8 py-4 rounded-xl font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              Get in Touch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
