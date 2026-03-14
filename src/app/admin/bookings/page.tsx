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
    Check,
    Printer,
    FileText
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
    const [printingBooking, setPrintingBooking] = useState<NgoServiceBooking | null>(null)

    const handlePrint = (booking: NgoServiceBooking) => {
        setPrintingBooking(booking)
        setTimeout(() => {
            window.print()
        }, 150)
    }

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
                                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                                        <button
                                            onClick={() => handlePrint(booking)}
                                            className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            title="Print Form"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        
                                        {booking.attachment_url && (
                                            <a
                                                href={booking.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                title="View Attachment"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </a>
                                        )}
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

            {/* PRINT COMPONENT */}
            {printingBooking && (
                <div className="hidden print:block fixed inset-0 bg-white z-[99999] text-black font-sans w-[210mm] mx-auto p-8">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print-form-container, .print-form-container * { visibility: visible; }
                    .print-form-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; box-sizing: border-box; background: white !important; }
                    @page { size: portrait; margin: 10mm; }
                }
            ` }} />
                    <div className="print-form-container bg-white w-full h-full">
                        <div className="text-center mb-4">
                            <img src="/logo.webp" alt="Ziddi Mumbaikar" className="w-20 h-20 mx-auto object-contain" />
                        </div>

                        <div className="border border-gray-300 rounded-sm shadow-sm text-[12px]">
                            <div className="bg-gray-50 border-b border-gray-300 py-2 px-4 flex justify-between items-center">
                                <h2 className="text-[16px] font-bold text-gray-900 m-0">
                                    {(printingBooking as any).service?.name || 'Service Request'} Form
                                </h2>
                                <span className="font-mono bg-gray-200 px-2 py-1 rounded text-[10px]">
                                    #{String(printingBooking.id).substring(0, 8).toUpperCase()}
                                </span>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Requester Full Name</p>
                                <p className="text-gray-700 ml-4">{printingBooking.name || '—'}</p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Mobile Number</p>
                                <p className="text-gray-700 ml-4">{printingBooking.phone || '—'}</p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Email Address</p>
                                <p className="text-blue-600 underline ml-4">{(printingBooking as any).email || '—'}</p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Patient Details</p>
                                <p className="text-gray-700 ml-4">
                                    Age: {(printingBooking as any).age || '—'} | Gender: {(printingBooking as any).gender ? (printingBooking as any).gender.charAt(0).toUpperCase() + (printingBooking as any).gender.slice(1) : '—'}
                                </p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Reference Info</p>
                                <p className="text-gray-700 ml-4">
                                    Name: {(printingBooking as any).reference_name || '—'} | Phone: {(printingBooking as any).reference_number || '—'}
                                </p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Service Location (Home Address)</p>
                                <p className="text-gray-700 ml-4 whitespace-pre-wrap">{printingBooking.address || '—'}</p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Locations</p>
                                <p className="text-gray-700 ml-4 whitespace-pre-wrap"><strong>Pick Up:</strong> {(printingBooking as any).pickup_address || '—'}</p>
                                <p className="text-gray-700 ml-4 whitespace-pre-wrap mt-1"><strong>Drop Off:</strong> {(printingBooking as any).drop_address || '—'}</p>
                            </div>

                            <div className="border-b border-gray-200 py-2 px-4">
                                <p className="font-bold text-gray-800 mb-1">Booking Date & Time</p>
                                <p className="text-gray-700 ml-4">
                                    {printingBooking.booking_date ? new Date(printingBooking.booking_date).toLocaleDateString('en-GB') : '—'}
                                    {printingBooking.booking_time ? ` at ${printingBooking.booking_time}` : ''}
                                </p>
                            </div>

                            <div className="py-2 px-4 bg-gray-50/50 flex-grow">
                                <p className="font-bold text-gray-800 mb-1">Additional Notes</p>
                                <p className="text-gray-700 ml-4 whitespace-pre-wrap">{printingBooking.notes || '—'}</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-gray-400 text-xs font-semibold tracking-widest uppercase">
                            Ziddi Mumbaikar NGO • Free Service
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
