'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ngoService, NgoService } from '@/services/ngoService.service'
import { donationService } from '@/services/donation.service'
import { fundraiserService, Fundraiser } from '@/services/fundraiser.service'
import { useRazorpay } from '@/hooks/useRazorpay'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    Truck,
    Stethoscope,
    Wind,
    Plus,
    Phone,
    MapPin,
    Calendar,
    Clock,
    ArrowRight,
    ChevronRight,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react'

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80'

const SERVICE_IMAGES: Record<string, string> = {
    'ambulance-booking': '/Ambulance.jpg',
    'deadbody-freezer': '/DeadBodyFreezer.jpg',
    'funeral-service': '/funeral_van.webp',
    'blood-donation': '/BloodDonation.jpg',
    'medical-consultation': '/MedicalConsultation.jpg',
}

const getServiceImage = (slug: string) => {
    return SERVICE_IMAGES[slug] || DEFAULT_IMAGE
}

// Icon mapping helper
const getIcon = (name: string | undefined) => {
    switch (name) {
        case 'ambulance': return <Truck className="w-6 h-6" />;
        case 'heart': return <Heart className="w-6 h-6" />;
        case 'truck': return <Truck className="w-6 h-6" />;
        case 'stethoscope': return <Stethoscope className="w-6 h-6" />;
        case 'wind': return <Wind className="w-6 h-6" />;
        default: return <Plus className="w-6 h-6" />;
    }
}

// Service URL mapping helper
const getServiceUrl = (slug: string) => {
    switch (slug) {
        case 'ambulance-service':
        case 'oxygen-service':
            return '/services/emergency-support';
        case 'blood-donation':
        case 'medical-consultation':
            return '/services/health-campaigns';
        case 'funeral-service':
            return '/services/local-assistance';
        default:
            return `#services`;
    }
}

