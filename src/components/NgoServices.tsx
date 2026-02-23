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
        booking_date: '',
        booking_time: '',
        notes: ''
    })
    const [isBooking, setIsBooking] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [latestBookingId, setLatestBookingId] = useState<string | null>(null)
    const [showDonationPrompt, setShowDonationPrompt] = useState(false)
    const [donationAmount, setDonationAmount] = useState<string>('')
    const [isDonating, setIsDonating] = useState(false)
    const [donationSuccess, setDonationSuccess] = useState(false)
    const { openRazorpay } = useRazorpay()

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

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedService) return

        setIsBooking(true)
        try {
            const response = await ngoService.bookService({
                service_id: selectedService.id,
                ...bookingData
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
            booking_date: '',
            booking_time: '',
            notes: ''
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
                                                Free of Cost
                                            </span>

                                            <button
                                                onClick={() => {
                                                    setSelectedService(service)
                                                    setIsModalOpen(true)
                                                }}
                                                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 text-sm whitespace-nowrap"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Booking Modal */}
                {isModalOpen && selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
                        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white text-navy-900 w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden"
                        >
                            {bookingSuccess ? (
                                <div className="p-8 md:p-12 text-center">
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
                                                                onClick={() => setDonationAmount(amt)}
                                                                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${donationAmount === amt ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-navy-900 border border-gray-200 hover:border-primary-500'}`}
                                                            >
                                                                ₹{amt}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="relative mb-6">
                                                        <input
                                                            type="number"
                                                            placeholder="Other Amount"
                                                            value={donationAmount}
                                                            onChange={(e) => setDonationAmount(e.target.value)}
                                                            className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary-500 outline-none text-center font-bold"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleDonation}
                                                            disabled={isDonating || !donationAmount}
                                                            className="w-full bg-navy-900 text-white py-4 rounded-xl font-bold hover:bg-navy-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {isDonating ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : 'Donate & Support'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => window.print()}
                                                            className="w-full bg-white text-navy-900 border-2 border-navy-900 py-3.5 rounded-xl font-bold hover:bg-navy-50 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                            Download Form (No Donation)
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={closeModal}
                                                            className="text-gray-400 font-bold text-sm hover:text-navy-900 transition-colors mt-2"
                                                        >
                                                            Skip & Close Details
                                                        </button>
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
                                <form onSubmit={handleBooking} className="flex flex-col h-full">
                                    <div className="bg-navy-900 p-8 text-white relative">
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
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.name}
                                                    onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                                                />
                                                <Plus className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="+91 00000 00000"
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.phone}
                                                    onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                                                />
                                                <Phone className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
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

                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Service Location Address</label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    rows={2}
                                                    placeholder="Full address where service is required in Mumbai"
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.address}
                                                    onChange={e => setBookingData({ ...bookingData, address: e.target.value })}
                                                />
                                                <MapPin className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                                            </div>
                                        </div>

                                        {(selectedService.slug === 'ambulance-booking' || selectedService.slug === 'deadbody-freezer' || selectedService.slug === 'funeral-service') && (
                                            <>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pickup Address</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="From..."
                                                            className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                            value={bookingData.pickup_address}
                                                            onChange={e => setBookingData({ ...bookingData, pickup_address: e.target.value })}
                                                        />
                                                        <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Drop Address</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="To..."
                                                            className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                            value={bookingData.drop_address}
                                                            onChange={e => setBookingData({ ...bookingData, drop_address: e.target.value })}
                                                        />
                                                        <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Date</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full bg-gray-50 border-gray-200 border-2 rounded-xl px-4 py-3 focus:border-primary-500 outline-none transition-all pl-11"
                                                    value={bookingData.booking_date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={e => setBookingData({ ...bookingData, booking_date: e.target.value })}
                                                />
                                                <Calendar className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                                            </div>
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

                                    <div className="p-8 pt-0 mt-auto">
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
                    <div className="hidden print:block fixed inset-0 bg-white z-[99999] text-black font-sans w-[210mm] mx-auto p-12">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .print-form-container, .print-form-container * { visibility: visible; }
                        .print-form-container { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
                        @page { size: portrait; margin: 0; }
                    }
                ` }} />

                        <div className="print-form-container bg-white w-full h-full pb-20">
                            <div className="text-center mb-8">
                                <img src="/logo.webp" alt="Ziddi Mumbaikar" className="w-32 h-32 mx-auto object-contain" />
                            </div>

                            <div className="border border-gray-300 rounded-t-sm shadow-sm">
                                <div className="bg-gray-50 border-b border-gray-300 p-4">
                                    <h2 className="text-[18px] font-bold text-gray-900 m-0">
                                        {selectedService.name} Form : Entry # {String(latestBookingId).substring(0, 8).toUpperCase()}
                                    </h2>
                                </div>

                                <div className="border-b border-gray-200 p-4">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Patient / Requester Full Name</p>
                                    <p className="text-[14px] text-gray-700 ml-4">{bookingData.name || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 p-4">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Mobile Number</p>
                                    <p className="text-[14px] text-gray-700 ml-4">{bookingData.phone || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 p-4">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Email Address</p>
                                    <p className="text-[14px] text-blue-600 underline ml-4">{bookingData.email || '—'}</p>
                                </div>

                                <div className="border-b border-gray-200 p-4">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Service Location (Home Address)</p>
                                    <p className="text-[14px] text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.address || '—'}</p>
                                </div>

                                {(selectedService.slug === 'ambulance-booking' || selectedService.slug === 'deadbody-freezer' || selectedService.slug === 'funeral-service') && (
                                    <>
                                        <div className="border-b border-gray-200 p-4">
                                            <p className="text-[13px] font-bold text-gray-800 mb-2">Pick Up Address</p>
                                            <p className="text-[14px] text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.pickup_address || '—'}</p>
                                        </div>
                                        <div className="border-b border-gray-200 p-4">
                                            <p className="text-[13px] font-bold text-gray-800 mb-2">Drop Off Address</p>
                                            <p className="text-[14px] text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.drop_address || '—'}</p>
                                        </div>
                                    </>
                                )}

                                <div className="border-b border-gray-200 p-4">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Booking Date & Time</p>
                                    <p className="text-[14px] text-gray-700 ml-4">
                                        {bookingData.booking_date ? new Date(bookingData.booking_date).toLocaleDateString('en-GB') : '—'}
                                        {bookingData.booking_time ? ` at ${bookingData.booking_time}` : ''}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50/50">
                                    <p className="text-[13px] font-bold text-gray-800 mb-2">Additional Notes</p>
                                    <p className="text-[14px] text-gray-700 ml-4 whitespace-pre-wrap">{bookingData.notes || '—'}</p>
                                </div>
                            </div>

                            <div className="mt-12 text-center text-gray-400 text-sm font-semibold tracking-widest uppercase">
                                Ziddi Mumbaikar NGO • Free Service
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
