'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ngoService, NgoService } from '@/services/ngoService.service'
import { donationService } from '@/services/donation.service'
import { useRazorpay } from '@/hooks/useRazorpay'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
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
    Shield,
    Users,
    Activity,
    LifeBuoy
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

function ServicesContent() {
    const searchParams = useSearchParams()
    const serviceSlug = searchParams.get('s')
    const [services, setServices] = useState<NgoService[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState<NgoService | null>(null)
    const [bookingData, setBookingData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        pickup_address: '',
        drop_address: '',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        notes: 'Requested from services page',
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
                    const activeServices = response.data.filter(s => s.status === 'active')
                    setServices(activeServices)
                    
                    // Priority 1: Check if slug in URL matches any service
                    if (serviceSlug) {
                        const target = activeServices.find(s => s.slug === serviceSlug)
                        if (target) {
                            setSelectedService(target)
                            return
                        }
                    }

                    // Priority 2: Select first service by default
                    if (activeServices.length > 0) {
                        setSelectedService(activeServices[0])
                    }
                }
            } catch (err) {
                console.error('Failed to fetch services:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [serviceSlug])

    const validateForm = () => {
        const errors: Record<string, string> = {}
        
        if (!bookingData.name.trim()) errors.name = 'Full name is required'
        
        // Phone validation (Indian format simplified)
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
        if (selectedService?.slug === 'ambulance-booking' || selectedService?.slug === 'funeral-service') {
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

        if (!validateForm()) {
            const firstError = document.querySelector('.text-red-500')
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

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
                // Scroll to top of the form section on success
                document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
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

            await donationService.verifyPayment(donation_id, {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            })

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

    const resetBooking = () => {
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
            notes: 'Requested from services page',
            age: '',
            gender: '',
            reference_name: '',
            reference_number: ''
        })
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading services...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-navy-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Activity className="w-4 h-4" />
                            Emergency Response 24/7
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                            Free NGO Services For <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                                Every Mumbaikar
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                            Ziddi Mumbaikar provides essential emergency support free of cost.
                            Professional assistance is just a registration away.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div id="booking-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left: Service Selection */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-28">
                            <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">1</span>
                                Select a Service
                            </h2>
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            setSelectedService(service)
                                            resetBooking()
                                            // Scroll to form on mobile view
                                            if (window.innerWidth < 1024) {
                                                setTimeout(() => {
                                                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all border-2 text-left group
                                            ${selectedService?.id === service.id 
                                                ? 'bg-primary-50 border-primary-500 shadow-xl shadow-primary-500/10' 
                                                : 'bg-white border-gray-100 hover:border-primary-200'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                                            ${selectedService?.id === service.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-500'}`}>
                                            {getIcon(service.icon)}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className={`font-bold transition-colors ${selectedService?.id === service.id ? 'text-primary-900' : 'text-gray-900'}`}>
                                                {service.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">
                                                {service.is_free ? 'Free of Cost' : 'Available'}
                                            </p>
                                        </div>
                                        <div className={`transition-transform duration-300 ${selectedService?.id === service.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                            <ChevronRight className="w-5 h-5 text-primary-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 p-8 bg-navy-900 rounded-[2.5rem] text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
                                <h4 className="text-xl font-bold mb-4 relative z-10">Need Immediate Help?</h4>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">
                                    Our helpline is active 24/7 for emergency coordination.
                                </p>
                                <a 
                                    href="tel:+910000000000" 
                                    className="inline-flex items-center gap-3 bg-white text-navy-900 px-6 py-3 rounded-2xl font-bold hover:bg-primary-500 hover:text-white transition-all relative z-10"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call Helpline
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div id="booking-form" className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden min-h-[600px]">
                            {bookingSuccess ? (
                                <div className="p-12 text-center">
                                    <AnimatePresence mode="wait">
                                        {!donationSuccess ? (
                                            <motion.div
                                                key="donation-prompt"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                                    <CheckCircle2 className="w-12 h-12" />
                                                </div>
                                                <h3 className="text-4xl font-black text-navy-900 mb-4">Request Confirmed!</h3>
                                                <div className="bg-gray-100 inline-block px-6 py-2 rounded-xl mb-8 border border-gray-200">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-3">Reference ID:</span>
                                                    <span className="font-mono font-bold text-navy-900 text-lg">{String(latestBookingId).substring(0, 8).toUpperCase()}</span>
                                                </div>
                                                <p className="text-gray-500 text-lg mb-12 max-w-lg mx-auto">
                                                    Our coordination team will contact you on <span className="text-navy-900 font-bold">{bookingData.phone}</span> within 15-30 minutes.
                                                </p>

                                                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 text-left relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
                                                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
                                                            <Heart className="w-8 h-8 text-primary-500 fill-primary-500/20" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-bold text-navy-900 mb-2">Support Our Mission</h4>
                                                            <p className="text-gray-500 mb-8 leading-relaxed">
                                                                This service is 100% free. Your voluntary donation helps us keep it free for Mumbaikars in need.
                                                            </p>
                                                            
                                                            <div className="flex flex-wrap gap-3 mb-6">
                                                                {['200', '500', '1000'].map(amt => (
                                                                    <button
                                                                        key={amt}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDonationAmount(amt)
                                                                            setShowCustomAmount(false)
                                                                        }}
                                                                        className={`px-8 py-3 rounded-2xl font-bold transition-all border-2
                                                                            ${donationAmount === amt && !showCustomAmount
                                                                                ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                                                                : 'bg-white border-gray-200 text-navy-900 hover:border-primary-500'}`}
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
                                                                    className={`px-8 py-3 rounded-2xl font-bold transition-all border-2
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
                                                                        className="relative mb-8 overflow-hidden"
                                                                    >
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Enter Custom Amount"
                                                                            value={donationAmount}
                                                                            onChange={(e) => setDonationAmount(e.target.value)}
                                                                            className="w-full bg-white border-2 border-primary-500/30 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none font-bold text-lg shadow-inner"
                                                                            autoFocus
                                                                        />
                                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">INR</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                            
                                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                                <button
                                                                    onClick={handleDonation}
                                                                    disabled={isDonating || !donationAmount}
                                                                    className="w-full bg-primary-500 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                                                >
                                                                    {isDonating ? (
                                                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    ) : <Heart className="w-6 h-6 fill-white/20" />}
                                                                    Donate & Support Our Mission
                                                                </button>
                                                                
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <button
                                                                        onClick={() => window.print()}
                                                                        className="bg-white text-navy-900 border-2 border-navy-900 py-4 rounded-2xl font-bold hover:bg-navy-50 transition-all flex items-center justify-center gap-2 group"
                                                                    >
                                                                        <svg className="w-5 h-5 text-navy-900/50 group-hover:text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                                        Download Form
                                                                    </button>
                                                                    <button
                                                                        onClick={resetBooking}
                                                                        className="bg-navy-900 text-white py-4 rounded-2xl font-bold hover:bg-navy-800 transition-all text-center"
                                                                    >
                                                                        Book Another
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
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="py-12"
                                            >
                                                <div className="w-24 h-24 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/10">
                                                    <Heart className="w-12 h-12 fill-primary-500" />
                                                </div>
                                                <h3 className="text-4xl font-black text-navy-900 mb-4">Incredible Support!</h3>
                                                <p className="text-xl text-gray-500 mb-12 max-w-md mx-auto">
                                                    Your donation of ₹{donationAmount} fuels our mission to serve Mumbai.
                                                    Thank you for your generosity.
                                                </p>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="bg-primary-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-primary-600 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto mb-4"
                                                >
                                                    <svg className="w-6 h-6 border-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    Download Service Form
                                                </button>
                                                <button
                                                    onClick={resetBooking}
                                                    className="bg-navy-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-navy-800 transition-all shadow-xl block mx-auto"
                                                >
                                                    Back to Services
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Form Header */}
                                    <div className="bg-slate-50 p-10 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-primary-500 shrink-0">
                                                {getIcon(selectedService?.icon)}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-navy-900 mb-1">Book {selectedService?.name}</h2>
                                                <p className="text-gray-500 font-medium">Please provide accurate details for coordination.</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex flex-col items-end">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step 2 of 2</span>
                                            <div className="flex gap-1">
                                                <div className="w-8 h-2 bg-primary-500 rounded-full"></div>
                                                <div className="w-8 h-2 bg-primary-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actual Form */}
                                    <form onSubmit={handleBooking} className="p-10 flex-grow">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Name */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider flex items-center gap-2">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Enter full name"
                                                    className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                    value={bookingData.name}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, name: e.target.value })
                                                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                                                    }}
                                                />
                                                {formErrors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.name}</p>}
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider flex items-center gap-2">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="+91 00000 00000"
                                                    className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                    value={bookingData.phone}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, phone: e.target.value })
                                                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' })
                                                    }}
                                                />
                                                {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.phone}</p>}
                                            </div>

                                            {/* Date */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider flex items-center gap-2">
                                                    Required Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type="date"
                                                        className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all font-medium ${formErrors.booking_date ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                        value={bookingData.booking_date}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={e => {
                                                            setBookingData({ ...bookingData, booking_date: e.target.value })
                                                            if (formErrors.booking_date) setFormErrors({ ...formErrors, booking_date: '' })
                                                        }}
                                                    />
                                                    <Calendar className="w-5 h-5 absolute right-6 top-4.5 text-gray-400 pointer-events-none" />
                                                </div>
                                                {formErrors.booking_date && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.booking_date}</p>}
                                            </div>

                                            {/* Time */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider flex items-center gap-2">
                                                    Preferred Time
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-medium"
                                                        value={bookingData.booking_time}
                                                        onChange={e => setBookingData({ ...bookingData, booking_time: e.target.value })}
                                                    />
                                                    <Clock className="w-5 h-5 absolute right-6 top-4.5 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider flex items-center gap-2">
                                                    Service Location / Address <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    placeholder="Enter full address for service delivery"
                                                    className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.address ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                    value={bookingData.address}
                                                    onChange={e => {
                                                        setBookingData({ ...bookingData, address: e.target.value })
                                                        if (formErrors.address) setFormErrors({ ...formErrors, address: '' })
                                                    }}
                                                />
                                                {formErrors.address && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.address}</p>}
                                            </div>

                                            {/* Additional Fields for specific services */}
                                            {(selectedService?.slug === 'ambulance-booking' || selectedService?.slug === 'funeral-service') && (
                                                <>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Pickup Point</label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Where to pick up?"
                                                            className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.pickup_address ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                            value={bookingData.pickup_address}
                                                            onChange={e => {
                                                                setBookingData({ ...bookingData, pickup_address: e.target.value })
                                                                if (formErrors.pickup_address) setFormErrors({ ...formErrors, pickup_address: '' })
                                                            }}
                                                        />
                                                        {formErrors.pickup_address && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.pickup_address}</p>}
                                                    </div>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Drop Point</label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Where to drop?"
                                                            className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.drop_address ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                            value={bookingData.drop_address}
                                                            onChange={e => {
                                                                setBookingData({ ...bookingData, drop_address: e.target.value })
                                                                if (formErrors.drop_address) setFormErrors({ ...formErrors, drop_address: '' })
                                                            }}
                                                        />
                                                        {formErrors.drop_address && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.drop_address}</p>}
                                                    </div>
                                                </>
                                            )}

                                            {/* Patient Age/Gender */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Age</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Age"
                                                        className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.age ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                        value={bookingData.age}
                                                        onChange={e => {
                                                            setBookingData({ ...bookingData, age: e.target.value })
                                                            if (formErrors.age) setFormErrors({ ...formErrors, age: '' })
                                                        }}
                                                    />
                                                    {formErrors.age && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.age}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Gender</label>
                                                    <select
                                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-medium appearance-none"
                                                        value={bookingData.gender}
                                                        onChange={e => setBookingData({ ...bookingData, gender: e.target.value })}
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Reference Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Reference Name"
                                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-medium"
                                                    value={bookingData.reference_name}
                                                    onChange={e => setBookingData({ ...bookingData, reference_name: e.target.value })}
                                                />
                                            </div>

                                            {/* Reference Phone */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Reference Phone (Optional)</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="Reference Phone Number"
                                                        className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-gray-300 font-medium ${formErrors.reference_number ? 'border-red-500 bg-red-50/10' : 'border-gray-100 focus:border-primary-500'}`}
                                                        value={bookingData.reference_number}
                                                        onChange={e => {
                                                            setBookingData({ ...bookingData, reference_number: e.target.value })
                                                            if (formErrors.reference_number) setFormErrors({ ...formErrors, reference_number: '' })
                                                        }}
                                                    />
                                                    {formErrors.reference_number && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{formErrors.reference_number}</p>}
                                            </div>

                                            {/* Notes Area */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-sm font-black text-navy-900 uppercase tracking-wider">Additional Notes / Landmarks (Optional)</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="E.g. Near Big Temple, 2nd Floor, etc."
                                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 font-medium"
                                                    value={bookingData.notes}
                                                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-12 flex flex-col md:flex-row items-center gap-6 p-8 bg-primary-50 rounded-[2rem] border-2 border-primary-100">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-500 shrink-0 shadow-lg">
                                                <Shield className="w-8 h-8" />
                                            </div>
                                            <div className="flex-grow text-center md:text-left">
                                                <h4 className="font-black text-navy-900 uppercase tracking-wider text-sm mb-1">Service Assurance</h4>
                                                <p className="text-xs text-primary-800 font-bold leading-relaxed">
                                                    By submitting this request, you agree that Ziddi Mumbaikar will coordinate this free service to the best of their ability. 
                                                    Your data is safe and used only for emergency coordination.
                                                </p>
                                            </div>
                                            <button
                                                disabled={isBooking}
                                                type="submit"
                                                className="w-full md:w-auto bg-primary-500 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-primary-600 transition-all shadow-2xl shadow-primary-500/20 disabled:opacity-50 inline-flex items-center justify-center gap-3"
                                            >
                                                {isBooking ? (
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : "Confirm Booking"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ/Trust Section */}
                <section className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-navy-900 mb-4">Why Trust Ziddi Mumbaikar?</h2>
                        <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <LifeBuoy className="w-8 h-8"/>,
                                title: "100% Free Service",
                                desc: "No hidden charges. No registration fees. Our services are powered by donations and volunteer spirit."
                            },
                            {
                                icon: <Users className="w-8 h-8"/>,
                                title: "Community Driven",
                                desc: "Created by Mumbaikars, for Mumbaikars. We understand the city's pulse and its urgent needs."
                            },
                            {
                                icon: <CheckCircle2 className="w-8 h-8"/>,
                                title: "Verified Response",
                                desc: "Our coordination team verifies every request and ensures professional handling of your emergency."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-primary-100 transition-all group">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-500 mb-6 shadow-md group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-navy-900 mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* --- PRINT ONLY SERVICE FORM --- */}
            {
                selectedService && latestBookingId && (
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

                                {(selectedService.slug === 'ambulance-booking' || selectedService.slug === 'funeral-service') && (
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

            <Footer />
        </div>
    )
}

export default function ServicesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        }>
            <ServicesContent />
        </Suspense>
    )
}
