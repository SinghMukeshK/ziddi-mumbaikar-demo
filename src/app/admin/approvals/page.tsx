'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { fundraiserService, Fundraiser } from '@/services/fundraiser.service'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminApprovalsPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        // Only allow admins
        if (isLoggedIn && user && user.role !== 'admin') {
            router.push('/')
            return
        }

        const fetchPending = async () => {
            try {
                setLoading(true)
                const response = await fundraiserService.getPendingFundraisers()
                if (response.success) {
                    setFundraisers(response.data || [])
                }
            } catch (err: any) {
                console.error('Failed to fetch pending fundraisers:', err)
                setError('Failed to load pending fundraisers. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (isLoggedIn && user?.role === 'admin') {
            fetchPending()
        }
    }, [isLoggedIn, user, router])

    const handleVerify = async (id: string, status: 'active' | 'rejected') => {
        try {
            setProcessingId(id)
            const response = await fundraiserService.verifyFundraiser(id, status)
            if (response.success) {
                // Remove from list
                setFundraisers(prev => prev.filter(f => f.id !== id))
            }
        } catch (err: any) {
            console.error(`Failed to ${status} fundraiser:`, err)
            alert(`Failed to ${status} fundraiser. Please try again.`)
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-navy-900 mb-2">Pending Fundraiser Approvals</h1>
                        <p className="text-gray-600">Review and approve new fundraiser requests from the community.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
                            {error}
                        </div>
                    ) : fundraisers.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                            <p className="text-gray-600">All fundraiser requests have been processed. Great job!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {fundraisers.map((fundraiser) => (
                                <div key={fundraiser.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image Section */}
                                        <div className="md:w-64 h-48 md:h-auto relative bg-gray-100">
                                            <Image
                                                src={fundraiser.cover_image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80'}
                                                alt={fundraiser.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold mb-2 uppercase tracking-wider">
                                                        Pending Review
                                                    </span>
                                                    <h2 className="text-xl font-bold text-navy-900 mb-1">{fundraiser.title}</h2>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span>By: {fundraiser.beneficiary_name || 'Anonymous'}</span>
                                                        <span>•</span>
                                                        <span>{fundraiser.category?.name || 'Uncategorized'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary-600">₹{Number(fundraiser.goal_amount).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Target Goal</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-tight">Short Description</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2">{fundraiser.short_description || fundraiser.description}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                                <div className="flex gap-4">
                                                    <Link
                                                        href={`/fundraisers/${fundraiser.id}`}
                                                        target="_blank"
                                                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                                                    >
                                                        View Details
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </Link>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleVerify(fundraiser.id, 'rejected')}
                                                        disabled={processingId !== null}
                                                        className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(fundraiser.id, 'active')}
                                                        disabled={processingId !== null}
                                                        className="px-8 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
