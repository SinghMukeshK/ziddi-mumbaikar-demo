'use client'

import { useState, useEffect, useCallback } from 'react'
import { ngoService, NgoServiceBooking } from '@/services/ngoService.service'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/date-utils'
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBookings() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [bookings, setBookings] = useState<NgoServiceBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') {
            router.push('/')
        }
    }, [isLoggedIn, user, router])

    const fetchBookings = useCallback(async () => {
        setLoading(true)
        try {
            const response = await ngoService.getBookings({
                page,
                limit: 10,
                status: statusFilter || undefined
            })
            if (response.success) {
                setBookings(response.data)
                // Assuming paginated response has total, but update logic if needed
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err)
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await ngoService.updateBookingStatus(id, newStatus)
            if (response.success) {
                setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus as any } : b))
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 flex justify-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Service Bookings</h1>
                        <p className="text-gray-600 mt-1">Manage and track free NGO service requests.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 border rounded-xl focus:border-primary-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0">
                        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${statusFilter === s
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {s === '' ? 'All Requests' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-navy-900">No bookings found</h3>
                            <p className="text-gray-500 mt-2">There are no service requests matching your current filters.</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow"
                            >
                                {/* Left Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-navy-900">{booking.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="w-4 h-4" /> {booking.phone}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" /> {booking.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 italic">
                                            &quot;{booking.notes}&quot;
                                        </div>
                                    )}
                                </div>

                                {/* Right Action/System Info */}
                                <div className="lg:w-72 lg:border-l lg:pl-6 flex flex-col justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-primary-500" />
                                            <span>{formatDate(booking.booking_date)}</span>
                                        </div>
                                        {booking.booking_time && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <ClockIcon className="w-4 h-4 text-primary-500" />
                                                <span>{booking.booking_time}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs font-bold text-navy-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                                            {/* We need to get the service name, might need to populate it on backend */}
                                            {(booking as any).service?.name || 'Service Request'}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-auto">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                                                >
                                                    <Check className="w-3 h-3" /> Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                    className="p-2 border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                className="w-full bg-green-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-700 transition-colors"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Mark Completed
                                            </button>
                                        )}
                                        {booking.status === 'completed' && (
                                            <div className="w-full text-center text-green-600 font-bold text-xs py-2">
                                                Service Delivered
                                            </div>
                                        )}
                                        {booking.status === 'cancelled' && (
                                            <div className="w-full text-center text-red-600 font-bold text-xs py-2">
                                                Request Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {total > 10 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium">Page {page} of {Math.ceil(total / 10)}</span>
                        <button
                            disabled={page >= Math.ceil(total / 10)}
                            onClick={() => setPage(page + 1)}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
