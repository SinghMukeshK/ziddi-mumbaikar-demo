import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, CreditCard, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import { donationService } from '@/services/donation.service'
import { useRazorpay } from '@/hooks/useRazorpay'

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [step, setStep] = useState<'amount' | 'details' | 'processing' | 'success'>('amount')
    const [amount, setAmount] = useState('1000')
    const [customAmount, setCustomAmount] = useState('')
    const [frequency, setFrequency] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { openRazorpay } = useRazorpay()

    const resetStates = () => {
        setStep('amount')
        setAmount('1000')
        setCustomAmount('')
        setFrequency('monthly')
        setName('')
        setEmail('')
        setPhone('')
        setError('')
        setLoading(false)
    }

    // Reset state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Small delay to allow exit animation to complete before clearing visuals
            const timer = setTimeout(resetStates, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const predefinedAmounts = [500, 1000, 2000, 5000]
    const frequencies = [
        { id: 'once', label: 'Once', icon: Heart },
        { id: 'weekly', label: 'Weekly', icon: Calendar },
        { id: 'monthly', label: 'Monthly', icon: Calendar },
        { id: 'yearly', label: 'Yearly', icon: Calendar },
    ]

    const handleAmountSelect = (val: number) => {
        setAmount(val.toString())
        setCustomAmount('')
    }

    const getFinalAmount = () => {
        return customAmount ? parseInt(customAmount) : parseInt(amount)
    }

    const validateDetails = () => {
        if (!name.trim()) return 'Name is required'
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email is required'
        if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) return 'Valid 10-digit phone is required'
        return null
    }

    const handleNext = () => {
        const finalAmount = getFinalAmount()
        if (!finalAmount || finalAmount < 10) {
            setError('Minimum donation amount is ₹10')
            return
        }
        setError('')
        setStep('details')
    }

    const handleSubmit = async () => {
        const validationError = validateDetails()
        if (validationError) {
            setError(validationError)
            return
        }

        setError('')
        setLoading(true)
        setStep('processing')

        try {
            const finalAmount = getFinalAmount()

            if (frequency === 'once') {
                // 1. One-time Donation
                const response = await donationService.createRazorpayOrder({
                    amount: finalAmount,
                    donor_name: name,
                    donor_email: email,
                    donor_phone: phone,
                    currency: 'INR',
                    donation_type: 'general'
                })

                if (!response.success || !response.data) {
                    throw new Error('Failed to initiate donation. Please try again.')
                }

                const { razorpay_order_id, key_id } = response.data

                // 2. Open Razorpay Checkout for One-time
                await openRazorpay({
                    key: key_id,
                    amount: finalAmount * 100, // Razorpay expects paise for orders
                    currency: 'INR',
                    order_id: razorpay_order_id,
                    name: 'Ziddi Mumbaikar',
                    description: `One-time Donation - ₹${finalAmount}`,
                    image: '/logo.webp',
                    prefill: {
                        name,
                        email,
                        contact: phone
                    },
                    theme: { color: '#f0750a' }
                })
            } else {
                // 1. Recurring Subscription
                const response = await donationService.createRazorpaySubscription({
                    amount: finalAmount,
                    frequency: frequency as any,
                    donor_name: name,
                    donor_email: email,
                    donor_phone: phone,
                    currency: 'INR'
                })

                if (!response.success || !response.data) {
                    throw new Error('Failed to create subscription. Please try again.')
                }

                const { subscription_id, key_id } = response.data

                // 2. Open Razorpay Checkout for Subscriptions
                await openRazorpay({
                    key: key_id,
                    subscription_id: subscription_id,
                    name: 'Ziddi Mumbaikar',
                    description: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Sustainer - ₹${finalAmount}/${frequency === 'yearly' ? 'year' : frequency === 'weekly' ? 'week' : 'month'}`,
                    image: '/logo.webp',
                    prefill: {
                        name,
                        email,
                        contact: phone
                    },
                    theme: { color: '#f0750a' }
                })
            }

            setStep('success')
        } catch (err: any) {
            console.error('Donation error:', err)
            setError(err.message || 'Failed to process payment. Please try again.')
            setStep('details')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy-900/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-orange-400 p-8 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Heart className="w-8 h-8 fill-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Become a Donor</h2>
                                <p className="text-white/80 font-bold text-xs uppercase tracking-widest">Support Mumbai Continuously</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-10">
                        {step === 'amount' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Frequency</h3>
                                    <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                                        {frequencies.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => setFrequency(f.id as any)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${frequency === f.id
                                                    ? 'bg-white text-primary-500 shadow-sm'
                                                    : 'text-gray-500 hover:text-navy-900'
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>

                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Amount</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {predefinedAmounts.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => handleAmountSelect(amt)}
                                                className={`py-5 rounded-2xl font-black text-lg transition-all border-2 ${amount === amt.toString() && !customAmount
                                                    ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/30'
                                                    : 'bg-gray-50 border-gray-100 text-navy-900 hover:border-primary-200'
                                                    }`}
                                            >
                                                ₹{amt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-4 relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                        <input
                                            type="number"
                                            placeholder="Enter Custom Amount"
                                            value={customAmount}
                                            onChange={(e) => {
                                                setCustomAmount(e.target.value)
                                                setAmount('')
                                            }}
                                            className="w-full pl-10 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all"
                                        />
                                    </div>
                                    <p className="text-center mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Recurring contribution: ₹{getFinalAmount().toLocaleString()} {frequency}
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide mb-6">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleNext}
                                    className="w-full bg-navy-900 hover:bg-primary-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    Continue to Details
                                </button>
                            </motion.div>
                        )}

                        {step === 'details' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest">Your Plan</p>
                                        <p className="text-navy-900 font-black text-sm">₹{getFinalAmount().toLocaleString()} / {frequency}</p>
                                    </div>
                                    <button onClick={() => setStep('amount')} className="text-[10px] text-primary-500 font-black uppercase tracking-widest hover:underline">Change</button>
                                </div>

                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Donor Information</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all text-sm"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number (10 digits)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all text-sm"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStep('amount')}
                                        className="py-5 bg-gray-100 text-gray-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-primary-500 hover:bg-primary-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Subscribe Now'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-xl font-black text-navy-900 uppercase">One Moment Please</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Setting up your secure sustainer plan</p>
                            </div>
                        )}

                        {step === 'success' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h3 className="text-3xl font-black text-navy-900 mb-4 tracking-tight">You&apos;re a Hero!</h3>
                                <p className="text-gray-600 font-medium text-lg leading-relaxed mb-10 max-w-sm mx-auto">
                                    Thank you for joining our <span className="text-primary-500 font-bold">{frequency} sustainer</span> program.
                                    Your support makes a world of difference.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-12 py-5 bg-navy-900 text-white font-black rounded-2xl shadow-xl shadow-navy-900/20 uppercase tracking-widest text-xs hover:bg-primary-500 transition-all"
                                >
                                    Wonderful!
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
