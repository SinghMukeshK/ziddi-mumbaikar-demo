'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { approvalService, ApprovalRequest } from '@/services/approval.service'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import DecisionModal from '@/components/DecisionModal'
import ApprovalDetailModal from '@/components/ApprovalDetailModal'

export default function AdminApprovalsPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<string>('all')

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        decision: 'approved' | 'rejected' | null;
        approval: ApprovalRequest | null;
    }>({
        isOpen: false,
        decision: null,
        approval: null
    })

    const [detailModal, setDetailModal] = useState<{
        isOpen: boolean;
        approval: ApprovalRequest | null;
    }>({
        isOpen: false,
        approval: null
    })

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin') {
            router.push('/')
            return
        }

        const fetchApprovals = async () => {
            try {
                setLoading(true)
                const response = await approvalService.getPendingApprovals(
                    filter !== 'all' ? { entity_type: filter } : {}
                )
                if (response.success) {
                    setApprovals(response.data || [])
                }
            } catch (err: any) {
                console.error('Failed to fetch pending approvals:', err)
                setError('Failed to load pending approvals. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (isLoggedIn && user?.role === 'admin') {
            fetchApprovals()
        }
    }, [isLoggedIn, user, filter, router])

    const openDecisionModal = (approval: ApprovalRequest, decision: 'approved' | 'rejected') => {
        setModalConfig({
            isOpen: true,
            decision,
            approval
        })
    }

    const handleDecisionConfirm = async (comments: string) => {
        const { approval, decision } = modalConfig
        if (!approval || !decision) return

        try {
            setProcessingId(approval.id)
            const response = await approvalService.processDecision(approval.id, decision, comments)
            if (response.success) {
                setApprovals(prev => prev.filter(req => req.id !== approval.id))
                setModalConfig(prev => ({ ...prev, isOpen: false }))
            }
        } catch (err: any) {
            console.error(`Failed to process decision:`, err)
            alert(`Failed to process decision. Please try again.`)
        } finally {
            setProcessingId(null)
        }
    }

    const getEntityColor = (type: string) => {
        switch (type) {
            case 'volunteer': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'campaign': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'event': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'service_book': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-navy-900 mb-2">Pending Workflow Approvals</h1>
                            <p className="text-gray-600">Review and approve new requests for Volunteers, Campaigns, Events, and Service Books.</p>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'volunteer', 'campaign', 'event', 'service_book'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === type
                                        ? 'bg-navy-900 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
                            {error}
                        </div>
                    ) : approvals.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                            <p className="text-gray-600">All workflow requests have been processed. Inbox Zero!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {approvals.map((approval) => (
                                <div key={approval.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getEntityColor(approval.entity_type)}`}>
                                                        {approval.entity_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Requested: {new Date(approval.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-bold text-navy-900 mb-1">{approval.title}</h2>
                                                {approval.requester && (
                                                    <div className="text-sm text-gray-600">
                                                        By: {approval.requester.first_name} {approval.requester.last_name} ({approval.requester.email})
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-3 mt-2 md:mt-0">
                                                <button
                                                    onClick={() => setDetailModal({ isOpen: true, approval })}
                                                    className="px-4 py-2 text-navy-600 font-bold text-sm hover:bg-navy-50 rounded-lg transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => openDecisionModal(approval, 'rejected')}
                                                    disabled={processingId !== null}
                                                    className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => openDecisionModal(approval, 'approved')}
                                                    disabled={processingId !== null}
                                                    className="px-8 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Summary Metadata</h3>
                                            <p className="text-gray-800 text-sm">{approval.summary}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DecisionModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={handleDecisionConfirm}
                    decision={modalConfig.decision}
                    title={modalConfig.approval?.title || ''}
                    loading={processingId !== null}
                />
                <ApprovalDetailModal
                    isOpen={detailModal.isOpen}
                    onClose={() => setDetailModal(prev => ({ ...prev, isOpen: false }))}
                    entityType={detailModal.approval?.entity_type || ''}
                    entityId={detailModal.approval?.entity_id || ''}
                    title={detailModal.approval?.title || ''}
                />
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
