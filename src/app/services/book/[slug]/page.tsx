'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ngoService, NgoService } from '@/services/ngoService.service'
import { fundraiserService } from '@/services/fundraiser.service'
import { donationService } from '@/services/donation.service'
import { useRazorpay } from '@/hooks/useRazorpay'
import ImageEditor from '@/components/ImageEditor'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Heart, Stethoscope, Wind, Plus, Activity,
    ChevronLeft, CheckCircle2, Shield, Calendar, Clock, Upload, X, FileText,
    ArrowRight, Share2, Copy, Download, Printer
} from 'lucide-react'

const getIcon = (name: string | undefined) => {
    switch (name) {
        case 'ambulance': return <Truck className="w-5 h-5" />;
        case 'heart': return <Heart className="w-5 h-5" />;
        case 'stethoscope': return <Stethoscope className="w-5 h-5" />;
        case 'wind': return <Wind className="w-5 h-5" />;
        default: return <Plus className="w-5 h-5" />;
    }
}

const inputCls = (err?: string) =>
    `w-full bg-white border-2 rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-gray-300 font-medium text-sm ${err ? 'border-red-400 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`

const labelCls = "text-xs font-black text-navy-900 uppercase tracking-wider block mb-1"

function FocusedBookingContent() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [service, setService] = useState<NgoService | null>(null)
    const [loading, setLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
    const [showImageEditor, setShowImageEditor] = useState(false)
    const [editorFile, setEditorFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [latestBookingId, setLatestBookingId] = useState<string | null>(null)
    const [showDonationPrompt, setShowDonationPrompt] = useState(false)
    const [donationAmount, setDonationAmount] = useState<string>('')
    const [showCustomAmount, setShowCustomAmount] = useState(false)
    const [isDonating, setIsDonating] = useState(false)
    const [donationSuccess, setDonationSuccess] = useState(false)
    const { openRazorpay } = useRazorpay()

    const [bookingData, setBookingData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        pickup_address: '',
        drop_address: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        notes: `Direct booking via focused link for ${slug}`,
        age: '',
        gender: 'male',
        reference_name: '',
        reference_number: ''
    })

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await ngoService.getServices()
                if (response.success) {
                    const found = response.data.find(s => s.slug === slug)
                    if (found) setService(found)
                    else router.push('/services')
                }
            } catch (err) {
                console.error('Failed to fetch service:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchService()
    }, [slug, router])

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!bookingData.name.trim()) errors.name = 'Full name is required'
        const phoneRegex = /^[6-9]\d{9}$/
        if (!bookingData.phone.trim()) {
            errors.phone = 'Phone number is required'
        } else if (!phoneRegex.test(bookingData.phone.replace(/\D/g, '').slice(-10))) {
            errors.phone = 'Please enter a valid 10-digit phone number'
        }
        if (!bookingData.address.trim()) errors.address = 'Service address is required'
        if (
            service?.slug === 'ambulance-booking' ||
            service?.slug === 'ambulance-service' ||
            service?.slug === 'funeral-service' ||
            service?.slug === 'funeral-booking' ||
            service?.slug === 'funeral-van-service'
        ) {
            if (!bookingData.pickup_address.trim()) errors.pickup_address = 'Pickup point is required'
            if (!bookingData.drop_address.trim()) errors.drop_address = 'Drop point is required'
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!service) return
        if (!validateForm()) return

        setIsBooking(true)
        try {
            let attachment_url = undefined
            if (attachmentFile) {
                const uploadRes = await fundraiserService.uploadMedia(attachmentFile, 'services')
                if (uploadRes.success && uploadRes.data?.url) attachment_url = uploadRes.data.url
            }

            const response = await ngoService.bookService({
                ...bookingData,
                service_id: service.id,
                attachment_url,
                age: bookingData.age ? parseInt(bookingData.age, 10) : undefined
            })

            if (response.success) {
                setBookingSuccess(true)
                setLatestBookingId(response.data.id)
                setShowDonationPrompt(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (err) {
            console.error('Booking failed:', err)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsBooking(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.type.startsWith('image/')) {
            setEditorFile(file)
            setShowImageEditor(true)
        } else if (file.type === 'application/pdf') {
            setAttachmentFile(file)
            setAttachmentPreview(null)
        } else {
            alert('Please upload an image or PDF file.')
        }
    }

    const handleEditorSave = (editedFile: File) => {
        setAttachmentFile(editedFile)
        setAttachmentPreview(URL.createObjectURL(editedFile))
        setShowImageEditor(false)
        setEditorFile(null)
    }

    const handleRemoveAttachment = () => {
        setAttachmentFile(null)
        setAttachmentPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleDonation = async () => {
        if (!donationAmount) return
        setIsDonating(true)
        try {
            const orderResponse = await donationService.createRazorpayOrder({
                amount: parseFloat(donationAmount),
                currency: 'INR',
                donor_name: bookingData.name || 'Anonymous Donor',
                donor_email: bookingData.email,
                donor_phone: bookingData.phone,
                message: `Donation for ${service?.name} focused booking`,
                donation_type: 'service-booking',
                payment_method: 'card',
            })
            if (!orderResponse.success || !orderResponse.data) throw new Error('Failed to create payment order')
            const { donation_id, razorpay_order_id, amount: orderAmount, currency, key_id } = orderResponse.data
            const paymentResponse = await openRazorpay({
                key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                amount: orderAmount,
                currency,
                name: 'Ziddi Mumbaikar',
                description: `Support for ${service?.name}`,
                image: '/logo.webp',
                order_id: razorpay_order_id,
                prefill: { name: bookingData.name, email: bookingData.email, contact: bookingData.phone },
                theme: { color: '#f0750a' },
                modal: { confirm_close: true },
            })
            await donationService.verifyPayment(donation_id, {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            })
            if (latestBookingId) await ngoService.updateBookingDonation(latestBookingId, donation_id)
            setDonationSuccess(true)
        } catch (err: any) {
            console.error('Donation error:', err)
            if (err.message !== 'Payment cancelled by user') alert(err.message || 'Donation failed. Please try again.')
        } finally {
            setIsDonating(false)
        }
    }

    const resetBooking = () => {
        setBookingSuccess(false)
        setLatestBookingId(null)
        setDonationSuccess(false)
        setShowDonationPrompt(false)
        setDonationAmount('')
        setAttachmentFile(null)
        setAttachmentPreview(null)
        setBookingData({
            name: '',
            phone: '',
            email: '',
            address: '',
            pickup_address: '',
            drop_address: '',
            booking_date: new Date().toISOString().split('T')[0],
            booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
            notes: `Direct booking via focused link for ${slug}`,
            age: '',
            gender: 'male',
            reference_name: '',
            reference_number: ''
        })
    }

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!service) return null

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 pt-20 md:pt-24 pb-12 px-3 md:px-4">
                <div className="max-w-xl md:max-w-2xl mx-auto">
                    {/* Back Link */}
                    <Link href="/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 font-bold text-sm transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        All Services
                    </Link>

                    <div className="bg-white rounded-3xl shadow-xl shadow-navy-900/5 border border-gray-100">
                        {bookingSuccess ? (
                            <div className="md:p-8 p-6 text-center">
                                <AnimatePresence mode="wait">
                                    {!donationSuccess ? (
                                        <motion.div
                                            key="donation-prompt"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                        >
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-600/10">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-navy-900 mb-2">Request Sent!</h2>
                                            <div className="bg-gray-100 inline-block px-4 py-1.5 rounded-lg mb-6 border border-gray-200">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2">Ref ID:</span>
                                                <span className="font-mono font-bold text-navy-900">{String(latestBookingId).substring(0, 10).toUpperCase()}</span>
                                            </div>
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                                                Our team will contact you on <span className="text-navy-900 font-bold">{bookingData.phone}</span> shortly. Please keep your documents ready.
                                            </p>

                                            <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 text-left relative">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-3xl" />
                                                <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/10">
                                                        <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary-500 fill-primary-500/20" />
                                                    </div>
                                                    <div className="flex-1 w-full">
                                                        <h4 className="text-sm md:text-base font-black text-navy-900 mb-1">Support Free NGO Services</h4>
                                                        <p className="text-gray-500 text-[12px] md:text-[13px] mb-4 leading-relaxed">
                                                            Your voluntary donation helps us keep these emergency services 100% free for all Mumbaikars.
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mb-5">
                                                            {['200', '500', '1000'].map(amt => (
                                                                <button
                                                                    key={amt}
                                                                    type="button"
                                                                    onClick={() => { setDonationAmount(amt); setShowCustomAmount(false) }}
                                                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2
                                                                        ${donationAmount === amt && !showCustomAmount
                                                                            ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                                            : 'bg-white border-gray-200 text-navy-900 hover:border-primary-500'}`}
                                                                >
                                                                    ₹{amt}
                                                                </button>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => { setShowCustomAmount(true); setDonationAmount('') }}
                                                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2
                                                                    ${showCustomAmount
                                                                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                                        : 'bg-white border-gray-200 text-navy-900 hover:border-primary-500'}`}
                                                            >
                                                                Custom
                                                            </button>
                                                        </div>
                                                        <AnimatePresence>
                                                            {showCustomAmount && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="relative mb-5 overflow-hidden"
                                                                >
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Enter Custom Amount"
                                                                        value={donationAmount}
                                                                        onChange={(e) => setDonationAmount(e.target.value)}
                                                                        className="w-full bg-white border-2 border-primary-500/30 rounded-xl px-4 py-3 focus:border-primary-500 outline-none font-bold text-sm shadow-inner"
                                                                        autoFocus
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">INR</span>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                                            <button
                                                                onClick={handleDonation}
                                                                disabled={isDonating || !donationAmount}
                                                                className="w-full bg-primary-500 text-white py-4 rounded-xl font-black text-sm md:text-base hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                                                            >
                                                                {isDonating
                                                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    : <Heart className="w-5 h-5 fill-white/20" />}
                                                                Support Mission
                                                            </button>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button
                                                                    onClick={() => window.print()}
                                                                    className="bg-white text-navy-900 border-2 border-navy-900 py-3 rounded-xl font-black text-[10px] md:text-xs hover:bg-navy-50 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Printer className="w-4 h-4" />
                                                                    Download
                                                                </button>
                                                                <button
                                                                    onClick={resetBooking}
                                                                    className="bg-navy-900 text-white py-3 rounded-xl font-black text-[10px] md:text-xs hover:bg-navy-800 transition-all"
                                                                >
                                                                    New Request
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="donation-success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-10"
                                        >
                                            <div className="w-20 h-20 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/10">
                                                <Heart className="w-10 h-10 fill-primary-500" />
                                            </div>
                                            <h2 className="text-3xl font-black text-navy-900 mb-3">Amazing Support!</h2>
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                                                Your contribution of ₹{donationAmount} directly helps us reach more families in need. Thank you for being a Ziddi Mumbaikar!
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <button
                                                    onClick={() => window.print()}
                                                    className="bg-primary-500 text-white px-10 py-3.5 rounded-xl font-black text-xs hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Download Form
                                                </button>
                                                <button
                                                    onClick={resetBooking}
                                                    className="bg-navy-900 text-white px-10 py-3.5 rounded-xl font-black text-xs hover:bg-navy-800 transition-all"
                                                >
                                                    Back Home
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex flex-col overflow-hidden rounded-3xl">
                                {/* Focused Header */}
                                <div className="bg-navy-900 md:p-8 p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-primary-400">
                                            {getIcon(service.icon)}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1 block">Quick Booking</span>
                                            <h1 className="text-3xl font-black uppercase tracking-tight">{service.name}</h1>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-bold text-gray-300">Available 24/7 for Mumbai</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleBooking} className="md:p-8 p-5 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className={labelCls}>Your Full Name <span className="text-red-500">*</span></label>
                                                    <input
                                                        required type="text" placeholder="e.g. Rahul Sharma"
                                                        className={inputCls(formErrors.name)}
                                                        value={bookingData.name}
                                                        onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                                                    />
                                                    {formErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formErrors.name}</p>}
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Contact Phone <span className="text-red-500">*</span></label>
                                                    <input
                                                        required type="tel" placeholder="10-digit mobile number"
                                                        className={inputCls(formErrors.phone)}
                                                        value={bookingData.phone}
                                                        onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                                                    />
                                                    {formErrors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formErrors.phone}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelCls}>Full Service Address <span className="text-red-500">*</span></label>
                                                <textarea
                                                    required rows={3} placeholder="Complete address with landmark"
                                                    className={inputCls(formErrors.address)}
                                                    value={bookingData.address}
                                                    onChange={e => setBookingData({ ...bookingData, address: e.target.value })}
                                                />
                                                {formErrors.address && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formErrors.address}</p>}
                                            </div>
                                        </div>

                                        {(service.slug === 'ambulance-booking' || service.slug === 'ambulance-service' || service.slug === 'funeral-service' || service.slug === 'funeral-booking' || service.slug === 'funeral-van-service') && (
                                            <>
                                                <div>
                                                    <label className={labelCls}>Pickup Point <span className="text-red-500">*</span></label>
                                                    <input
                                                        required type="text" placeholder="From where?"
                                                        className={inputCls(formErrors.pickup_address)}
                                                        value={bookingData.pickup_address}
                                                        onChange={e => setBookingData({ ...bookingData, pickup_address: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Drop Point <span className="text-red-500">*</span></label>
                                                    <input
                                                        required type="text" placeholder="To where?"
                                                        className={inputCls(formErrors.drop_address)}
                                                        value={bookingData.drop_address}
                                                        onChange={e => setBookingData({ ...bookingData, drop_address: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>Age</label>
                                                <input
                                                    type="number" placeholder="Age"
                                                    className={inputCls()}
                                                    value={bookingData.age}
                                                    onChange={e => setBookingData({ ...bookingData, age: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Gender</label>
                                                <select
                                                    className={inputCls()}
                                                    value={bookingData.gender}
                                                    onChange={e => setBookingData({ ...bookingData, gender: e.target.value })}
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Required Date</label>
                                            <input
                                                type="date"
                                                className={inputCls()}
                                                value={bookingData.booking_date}
                                                onChange={e => setBookingData({ ...bookingData, booking_date: e.target.value })}
                                            />
                                        </div>

                                        {/* Reference Info */}
                                        <div>
                                            <label className={labelCls}>Reference Name (Optional)</label>
                                            <input
                                                type="text" placeholder="Who referred you?"
                                                className={inputCls()}
                                                value={bookingData.reference_name}
                                                onChange={e => setBookingData({ ...bookingData, reference_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Reference Phone (Optional)</label>
                                            <input
                                                type="tel" placeholder="Reference mobile number"
                                                className={inputCls()}
                                                value={bookingData.reference_number}
                                                onChange={e => setBookingData({ ...bookingData, reference_number: e.target.value })}
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div className="md:col-span-2">
                                            <label className={labelCls}>Additional Notes / Landmarks</label>
                                            <textarea
                                                rows={2} placeholder="Any specific requirements or landmark to find you easily..."
                                                className={inputCls()}
                                                value={bookingData.notes}
                                                onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={labelCls}>Medical File / ID Document (Optional)</label>
                                            <input
                                                type="file" ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*,application/pdf"
                                                className="hidden"
                                            />
                                            {!attachmentFile ? (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full border-2 border-dashed border-gray-100 rounded-xl p-5 hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-400 group"
                                                >
                                                    <div className="w-10 h-10 bg-gray-50 group-hover:bg-primary-100 rounded-full flex items-center justify-center transition-colors">
                                                        <Upload className="w-4 h-4 group-hover:text-primary-500 transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-gray-600 group-hover:text-primary-600 text-sm transition-colors">Click to upload document</p>
                                                        <p className="text-[10px] mt-0.5 uppercase font-bold tracking-wider">Images (JPG, PNG) or PDF</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 border-2 border-primary-500 rounded-xl bg-primary-50/30 flex items-center gap-3 relative overflow-hidden group">
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveAttachment}
                                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    {attachmentPreview ? (
                                                        <img src={attachmentPreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-red-100 text-red-500 flex items-center justify-center rounded-lg shrink-0">
                                                            <FileText className="w-7 h-7" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0 pr-8">
                                                        <p className="font-bold text-navy-900 text-sm truncate">{attachmentFile.name}</p>
                                                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider mt-0.5">
                                                            {(attachmentFile.size / 1024 / 1024).toFixed(2)} MB • Ready to attach
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            disabled={isBooking}
                                            type="submit"
                                            className="w-full bg-primary-500 text-white py-4 rounded-2xl font-black text-base hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/25 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            {isBooking ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Shield className="w-5 h-5" />
                                                    Submit Request
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                                            Trusted by thousands of Mumbaikars
                                        </p>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            <AnimatePresence>
                {showImageEditor && editorFile && (
                    <ImageEditor
                        file={editorFile}
                        onSave={handleEditorSave}
                        onCancel={() => {
                            setShowImageEditor(false)
                            setEditorFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Print Template */}
            {service && latestBookingId && (
                <div className="hidden print-block fixed inset-0 bg-white text-black font-sans w-[190mm] mx-auto p-0 z-[300] overflow-hidden">
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
                            footer, header, main, nav, .no-print { display: none !important; }
                        }
                    ` }} />
                    <div className="print-block print-form-container bg-white w-full h-full border-2 border-gray-900 p-1">
                        <div className="border border-gray-300 p-6 md:p-8">
                            <div className="text-center mb-6">
                                <img src="/logo.webp" alt="Ziddi Mumbaikar" className="w-20 h-20 mx-auto object-contain mb-3" />
                                <h1 className="text-xl font-black uppercase tracking-tighter">Ziddi Mumbaikar NGO</h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Emergency Support Service Registration</p>
                            </div>

                            <div className="space-y-0 text-[12px]">
                                <div className="bg-navy-900 text-white py-2.5 px-5 flex justify-between items-center mb-5">
                                    <h2 className="font-black uppercase tracking-tight m-0 text-sm">{service.name}</h2>
                                    <span className="font-mono text-xs underline decoration-primary-500 underline-offset-4">Ref ID: {String(latestBookingId).substring(0, 10).toUpperCase()}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-0 border-t border-l border-gray-200">
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Full Name</p>
                                        <p className="font-bold text-navy-900 uppercase">{bookingData.name || '—'}</p>
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Contact Details</p>
                                        <p className="font-bold text-navy-900">{bookingData.phone || '—'}</p>
                                        {bookingData.email && <p className="text-[10px] font-medium text-gray-500">{bookingData.email}</p>}
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Patient Vitals</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {bookingData.age ? `${bookingData.age} Yrs` : 'Age N/A'} • {bookingData.gender.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Booking Schedule</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {new Date(bookingData.booking_date).toLocaleDateString('en-GB')}
                                            <span className="text-gray-400 font-medium ml-2">@{bookingData.booking_time}</span>
                                        </p>
                                    </div>
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Reference & Help</p>
                                        <p className="font-bold text-navy-900 uppercase">
                                            {bookingData.reference_name || 'Direct Walk-in'} 
                                            {bookingData.reference_number && <span className="text-gray-400 font-medium ml-2">• {bookingData.reference_number}</span>}
                                        </p>
                                    </div>
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3 min-h-[60px]">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Primary Location Address</p>
                                        <p className="font-bold text-navy-900 leading-relaxed uppercase text-[12px]">{bookingData.address || '—'}</p>
                                    </div>
                                    {(service.slug === 'ambulance-booking' || service.slug === 'ambulance-service' || service.slug === 'funeral-service' || service.slug === 'funeral-booking' || service.slug === 'funeral-van-service') && (
                                        <>
                                            <div className="border-r border-b border-gray-200 p-3">
                                                <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Pickup Address</p>
                                                <p className="font-bold text-navy-900 uppercase text-[11px]">{bookingData.pickup_address || '—'}</p>
                                            </div>
                                            <div className="border-r border-b border-gray-200 p-3">
                                                <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Drop Address</p>
                                                <p className="font-bold text-navy-900 uppercase text-[11px]">{bookingData.drop_address || '—'}</p>
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-2 border-r border-b border-gray-200 p-3 bg-gray-50/50 min-h-[50px]">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Additional Notes</p>
                                        <p className="text-gray-700 italic text-[11px] leading-relaxed">{bookingData.notes || 'No additional instructions provided.'}</p>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-end">
                                    <div className="space-y-4">
                                        <div className="w-32 h-32 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300 text-[10px] text-center p-2 uppercase font-black">
                                            NGO Seal /<br />Stamp Area
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Authorized Registration Copy</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">Signature of Requester</p>
                                        <div className="w-48 border-t border-navy-900 pt-2">
                                            <p className="text-[11px] font-black uppercase">{bookingData.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Generated: {new Date().toLocaleString()}</span>
                                <span>Support Helpline: +91 97733 44447</span>
                                <span>www.ziddimumbaikarngo.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DirectBookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <FocusedBookingContent />
        </Suspense>
    )
}
