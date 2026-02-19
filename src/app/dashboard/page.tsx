'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { formatDate } from '@/lib/date-utils'
import { fundraiserService } from '@/services/fundraiser.service'
import { donationService } from '@/services/donation.service'
import { donorService } from '@/services/donor.service'
import { volunteerService } from '@/services/volunteer.service'
import { dashboardService } from '@/services/dashboard.service'

import { useRouter } from 'next/navigation'

function DashboardContent() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeFundraisers: 0,
    totalRaised: 0,
    totalDonations: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    // For regular users
    myRaised: 0,
    myDonated: 0,
    myDonationsCount: 0,
    myFundraisersCount: 0
  })
  const [recentData, setRecentData] = useState<{
    fundraisers: any[],
    donations: any[]
  }>({
    fundraisers: [],
    donations: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        if (user?.role === 'admin') {
          console.log('[Dashboard] Fetching stats...');
          const [statsRes, activityRes] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getRecentActivity()
          ])

          console.log('[Dashboard] Stats response:', statsRes);
          console.log('[Dashboard] Activity response:', activityRes);

          if (statsRes.success && statsRes.data) {
            setStats(prev => {
              const newStats = {
                ...prev,
                activeFundraisers: statsRes.data.activeFundraisers,
                totalRaised: statsRes.data.totalRaised,
                totalDonations: statsRes.data.totalDonations,
                totalDonors: statsRes.data.totalDonors,
                totalVolunteers: statsRes.data.totalVolunteers
              };
              console.log('[Dashboard] Setting new stats:', newStats);
              return newStats;
            })
          }

          if (activityRes.success && activityRes.data) {
            setRecentData({
              fundraisers: activityRes.data.recentFundraisers || [],
              donations: activityRes.data.recentDonations || []
            })
          }
        } else {
          console.log('[Dashboard] User is not an admin, skipping stats fetch. Role:', user?.role);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === 'admin') {
      fetchDashboardData()
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && isLoggedIn && user && user.role !== 'admin') {
      router.push('/profile')
    }
  }, [user, isLoading, isLoggedIn, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') return null

  const isAdmin = user?.role === 'admin'

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
            <span className="text-gray-900 font-medium">{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? 'Here is an overview of your organization\'s impact and operations.'
                : 'Account overview and recent activity'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider border border-amber-200"> Admin Portal </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Active Fundraisers</p>
                <p className="text-3xl font-bold text-navy-900">{stats.activeFundraisers}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Total Raised</p>
                <p className="text-3xl font-bold text-navy-900">₹{stats.totalRaised.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Total Donors</p>
                  <p className="text-3xl font-bold text-navy-900">{stats.totalDonors}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">My Donations</p>
                  <p className="text-3xl font-bold text-navy-900">{stats.myDonationsCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  {isAdmin ? 'Volunteers' : 'Total Donated'}
                </p>
                <p className="text-3xl font-bold text-navy-900">
                  {isAdmin ? stats.totalVolunteers : `₹${stats.myDonated.toLocaleString()}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                {isAdmin ? (
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-navy-900 rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl font-bold"></div>
          <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <Link
              href="/fundraiser/start"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 transition-all border border-white/10 group"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Start Fundraiser</h3>
                <p className="text-white/60 text-xs">Create new campaign</p>
              </div>
            </Link>

            <Link
              href="/admin/volunteers"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 transition-all border border-white/10 group"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Manage Volunteers</h3>
                <p className="text-white/60 text-xs">View & print IDs</p>
              </div>
            </Link>

            <Link
              href="/admin/approvals"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 transition-all border border-white/10 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Pending Actions</h3>
                <p className="text-white/60 text-xs">Review submissions</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 transition-all border border-white/10 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Settings</h3>
                <p className="text-white/60 text-xs">Configure platform</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Fundraisers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-navy-900">{isAdmin ? 'Recent Active Fundraisers' : 'My Fundraisers'}</h3>
              <Link href={isAdmin ? "/fundraisers" : "/my-fundraisers"} className="text-primary-600 hover:text-primary-700 text-sm font-bold">
                View All →
              </Link>
            </div>
            <div className="p-6">
              {recentData.fundraisers.length > 0 ? (
                <div className="space-y-6">
                  {recentData.fundraisers.map((fundraiser) => {
                    const progress = (fundraiser.raised_amount / fundraiser.goal_amount) * 100
                    return (
                      <div key={fundraiser.id} className="group">
                        <Link href={`/fundraisers/${fundraiser.id}`} className="block">
                          <h4 className="font-bold text-navy-900 mb-2 group-hover:text-primary-600 transition-colors truncate">{fundraiser.title}</h4>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-gray-500 font-medium">
                                ₹{fundraiser.raised_amount?.toLocaleString()} raised
                              </span>
                              <span className="text-gray-900 font-bold">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
                              {fundraiser.status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              Goal: ₹{fundraiser.goal_amount?.toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No active fundraisers found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-navy-900">{isAdmin ? 'Latest Incoming Donations' : 'Recent Donations'}</h3>
              <Link href={isAdmin ? "/donations" : "/my-donations"} className="text-primary-600 hover:text-primary-700 text-sm font-bold">
                View All →
              </Link>
            </div>
            <div className="p-0">
              {recentData.donations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentData.donations.map((donation) => (
                    <div key={donation.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-navy-900 text-sm truncate max-w-[150px] md:max-w-[200px]">
                            {isAdmin ? (donation.donor_name || 'Anonymous Donor') : (donation.fundraiser?.title || 'General Donation')}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {formatDate(donation.created_at, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary-600">₹{donation.amount?.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{donation.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No recent donations to display.</p>
                </div>
              )}
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
