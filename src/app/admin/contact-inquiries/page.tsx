'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import { contactService } from '@/services/contact.service'
import {
    Mail, Search, Clock, CheckCircle, SearchX, MessageSquare, Phone, User, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { value: 'in_progress', label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700' },
    { value: 'resolved', label: 'Resolved', bg: 'bg-green-50', text: 'text-green-700' },
    { value: 'spam', label: 'Spam', bg: 'bg-red-50', text: 'text-red-700' }
]

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function AdminContactInquiriesPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
    const [updating, setUpdating] = useState(false)
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin') router.push('/')
    }, [isLoggedIn, user, router])

    const fetchInquiries = async () => {
        try {
            setLoading(true)
            const res = await contactService.getInquiries({ limit: 100 })
            if (res.success) {
                setInquiries(res.data || [])
            } else {
                toast.error('Failed to load inquiries')
            }
        } catch (err) {
            toast.error('Failed to load inquiries')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') return
        fetchInquiries()
    }, [isLoggedIn, user])

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdating(true)
        const tid = toast.loading('Updating status...')
        try {
            const res = await contactService.updateInquiry(id, { status: newStatus, notes })
            if (res.success) {
                toast.success('Status updated successfully', { id: tid })
                setSelectedInquiry(null)
                fetchInquiries()
            } else {
                toast.error((res as any).message || 'Failed to update', { id: tid })
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status', { id: tid })
        } finally {
            setUpdating(false)
        }
    }

    const filtered = inquiries.filter(inquiry => {
        const matchesSearch =
            (inquiry.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (inquiry.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (inquiry.subject || '').toLowerCase().includes(search.toLowerCase())

        const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/profile" className="hover:text-primary-500 transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Contact Inquiries</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-navy-900">Contact Inquiries</h1>
                        <p className="text-gray-500 text-sm mt-1">{inquiries.length} total messages received</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 bg-white shadow-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-6 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 bg-white shadow-sm font-bold text-xs uppercase tracking-widest"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="spam">Spam</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                        <p className="font-bold text-xs uppercase tracking-[0.2em]">Loading Inquiries...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                        <SearchX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-1">No Inquiries Found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((inquiry) => {
                            const statusCfg = STATUS_OPTIONS.find(o => o.value === inquiry.status) || STATUS_OPTIONS[0]
                            const date = new Date(inquiry.created_at || inquiry.createdAt || new Date()).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })

                            return (
                                <div
                                    key={inquiry.id || inquiry._id}
                                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col p-6 cursor-pointer"
                                    onClick={() => { setSelectedInquiry(inquiry); setNotes(inquiry.notes || ''); }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusCfg.bg} ${statusCfg.text} border border-white/50 shadow-sm w-fit`}>
                                            {statusCfg.label}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            <Clock className="w-3 h-3" /> {date}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-navy-900 mb-2 line-clamp-1">{inquiry.subject || 'No Subject'}</h3>

                                    <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="truncate">{inquiry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="truncate">{inquiry.email}</span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm line-clamp-3 mt-auto border border-gray-100 italic">
                                        "{inquiry.message}"
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Inquiry Details Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-navy-900">Inquiry Details</h2>
                            <button onClick={() => setSelectedInquiry(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Name</label>
                                    <p className="font-bold text-navy-900">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</label>
                                    <p className="font-bold text-navy-900 flex items-center gap-2">
                                        {selectedInquiry.email}
                                        <a href={`mailto:${selectedInquiry.email}`} className="text-primary-500 hover:text-primary-600">
                                            <Mail className="w-3 h-3" />
                                        </a>
                                    </p>
                                </div>
                                {selectedInquiry.phone && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone</label>
                                        <p className="font-bold text-navy-900 flex items-center gap-2">
                                            {selectedInquiry.phone}
                                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary-500 hover:text-primary-600">
                                                <Phone className="w-3 h-3" />
                                            </a>
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Type</label>
                                    <p className="font-bold text-navy-900">{selectedInquiry.inquiryType || 'General'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Subject</label>
                                <p className="font-bold text-lg text-navy-900">{selectedInquiry.subject}</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message</label>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Admin Notes (Internal)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about this inquiry (only visible to admins)..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium whitespace-pre-wrap"
                                    rows={3}
                                />
                            </div>

                            <div className="pt-2 flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleUpdateStatus(selectedInquiry.id || selectedInquiry._id, 'pending')}
                                    disabled={updating}
                                    className="flex-1 py-3 px-4 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Mark Pending
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedInquiry.id || selectedInquiry._id, 'in_progress')}
                                    disabled={updating}
                                    className="flex-1 py-3 px-4 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Mark In Progress
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedInquiry.id || selectedInquiry._id, 'resolved')}
                                    disabled={updating}
                                    className="flex-1 py-3 px-4 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all gap-2 flex justify-center items-center"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    Mark Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default function AdminContactInquiries() {
    return (
        <ProtectedRoute>
            <AdminContactInquiriesPage />
        </ProtectedRoute>
    )
}
