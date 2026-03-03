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
    const [lastSubscriptionId, setLastSubscriptionId] = useState<string | null>(null)
    const [paidFirstInstallment, setPaidFirstInstallment] = useState(false)
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
        setLastSubscriptionId(null)
        setPaidFirstInstallment(false)
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
                setLastSubscriptionId(subscription_id)

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

    const handleFirstInstallment = async () => {
        setLoading(true)
        setStep('processing')
        try {
            const finalAmount = getFinalAmount()
            const response = await donationService.createRazorpayOrder({
                amount: finalAmount,
                donor_name: name,
                donor_email: email,
                donor_phone: phone,
                currency: 'INR',
                donation_type: 'general',
                message: `First installment for subscription ${lastSubscriptionId}`
            })

            if (!response.success || !response.data) {
                throw new Error('Failed to initiate payment.')
            }

            const { razorpay_order_id, key_id } = response.data

            await openRazorpay({
                key: key_id,
                amount: finalAmount * 100,
                currency: 'INR',
                order_id: razorpay_order_id,
                name: 'Ziddi Mumbaikar',
                description: 'First Installment Payment',
                image: '/logo.webp',
                prefill: { name, email, contact: phone },
                theme: { color: '#f0750a' }
            })
            setPaidFirstInstallment(true)
            setStep('success')
        } catch (err: any) {
            setError(err.message || 'Payment failed')
            setStep('success') // Return to success screen to show error
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
                >
                    {/* Header - Compact */}
                    <div className="bg-navy-900 px-6 py-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500 rounded-xl">
                                <Heart className="w-5 h-5 fill-white" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight uppercase">Support Mumbai</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step !== 'success' && step !== 'processing' ? (
                            <div className="space-y-5">
                                {/* Frequency Toggle */}
                                <div className="grid grid-cols-4 gap-2">
                                    {frequencies.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFrequency(f.id as any)}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${frequency === f.id
                                                ? 'bg-primary-50 border-primary-500 text-primary-600'
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Amount Grid - Compact */}
                                <div>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {predefinedAmounts.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => handleAmountSelect(amt)}
                                                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${amount === amt.toString() && !customAmount
                                                    ? 'bg-primary-500 border-primary-500 text-white'
                                                    : 'bg-gray-50 border-transparent text-navy-900 hover:border-primary-100'
                                                    }`}
                                            >
                                                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Custom amount..."
                                            value={customAmount}
                                            onChange={(e) => {
                                                setCustomAmount(e.target.value)
                                                setAmount('')
                                            }}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Donor Fields - Compact Row */}
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none font-bold text-navy-900 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none font-bold text-navy-900 text-sm"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-500 outline-none font-bold text-navy-900 text-sm"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-wider bg-red-50 p-2 rounded-lg">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-4 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : `Pay ₹${getFinalAmount().toLocaleString()} ${frequency === 'once' ? 'Now' : 'Sub'}`}
                                </button>

                                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    Secure 256-bit encrypted payment
                                </p>
                            </div>
                        ) : step === 'processing' ? (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-lg font-black text-navy-900 uppercase">Processing</h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Connecting to secure gateway</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
                                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-navy-900 mb-2">Success!</h3>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                                    Thank you for your generous support of Mumbai.
                                </p>

                                {frequency !== 'once' && !paidFirstInstallment && (
                                    <div className="mb-8 p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                        <p className="text-xs font-bold text-primary-700 mb-3 uppercase tracking-wider">Want to start immediately?</p>
                                        <button
                                            onClick={handleFirstInstallment}
                                            disabled={loading}
                                            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md"
                                        >
                                            {loading ? 'Processing...' : `Pay First Installment (₹${getFinalAmount()}) Now`}
                                        </button>
                                    </div>
                                )}

                                {paidFirstInstallment && (
                                    <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">First installment received!</p>
                                    </div>
                                )}

                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-navy-900 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-primary-500 transition-all"
                                >
                                    Finish
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