export default function NgoServices() {
    const [services, setServices] = useState<NgoService[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState<NgoService | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [bookingData, setBookingData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        pickup_address: '',
        drop_address: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        notes: 'Requested via NGO Services section',
        age: '',
        gender: '',
        reference_name: '',
        reference_number: ''
    })
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [latestBookingId, setLatestBookingId] = useState<string | null>(null)
    const [showDonationPrompt, setShowDonationPrompt] = useState(false)
    const [donationAmount, setDonationAmount] = useState<string>('')
    const [showCustomAmount, setShowCustomAmount] = useState(false)
    const [isDonating, setIsDonating] = useState(false)
    const [donationSuccess, setDonationSuccess] = useState(false)
    const { openRazorpay } = useRazorpay()

    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await ngoService.getServices()
                if (response.success) {
                    setServices(response.data)
                }
            } catch (err) {
                console.error('Failed to fetch services:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    const validateForm = () => {
        const errors: Record<string, string> = {}
        
        if (!bookingData.name.trim()) errors.name = 'Full name is required'
        
        const phoneRegex = /^[6-9]\d{9}$/
        if (!bookingData.phone.trim()) {
            errors.phone = 'Phone number is required'
        } else if (!phoneRegex.test(bookingData.phone.replace(/\D/g, '').slice(-10))) {
            errors.phone = 'Please enter a valid 10-digit phone number'
        }

        if (bookingData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
            errors.email = 'Please enter a valid email address'
        }

        if (!bookingData.booking_date) {
            errors.booking_date = 'Required date is missing'
        } else {
            const selectedDate = new Date(bookingData.booking_date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (selectedDate < today) {
                errors.booking_date = 'Date cannot be in the past'
            }
        }

        if (!bookingData.address.trim()) {
            errors.address = 'Service address is required'
        }

        // Reference Phone validation (if provided)
        if (bookingData.reference_number.trim()) {
            if (!phoneRegex.test(bookingData.reference_number.replace(/\D/g, '').slice(-10))) {
                errors.reference_number = 'Please enter a valid 10-digit phone number'
            }
        }

        // Age validation (if provided)
        if (bookingData.age) {
            const ageNum = parseInt(bookingData.age, 10)
            if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
                errors.age = 'Please enter a valid age (1-120)'
            }
        }

        // Pickup/Drop validation for specific services
        if (selectedService?.slug === 'ambulance-booking' || selectedService?.slug === 'deadbody-freezer' || selectedService?.slug === 'funeral-service') {
            if (!bookingData.pickup_address.trim()) {
                errors.pickup_address = 'Pickup point is required'
            }
            if (!bookingData.drop_address.trim()) {
                errors.drop_address = 'Drop point is required'
            }
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedService) return

        if (!validateForm()) return

        setIsBooking(true)
        try {
            const response = await ngoService.bookService({
                ...bookingData,
                service_id: selectedService.id,
                age: bookingData.age ? parseInt(bookingData.age, 10) : undefined
            })
            if (response.success) {
                setBookingSuccess(true)
                setLatestBookingId(response.data.id)
                setShowDonationPrompt(true)
            }
        } catch (err) {
            console.error('Booking failed:', err)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsBooking(false)
        }
    }

    const handleDonation = async () => {
        if (!donationAmount) return

        setIsDonating(true)
        try {
            // Step 1: Create Razorpay order on backend
            const orderResponse = await donationService.createRazorpayOrder({
                amount: parseFloat(donationAmount),
                currency: 'INR',
                donor_name: bookingData.name || 'Anonymous Donor',
                donor_email: bookingData.email,
                donor_phone: bookingData.phone,
                message: `Donation for ${selectedService?.name} booking`,
                donation_type: 'service-booking',
                payment_method: 'card',
            })

            if (!orderResponse.success || !orderResponse.data) {
                throw new Error('Failed to create payment order')
            }

            const { donation_id, razorpay_order_id, amount: orderAmount, currency, key_id } = orderResponse.data

            // Step 2: Open Razorpay checkout popup
            const paymentResponse = await openRazorpay({
                key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                amount: orderAmount,
                currency,
                name: 'Ziddi Mumbaikar',
                description: `Support for ${selectedService?.name}`,
                image: '/logo.webp',
                order_id: razorpay_order_id,
                prefill: {
                    name: bookingData.name,
                    email: bookingData.email,
                    contact: bookingData.phone,
                },
                theme: { color: '#f0750a' },
                modal: { confirm_close: true },
            })

            // Step 3: Verify payment signature on backend
            await donationService.verifyPayment(donation_id, {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            })

            // Link the donation to the booking
            if (latestBookingId) {
                await ngoService.updateBookingDonation(latestBookingId, donation_id);
            }

            setDonationSuccess(true)
        } catch (err: any) {
            console.error('Donation error:', err)
            if (err.message !== 'Payment cancelled by user') {
                alert(err.message || 'Donation failed. Please try again.')
            }
        } finally {
            setIsDonating(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setBookingSuccess(false)
        setLatestBookingId(null)
        setDonationSuccess(false)
        setShowDonationPrompt(false)
        setDonationAmount('')
        setBookingData({
            name: '',
            phone: '',
            email: '',
            address: '',
            pickup_address: '',
            drop_address: '',
            booking_date: new Date().toISOString().split('T')[0],
            booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
            notes: 'Requested via NGO Services section',
            age: '',
            gender: '',
            reference_name: '',
            reference_number: ''
        })
    }

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (services.length === 0) return null

    return (
        <>
            <section id="services" className="py-24 bg-navy-900 text-white relative overflow-hidden print:hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-primary-500 font-bold tracking-widest uppercase text-sm mb-4 block"
                        >
                            Community Support
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            Free NGO Services For <span className="text-primary-500">Mumbaikars</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 max-w-2xl mx-auto text-lg"
                        >
                            We provide essential emergency services free of cost to those in need.
                            Professional support just a few clicks away.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-navy-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all group flex flex-col"
                            >
                                {/* Service Image */}
                                <div className="h-48 w-full overflow-hidden relative">
                                    <img
                                        src={getServiceImage(service.slug)}
                                        alt={service.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-800 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <div className="w-12 h-12 bg-primary-500/90 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl">
                                            {getIcon(service.icon)}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <h3 className="text-2xl font-bold group-hover:text-primary-500 transition-colors">
                                            <Link href={getServiceUrl(service.slug)}>
                                                {service.name}
                                            </Link>
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 mb-8 line-clamp-3">
                                        {service.description}
                                    </p>

                                    <div className="mt-auto space-y-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="inline-block bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {service.is_free ? 'Free of Cost' : 'Coming Soon'}
                                            </span>

                                            {service.is_free ? (
                                                <Link
                                                    href={`/services?s=${service.slug}`}
                                                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 text-sm whitespace-nowrap"
                                                >
                                                    Book Now
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {isModalOpen && selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
                        <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white text-navy-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10 overflow-hidden"
                        >
                            {bookingSuccess ? (
                                <div className="p-8 md:p-12 text-center overflow-y-auto">
                                    <AnimatePresence mode="wait">
                                        {!donationSuccess ? (
                                            <motion.div
                                                key="donation-prompt"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <CheckCircle2 className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-navy-900 mb-2">Booking Confirmed!</h3>
                                                <div className="bg-gray-100/80 inline-block px-4 py-2 rounded-lg mb-4 border border-gray-200">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Ref ID:</span>
                                                    <span className="font-mono font-bold text-navy-900 text-sm tracking-wider">{String(latestBookingId).substring(0, 8).toUpperCase()}</span>
                                                </div>
                                                <p className="text-gray-500 mb-8 px-4">Our team will call you within 15-30 minutes for coordination.</p>

                                                <div className="bg-navy-50 rounded-[2.5rem] p-8 border border-navy-100 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                                    <h4 className="text-navy-900 font-bold text-lg mb-2">Support Our Free Services</h4>
                                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                                        This service is 100% free. If you&apos;d like to support our mission and help us keep these services free for everyone, consider a small donation.
                                                    </p>

                                                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                                                        {['100', '500', '1000'].map(amt => (
                                                            <button
                                                                key={amt}
                                                                type="button"
                                                                onClick={() => {
                                                                    setDonationAmount(amt)
                                                                    setShowCustomAmount(false)
                                                                }}
                                                                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${donationAmount === amt && !showCustomAmount ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-navy-900 border border-gray-200 hover:border-primary-500'}`}
                                                            >
                                                                ₹{amt}
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowCustomAmount(true)
                                                                setDonationAmount('')
                                                            }}
                                                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${showCustomAmount ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-navy-900 border border-gray-200 hover:border-primary-500'}`}
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
                                                                className="relative mb-6 overflow-hidden"
                                                            >
                                                                <input
                                                                    type="number"
                                                                    placeholder="Enter Custom Amount"
                                                                    value={donationAmount}
                                                                    onChange={(e) => setDonationAmount(e.target.value)}
                                                                    className="w-full bg-white border-2 border-primary-500/30 rounded-xl px-4 py-3 focus:border-primary-500 outline-none text-center font-bold"
                                                                    autoFocus
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={handleDonation}
                                                            disabled={isDonating || !donationAmount}
                                                            className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                                                        >
                                                            {isDonating ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Heart className="w-5 h-5 fill-white/20" />
                                                                    Donate & Support
                                                                </>
                                                            )}
                                                        </button>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => window.print()}
                                                                className="bg-white text-navy-900 border border-gray-200 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                                Download
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={closeModal}
                                                                className="bg-navy-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-navy-800 transition-all flex items-center justify-center"
                                                            >
                                                                Skip & Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="donation-success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="py-10"
                                            >
                                                <div className="w-20 h-20 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Heart className="w-12 h-12 fill-primary-500" />
                                                </div>
                                                <h3 className="text-3xl font-black text-navy-900 mb-2">Big Heart, Big Change!</h3>
                                                <div className="bg-gray-100/80 inline-block px-4 py-2 rounded-lg mb-4 border border-gray-200">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Ref ID:</span>
                                                    <span className="font-mono font-bold text-navy-900 text-sm tracking-wider">{String(latestBookingId).substring(0, 8).toUpperCase()}</span>
                                                </div>
                                                <p className="text-lg text-gray-500 mb-8">
                                                    Your donation of ₹{donationAmount} helps us continue serving Mumbai.
                                                    We appreciate your incredible support.
                                                </p>

                                                <div className="space-y-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.print()}
                                                        className="bg-navy-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-navy-800 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                        Download Service Form
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={closeModal}
                                                        className="text-gray-500 font-bold hover:text-navy-900 transition-colors mx-auto block"
                                                    >
                                                        Close Overview
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} className="flex flex-col h-full overflow-hidden">
                                    <div className="bg-navy-900 p-8 text-white relative flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="absolute top-6 right-6 text-white/50 hover:text-white"
                                        >
                                            <Plus className="w-6 h-6 rotate-45" />
                                        </button>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                {getIcon(selectedService.icon)}
                                            </div>
                                            <h3 className="text-2xl font-bold">Book {selectedService.name}</h3>
                                        </div>
                                        <p className="text-white/60 text-sm">Fill in the details below and our team will coordinate with you.</p>
                                    </div>

                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Full Name</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.name}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, name: e.target.value })
                                                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                                                    }}
                                                />
                                                <Plus className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
                                            {formErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.name}</p>}
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="+91 00000 00000"
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.phone}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, phone: e.target.value })
                                                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' })
                                                    }}
                                                />
                                                <Phone className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
                                            {formErrors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.phone}</p>}
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.email}
                                                    onChange={e => setBookingData({ ...bookingData, email: e.target.value })}
                                                />
                                                <Plus className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 rotate-45" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Patient Age (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="E.g. 45"
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all ${formErrors.age ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.age}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, age: e.target.value })
                                                        if (formErrors.age) setFormErrors({ ...formErrors, age: '' })
                                                    }}
                                                />
                                            </div>
                                            {formErrors.age && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.age}</p>}
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Patient Gender (Optional)</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all appearance-none"
                                                    value={bookingData.gender}
                                                    onChange={e => setBookingData({ ...bookingData, gender: e.target.value })}
                                                >
                                                    <option value="" disabled>Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <ChevronRight className="w-5 h-5 absolute right-4 top-3.5 text-gray-400 rotate-90 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Reference Name (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Referred By..."
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all"
                                                    value={bookingData.reference_name}
                                                    onChange={e => setBookingData({ ...bookingData, reference_name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Reference Phone Number (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Reference Phone..."
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all ${formErrors.reference_number ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.reference_number}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, reference_number: e.target.value })
                                                        if (formErrors.reference_number) setFormErrors({ ...formErrors, reference_number: '' })
                                                    }}
                                                />
                                            </div>
                                            {formErrors.reference_number && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.reference_number}</p>}
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Service Location Address</label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    rows={2}
                                                    placeholder="Full address where service is required in Mumbai"
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.address ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.address}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, address: e.target.value })
                                                        if (formErrors.address) setFormErrors({ ...formErrors, address: '' })
                                                    }}
                                                />
                                                <MapPin className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                                            </div>
                                            {formErrors.address && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.address}</p>}
                                        </div>

                                        {(selectedService.slug === 'ambulance-booking' || selectedService.slug === 'deadbody-freezer' || selectedService.slug === 'funeral-service') && (
                                            <>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pickup Address</label>
                                                    <div className="relative">
                                                        <textarea
                                                            rows={2}
                                                            placeholder="From..."
                                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.pickup_address ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                            value={bookingData.pickup_address}
                                                            onChange={e => {
                                                                setBookingData({ ...bookingData, pickup_address: e.target.value })
                                                                if (formErrors.pickup_address) setFormErrors({ ...formErrors, pickup_address: '' })
                                                            }}
                                                        />
                                                        <MapPin className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                                                    </div>
                                                    {formErrors.pickup_address && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.pickup_address}</p>}
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Drop Address</label>
                                                    <div className="relative">
                                                        <textarea
                                                            rows={2}
                                                            placeholder="To..."
                                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.drop_address ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                            value={bookingData.drop_address}
                                                            onChange={e => {
                                                                setBookingData({ ...bookingData, drop_address: e.target.value })
                                                                if (formErrors.drop_address) setFormErrors({ ...formErrors, drop_address: '' })
                                                            }}
                                                        />
                                                        <MapPin className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                                                    </div>
                                                    {formErrors.drop_address && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.drop_address}</p>}
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Date</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 outline-none transition-all pl-11 ${formErrors.booking_date ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-500'}`}
                                                    value={bookingData.booking_date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, booking_date: e.target.value })
                                                        if (formErrors.booking_date) setFormErrors({ ...formErrors, booking_date: '' })
                                                    }}
                                                />
                                                <Calendar className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
                                            {formErrors.booking_date && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formErrors.booking_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Time</label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.booking_time}
                                                    onChange={e => setBookingData({ ...bookingData, booking_time: e.target.value })}
                                                />
                                                <Clock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Any Additional Notes</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Specific requirements or landmarks..."
                                                className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all"
                                                value={bookingData.notes}
                                                onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 pt-4 mt-auto flex-shrink-0 border-t border-gray-100">
                                        <button
                                            disabled={isBooking}
                                            type="submit"
                                            className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isBooking ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Confirm Booking Request"
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
                                            This service is 100% free of cost provided by Ziddi Mumbaikar
                                        </p>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div >
                )
                }
            </section >

            {/* --- PRINT ONLY SERVICE FORM --- */}
            {
                isModalOpen && selectedService && latestBookingId && (
                    <div className="hidden print:block fixed inset-0 bg-white z-[99999] text-black font-sans w-[210mm] mx-auto p-8">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .print-form-container, .print-form-container * { visibility: visible; }
                        .print-form-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; box-sizing: border-box; }
                        @page { size: portrait; margin: 10mm; }
                    }
                ` }} />

                        <div className="print-form-container bg-white w-full h-full">
                            <div className="text-center mb-4">
                                <img src="/logo.webp" alt="Ziddi Mumbaikar" className="w-20 h-20 mx-auto object-contain" />
                            </div>

                            <div className="border border-gray-300 rounded-sm shadow-sm text-[12px]">
                                <div className="bg-gray-50 border-b border-gray-300 py-2 px-4">
                                    <h2 className="text-[16px] font-bold text-gray-900 m-0">
                                        {selectedService.name} Form : Entry # {String(latestBookingId).substring(0, 8).toUpperCase()}
                                    </h2>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Patient / Requester Full Name</p>
                                    <p className="text-gray-700 ml-4">{bookingData.name || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Mobile Number</p>
                                    <p className="text-gray-700 ml-4">{bookingData.phone || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Email Address</p>
                                    <p className="text-blue-600 underline ml-4">{bookingData.email || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Patient Details</p>
                                    <p className="text-gray-700 ml-4">
                                        Age: {bookingData.age || '—'} | Gender: {bookingData.gender ? bookingData.gender.charAt(0).toUpperCase() + bookingData.gender.slice(1) : '—'}
                                    </p>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Reference Info</p>
                                    <p className="text-gray-700 ml-4">
                                        Name: {bookingData.reference_name || '—'} | Phone: {bookingData.reference_number || '—'}
                                    </p>
                                </div>

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Service Location (Home Address)</p>
                                    <p className="text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.address || '—'}</p>
                                </div>

                                {(selectedService.slug === 'ambulance-booking' || selectedService.slug === 'deadbody-freezer' || selectedService.slug === 'funeral-service') && (
                                    <>
                                        <div className="border-b border-gray-200 py-2 px-4">
                                            <p className="font-bold text-gray-800 mb-1">Pick Up Address</p>
                                            <p className="text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.pickup_address || '—'}</p>
                                        </div>
                                        <div className="border-b border-gray-200 py-2 px-4">
                                            <p className="font-bold text-gray-800 mb-1">Drop Off Address</p>
                                            <p className="text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.drop_address || '—'}</p>
                                        </div>
                                    </>
                                )}

                                <div className="border-b border-gray-200 py-2 px-4">
                                    <p className="font-bold text-gray-800 mb-1">Booking Date & Time</p>
                                    <p className="text-gray-700 ml-4">
                                        {bookingData.booking_date ? new Date(bookingData.booking_date).toLocaleDateString('en-GB') : '—'}
                                        {bookingData.booking_time ? ` at ${bookingData.booking_time}` : ''}
                                    </p>
                                </div>

                                <div className="py-2 px-4 bg-gray-50/50 flex-grow">
                                    <p className="font-bold text-gray-800 mb-1">Additional Notes</p>
                                    <p className="text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.notes || '—'}</p>
                                </div>
                            </div>

                            <div className="mt-8 text-center text-gray-400 text-xs font-semibold tracking-widest uppercase">
                                Ziddi Mumbaikar NGO • Free Service
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
