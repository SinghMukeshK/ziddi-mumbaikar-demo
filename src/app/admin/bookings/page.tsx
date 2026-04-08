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
    FileText,
    Download,
    Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import ApprovalDetailModal from '@/components/ApprovalDetailModal'

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
    const [viewingBooking, setViewingBooking] = useState<NgoServiceBooking | null>(null)

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
            const params: any = { page, limit: 10 }
            if (statusFilter) params.status = statusFilter
            
            const response = await ngoService.getBookings(params)
            
            if (response.success) {
                setBookings(response.data || [])
                setTotal((response as any).pagination?.total || 0)
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

    const handleExportExcel = async () => {
        const tid = toast.loading('Fetching all records for export...');
        try {
            // Fetch all records without filters and with a large limit
            const response = await ngoService.getBookings({ limit: 10000 });
            
            if (!response.success || !response.data) {
                toast.error('Failed to fetch data for export', { id: tid });
                return;
            }

            const dataToExport = response.data.map(b => ({
                'Booking ID': b.id,
                'Name': b.name,
                'Phone': b.phone,
                'Email': (b as any).email || '—',
                'Service': (b as any).service?.name || 'Service Request',
                'Booking Date': b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '—',
                'Booking Time': b.booking_time || '—',
                'Address': b.address,
                'Pickup': (b as any).pickup_address || '—',
                'Drop': (b as any).drop_address || '—',
                'Age': (b as any).age || '—',
                'Gender': (b as any).gender || '—',
                'Reference': (b as any).reference_name || '—',
                'Status': b.status.toUpperCase(),
                'Notes': b.notes || '—'
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'All Bookings');
            
            XLSX.writeFile(workbook, `all_bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Excel downloaded successfully', { id: tid });
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('An error occurred during export', { id: tid });
        }
    };

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

    const filteredBookings = bookings.filter(b => 
        !searchTerm || 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.phone?.includes(searchTerm)
    );

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
                    <div className="flex flex-wrap gap-2 shrink-0 items-center">
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
                        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10 shrink-0"
                        >
                            <Download className="w-4 h-4" />
                            Download Excel
                        </button>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Requester</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Service & Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-navy-900">No bookings found</h3>
                                            <p className="text-gray-500 text-sm mt-1">There are no service requests matching your current filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-navy-900">{booking.name}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" /> {booking.phone}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-primary-600 uppercase tracking-tight">
                                                        {(booking as any).service?.name || 'Service Request'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatDate(booking.booking_date)}</span>
                                                        {booking.booking_time && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <ClockIcon className="w-3 h-3" />
                                                                <span>{booking.booking_time}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-start gap-1.5 max-w-[200px]">
                                                    <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                                    <span className="text-xs text-gray-600 line-clamp-2" title={booking.address}>
                                                        {booking.address}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewingBooking(booking)}
                                                        className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => handlePrint(booking)}
                                                        className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
                                                        title="Print Form"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>

                                                    {booking.attachment_url && (
                                                        <a
                                                            href={booking.attachment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
                                                            title="View Attachment"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}

                                                    <div className="h-4 w-[1px] bg-gray-200 mx-1" />

                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                                className="p-1.5 border border-gray-200 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                                                title="Cancel Request"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm shadow-green-200 flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle className="w-3 h-3" /> Complete
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 px-2">
                                                            Delivered
                                                        </span>
                                                    )}
                                                    {booking.status === 'cancelled' && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 px-2">
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
                <div className="hidden print:block fixed inset-0 bg-white z-[99999] text-black font-sans w-[190mm] mx-auto p-0 overflow-hidden">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page { size: portrait; margin: 5mm; }
                            body { visibility: hidden; background: white !important; height: 100%; overflow: hidden !important; }
                            .print-block, .print-block * { visibility: visible; }
                            .print-block { 
                                display: block !important; 
                                position: absolute; 
                                left: 50%;
                                transform: translateX(-50%);
                                top: 0; 
                                width: 190mm; 
                                height: 280mm; 
                                z-index: 9999;
                                padding: 0 !important;
                                margin: 0 !important;
                                overflow: hidden !important;
                                page-break-after: avoid;
                                page-break-before: avoid;
                            }
                            footer, header, main, nav, .no-print, .ApprovalDetailModal { display: none !important; }
                        }
                    ` }} />
                    <div className="print-block print-form-container bg-white w-full h-full border-2 border-gray-900 p-1">
                        <div className="border border-gray-300 p-8">
                            <div className="text-center mb-8">
                                <img src="/logo.webp" alt="Ziddi Mumbaikar" className="w-24 h-24 mx-auto object-contain mb-4" />
                                <h1 className="text-2xl font-black uppercase tracking-tighter">Ziddi Mumbaikar NGO</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Emergency Support Service Registration</p>
                            </div>

                            <div className="space-y-0 text-[13px]">
                                <div className="bg-navy-900 text-white py-3 px-5 flex justify-between items-center mb-6">
                                    <h2 className="font-black uppercase tracking-tight m-0">{(printingBooking as any).service?.name || 'Service Request'}</h2>
                                    <span className="font-mono text-sm underline decoration-primary-500 underline-offset-4">Ref ID: {String(printingBooking.id).substring(0, 10).toUpperCase()}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-0 border-t border-l border-gray-200">
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Requester Name</p>
                                        <p className="font-bold text-navy-900 uppercase">{printingBooking.name || '—'}</p>
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Contact Details</p>
                                        <p className="font-bold text-navy-900">{printingBooking.phone || '—'}</p>
                                        {(printingBooking as any).email && <p className="text-[10px] font-medium text-gray-500">{(printingBooking as any).email}</p>}
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Patient Vitals</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {(printingBooking as any).age ? `${(printingBooking as any).age} Yrs` : 'Age N/A'} • {(printingBooking as any).gender || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Booking Schedule</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {printingBooking.booking_date ? new Date(printingBooking.booking_date).toLocaleDateString('en-GB') : '—'}
                                            <span className="text-gray-400 font-medium ml-2">@{printingBooking.booking_time || '—'}</span>
                                        </p>
                                    </div>
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Reference & Help</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {(printingBooking as any).reference_name || 'Direct Walk-in'} 
                                            {(printingBooking as any).reference_number && <span className="text-gray-400 font-medium ml-2">• {(printingBooking as any).reference_number}</span>}
                                        </p>
                                    </div>
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3 min-h-[60px]">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Primary Location Address</p>
                                        <p className="font-bold text-navy-900 leading-relaxed uppercase text-[12px]">{printingBooking.address || '—'}</p>
                                    </div>
                                    {((printingBooking as any).service?.slug === 'ambulance-booking' || (printingBooking as any).service?.slug === 'funeral-service') && (
                                        <>
                                            <div className="border-r border-b border-gray-200 p-3">
                                                <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Pickup Address</p>
                                                <p className="font-bold text-navy-900 uppercase text-[11px]">{(printingBooking as any).pickup_address || '—'}</p>
                                            </div>
                                            <div className="border-r border-b border-gray-200 p-3">
                                                <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Drop Address</p>
                                                <p className="font-bold text-navy-900 uppercase text-[11px]">{(printingBooking as any).drop_address || '—'}</p>
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3 bg-gray-50/50 min-h-[50px]">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Additional Notes</p>
                                        <p className="text-gray-700 italic text-[11px] leading-relaxed">{printingBooking.notes || 'No additional instructions provided.'}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between items-end">
                                    <div className="space-y-3">
                                        <div className="w-24 h-24 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300 text-[8px] text-center p-2 uppercase font-black">
                                            NGO Seal /<br />Stamp Area
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Authorized Registration Copy</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6">Signature of Requester</p>
                                        <div className="w-40 border-t border-navy-900 pt-1.5">
                                            <p className="text-[10px] font-black uppercase text-navy-900">{printingBooking.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Generated: {new Date().toLocaleString()}</span>
                                <span>Support Helpline: +91 97733 44447</span>
                                <span>www.ziddimumbaikarngo.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            <ApprovalDetailModal
                isOpen={!!viewingBooking}
                onClose={() => setViewingBooking(null)}
                entityType="service_book"
                entityId={viewingBooking?.id || ''}
                title={viewingBooking?.name || 'Booking Details'}
            />
        </div>
    )
}
