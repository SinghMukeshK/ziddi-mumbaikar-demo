'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { donationService, Donation } from '@/services/donation.service'
import { formatDate } from '@/lib/date-utils'
import { motion } from 'framer-motion'
import { Heart, Users, Calendar, ArrowRight, ShieldCheck, Target, TrendingUp } from 'lucide-react'

function DonationsContent() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()
    const [donations, setDonations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isLoggedIn && user?.role !== 'admin') {
            router.push('/')
        }
    }, [isLoggedIn, user, router])

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                setLoading(true)
                const response = await donationService.getDonations({ limit: 50 })
                if (response.success) {
                    setDonations(response.data || [])
                }
            } catch (err: any) {
                console.error('Failed to fetch donations:', err)
                setError('Failed to load donations. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchDonations()
    }, [])

    const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    const totalDonors = donations.length

    return (
        <div className="min-h-screen bg-white">
            {/* Immersive Header */}
            <div className="bg-gray-50/50 border-b border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-navy-900">Donations</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Premium Hero Section */}
                <div className="relative mb-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -mr-48 -mt-24 pointer-events-none"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">Transparency & Impact</span>
                        <h1 className="text-5xl md:text-6xl font-black text-navy-900 leading-[1.1] mb-8">
                            Every Contribution <br />
                            <span className="text-primary-500">Drives Change.</span>
                        </h1>
                        <p className="text-gray-500 text-xl leading-relaxed font-medium">
                            We believe in full transparency. Here is a live record of the incredible support received from our community. Together, we are building a stronger Mumbai.
                        </p>
                    </motion.div>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { label: 'Total Contributions', value: `₹${totalAmount.toLocaleString()}`, icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-50' },
                        { label: 'Generous Donors', value: totalDonors, icon: Users, color: 'text-navy-900', bg: 'bg-navy-50' },
                        { label: 'Verified Status', value: '100% Secure', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' }
                    ].map((stat, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={stat.label}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 flex items-center gap-6"
                        >
                            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Donations List */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            Latest Contributions
                        </h2>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Live Updates
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Donor</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Cause</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-10 py-6"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                            <td className="px-10 py-6"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                            <td className="px-10 py-6"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                            <td className="px-10 py-6 text-right"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : donations.length > 0 ? (
                                    donations.map((donation, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={donation.id}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-navy-50 text-navy-900 rounded-full flex items-center justify-center font-black text-xs group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                        {(donation.donor_name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-black text-navy-900 text-sm tracking-tight capitalize">
                                                        {donation.is_anonymous ? 'Anonymous Supporter' : (donation.donor_name || 'Anonymous')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-sm font-medium text-gray-600 line-clamp-1">
                                                    {donation.fundraiser?.title || 'General Donation'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                                    {formatDate(donation.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-xl border border-primary-100">
                                                    <span className="font-black text-primary-600 text-sm">₹{Number(donation.amount).toLocaleString()}</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center">
                                            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No contributions found yet.</p>
                                            <Link href="/fundraisers" className="text-primary-500 text-[10px] font-black uppercase mt-4 inline-block hover:underline">Support a cause today</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-10 py-8 bg-gray-50/30 border-t border-gray-100 flex items-center justify-center">
                        <Link href="/fundraisers" className="group flex items-center gap-3 px-8 py-3 bg-navy-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-navy-900/20">
                            Support More Causes
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default function DonationsPage() {
    return (
        <ProtectedRoute>
            <DonationsContent />
        </ProtectedRoute>
    )
}
