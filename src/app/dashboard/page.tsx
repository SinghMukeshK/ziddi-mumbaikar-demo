'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { formatDate } from '@/lib/date-utils'

function DashboardContent() {
  const { user } = useAuth()

  // Mock data - Replace with actual API calls
  const stats = {
    activeFundraisers: 2,
    totalDonations: 5,
    totalRaised: 45000,
    totalDonated: 12500,
  }

  const recentFundraisers = [
    {
      id: 1,
      title: 'Help Build Community Library',
      raised: 25000,
      goal: 100000,
      status: 'active',
    },
    {
      id: 2,
      title: 'Medical Aid for Elderly',
      raised: 20000,
      goal: 50000,
      status: 'active',
    },
  ]

  const recentDonations = [
    {
      id: 1,
      fundraiser: 'Clean Mumbai Drive',
      amount: 5000,
      date: '2024-02-10',
    },
    {
      id: 2,
      fundraiser: 'School Supplies for Kids',
      amount: 3500,
      date: '2024-02-08',
    },
    {
      id: 3,
      fundraiser: 'Emergency Relief Fund',
      amount: 4000,
      date: '2024-02-05',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">
            Welcome back, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your campaigns and contributions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Active Fundraisers</p>
                <p className="text-3xl font-bold text-navy-900">{stats.activeFundraisers}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Raised</p>
                <p className="text-3xl font-bold text-navy-900">₹{stats.totalRaised.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-navy-900">{stats.totalDonations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Donated</p>
                <p className="text-3xl font-bold text-navy-900">₹{stats.totalDonated.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/fundraiser/start"
              className="bg-white hover:bg-gray-50 rounded-lg p-4 flex items-center gap-4 transition-colors group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Start a Fundraiser</h3>
                <p className="text-sm text-gray-600">Launch a new campaign</p>
              </div>
            </Link>

            <Link
              href="/fundraisers"
              className="bg-white hover:bg-gray-50 rounded-lg p-4 flex items-center gap-4 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Browse Fundraisers</h3>
                <p className="text-sm text-gray-600">Find causes to support</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="bg-white hover:bg-gray-50 rounded-lg p-4 flex items-center gap-4 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Fundraisers */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-900">My Fundraisers</h3>
              <Link href="/my-fundraisers" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {recentFundraisers.map((fundraiser) => {
                const progress = (fundraiser.raised / fundraiser.goal) * 100
                return (
                  <div key={fundraiser.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold text-navy-900 mb-2">{fundraiser.title}</h4>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          ₹{fundraiser.raised.toLocaleString()} raised
                        </span>
                        <span className="text-gray-600">
                          ₹{fundraiser.goal.toLocaleString()} goal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-900">Recent Donations</h3>
              <Link href="/my-donations" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-navy-900">{donation.fundraiser}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(donation.date, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₹{donation.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
