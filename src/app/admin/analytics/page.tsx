'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/services/dashboard.service'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminAnalyticsPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [stats, setStats] = useState<any>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/')
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const [statsResp, analyticsResp] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getFinancialAnalytics()
                ])
                if (statsResp.success) setStats(statsResp.data)
                if (analyticsResp.success) setAnalytics(analyticsResp.data)
            } catch (err: any) {
                console.error('Failed to fetch analytics:', err)
                setError('Failed to load financial data.')
            } finally {
                setLoading(false)
            }
        }

        if (isLoggedIn && (user?.role === 'admin' || user?.role === 'super_admin')) {
            fetchData()
        }
    }, [isLoggedIn, user, router])

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-navy-900 font-black uppercase tracking-widest text-sm animate-pulse">Calculating Impact...</p>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-4xl font-black text-navy-900 tracking-tight mb-2">Financial Intelligence</h1>
                        <p className="text-slate-500 font-bold max-w-2xl">Real-time revenue flows, donor behavior, and predictive impact analytics.</p>
                    </div>

                    {/* Top Row Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-primary-200 transition-all duration-500">
                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact Value</p>
                            <h3 className="text-4xl font-black text-navy-900">₹{stats?.totalRaised?.toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-600 rounded-full">+12.5%</span>
                                <span className="text-[10px] font-bold text-slate-400 italic">vs last month</span>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-indigo-200 transition-all duration-500">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Donor Base</p>
                            <h3 className="text-4xl font-black text-navy-900">{stats?.totalDonors}</h3>
                            <p className="mt-4 text-[10px] font-bold text-slate-400">Total active supporters</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-orange-200 transition-all duration-500">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Velocity</p>
                            <h3 className="text-4xl font-black text-navy-900">{stats?.totalDonations}</h3>
                            <p className="mt-4 text-[10px] font-bold text-slate-400">Completed successful payments</p>
                        </div>
                    </div>

                    {/* Chart Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Monthly Trends - Custom CSS Chart */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <h3 className="text-lg font-black text-navy-900 mb-8 uppercase tracking-widest">Revenue Growth (6M)</h3>
                            <div className="flex items-end justify-between gap-4 h-64 mt-12 pb-8 border-b border-slate-100 px-4">
                                {analytics?.monthlyTrends?.map((m: any, idx: number) => {
                                    const max = Math.max(...analytics.monthlyTrends.map((x: any) => parseFloat(x.total_amount))) || 1;
                                    const height = (parseFloat(m.total_amount) / max) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-navy-900 text-white text-[10px] px-2 py-1 rounded font-black whitespace-nowrap z-10">
                                                ₹{parseFloat(m.total_amount).toLocaleString()}
                                            </div>
                                            <div
                                                className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-xl group-hover:to-primary-300 transition-all shadow-lg shadow-primary-200"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-tighter rotate-[-45deg] origin-top-left whitespace-nowrap">
                                                {new Date(m.month).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Breakdowns */}
                        <div className="space-y-8">
                            {/* Payment Methods */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <h3 className="text-lg font-black text-navy-900 mb-6 uppercase tracking-widest">Payment Ecosystem</h3>
                                <div className="space-y-4">
                                    {analytics?.methodBreakdown?.map((m: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                                                <span className="text-slate-500">{m.payment_method || 'Other'}</span>
                                                <span className="text-navy-900">₹{parseFloat(m.total_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${['bg-primary-500', 'bg-indigo-500', 'bg-orange-500', 'bg-emerald-500'][idx % 4]}`}
                                                    style={{ width: `${(parseFloat(m.total_amount) / (analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.total_amount || 100000)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recurring Hub */}
                            <div className="bg-navy-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500 rounded-full opacity-10 blur-3xl animate-pulse" />
                                <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-primary-400">Recurring Subscription Hub</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    {analytics?.recurringStats?.map((s: any, idx: number) => (
                                        <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                                                {s.is_recurring ? 'Monthly Recurring' : 'One-Time Gifts'}
                                            </p>
                                            <p className="text-2xl font-black mb-1">₹{parseFloat(s.total_amount).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-primary-400">{s.count} transactions</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
