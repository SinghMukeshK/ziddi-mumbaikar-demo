'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Rocket,
    ShieldCheck,
    Check,
    Users,
    Globe,
    Mail,
    Lock,
    ArrowRight,
    ChevronLeft,
    CreditCard,
    Zap,
    TrendingUp
} from 'lucide-react'
import { apiV1 } from '@/lib/api-v1'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: '999',
        priceId: 'starter-uuid-placeholder', // In real app, fetch from database or use static mapping
        description: 'Perfect for small NGOs getting started.',
        icon: Rocket,
        color: 'blue',
        features: ['5 Users', '50 Beneficiaries', '5 Fundraisers', 'Core Donations', 'Email Support']
    },
    {
        id: 'professional',
        name: 'Professional',
        price: '2,999',
        priceId: 'professional-uuid-placeholder',
        description: 'Advanced features for growing organizations.',
        icon: Zap,
        color: 'primary',
        popular: true,
        features: ['15 Users', '500 Beneficiaries', '20 Fundraisers', 'Zakat & Qurbani', 'Volunteer Management', 'Priority Support']
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '9,999',
        priceId: 'enterprise-uuid-placeholder',
        description: 'Unlimited capacity for large institutions.',
        icon: ShieldCheck,
        color: 'navy',
        features: ['Unlimited Users', 'Unlimited Beneficiaries', 'Unlimited Fundraisers', 'Advanced Analytics', 'Custom Branding', 'Account Manager']
    }
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Org, 2: Plan, 3: Admin
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        organization: {
            name: '',
            subdomain: '',
            email: '',
            business_type: 'ngo'
        },
        admin_user: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: ''
        },
        plan_id: 'professional', // Default select
        billing_cycle: 'monthly'
    })

    const handleChange = (section: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev as any)[section],
                [field]: value
            }
        }))
    }

    const validateStep1 = () => {
        const { name, subdomain, email } = formData.organization
        if (!name || !subdomain || !email) {
            setError('Please fill in all organization details')
            return false
        }
        if (!/^[a-z0-9-]+$/.test(subdomain)) {
            setError('Subdomain can only contain lowercase letters, numbers, and hyphens')
            return false
        }
        setError('')
        return true
    }

    const validateStep3 = () => {
        const { first_name, email, password, confirm_password } = formData.admin_user
        if (!first_name || !email || !password) {
            setError('Please fill in all admin account details')
            return false
        }
        if (password !== confirm_password) {
            setError('Passwords do not match')
            return false
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return false
        }
        setError('')
        return true
    }

    const handleOnboard = async () => {
        if (!validateStep3()) return
        setLoading(true)
        setError('')

        try {
            // In a real app, we'd fetch the actual UUID for the plan ID
            // For this demo, we'll map the plan names if needed or assume backend handles string IDs or we hardcode them
            const payload = {
                organization: formData.organization,
                admin_user: {
                    first_name: formData.admin_user.first_name,
                    last_name: formData.admin_user.last_name,
                    email: formData.admin_user.email,
                    password: formData.admin_user.password
                },
                plan_id: formData.plan_id, // Now sending 'starter', 'professional', or 'enterprise'
                billing_cycle: formData.billing_cycle
            }

            const response = await apiV1.post<any>('/onboarding', payload)

            if (response.data.success || response.status === 201) {
                setSuccess(true)
                // Small delay then redirect
                setTimeout(() => {
                    router.push('/signin?onboarded=true')
                }, 3000)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Onboarding failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Check className="w-12 h-12 stroke-[3]" />
                    </div>
                    <h1 className="text-4xl font-black text-navy-900 mb-4">Welcome Aboard!</h1>
                    <p className="text-gray-500 font-bold mb-8">
                        Your organization <span className="text-primary-500">{formData.organization.name}</span> has been successfully registered.
                        Redirecting you to the sign-in page...
                    </p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3 }}
                            className="h-full bg-primary-500"
                        />
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24 pb-20">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tighter text-navy-900">
                        DRISTA<span className="text-primary-500">CLOUD</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-navy-900 text-white px-2 py-0.5 rounded">NGO Portal</span>
                </Link>
                <div className="flex items-center gap-8">
                    {[1, 2, 3].map(num => (
                        <div key={num} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= num ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-200 text-gray-400'
                                }`}>
                                {num}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${step >= num ? 'text-navy-900' : 'text-gray-400'
                                }`}>
                                {num === 1 ? 'Organization' : num === 2 ? 'Choose Plan' : 'Admin Profile'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-6xl w-full">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="grid lg:grid-cols-2 gap-16 items-center"
                            >
                                <div>
                                    <h1 className="text-5xl font-black text-navy-900 leading-tight mb-6">
                                        Empower Your NGO with <span className="text-primary-500 underline decoration-8 decoration-primary-100 underline-offset-4">Cloud Intelligence</span>.
                                    </h1>
                                    <p className="text-xl text-gray-500 font-medium mb-12">
                                        Join hundreds of organizations making measured impact. Set up your dedicated workspace in minutes.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-500">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-navy-900 uppercase text-xs tracking-widest">Team Collaboration</h3>
                                                <p className="text-sm text-gray-500">Manage volunteers and staff in one unified portal.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-500">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-navy-900 uppercase text-xs tracking-widest">Impact Tracking</h3>
                                                <p className="text-sm text-gray-500">Convert donations into real-world statistics automatically.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-navy-900/5 border border-gray-100">
                                    <h2 className="text-2xl font-black text-navy-900 mb-8">Organization Details</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">NGO Legal Name</label>
                                            <div className="relative">
                                                <Building2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                <input
                                                    type="text"
                                                    placeholder="Ziddi Mumbaikar Foundation"
                                                    value={formData.organization.name}
                                                    onChange={(e) => handleChange('organization', 'name', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Workspace Subdomain</label>
                                            <div className="flex items-center">
                                                <div className="relative flex-1">
                                                    <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                    <input
                                                        type="text"
                                                        placeholder="my-ngo"
                                                        value={formData.organization.subdomain}
                                                        onChange={(e) => handleChange('organization', 'subdomain', e.target.value.toLowerCase())}
                                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl rounded-r-none focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all text-right"
                                                    />
                                                </div>
                                                <div className="bg-navy-900 text-white px-6 py-4 rounded-2xl rounded-l-none font-black text-sm self-stretch flex items-center">
                                                    .dristacloud.com
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Official Email</label>
                                            <div className="relative">
                                                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                <input
                                                    type="email"
                                                    placeholder="operations@ngo.org"
                                                    value={formData.organization.email}
                                                    onChange={(e) => handleChange('organization', 'email', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide px-2">{error}</p>}

                                        <button
                                            onClick={() => validateStep1() && setStep(2)}
                                            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            Choose Your Plan
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="w-full"
                            >
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black text-navy-900 mb-4">Select a Success Plan</h2>
                                    <p className="text-gray-500 font-medium max-w-lg mx-auto">
                                        Flexible pricing for organizations of all sizes. Upgrade or downgrade anytime.
                                    </p>

                                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto mt-8">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, billing_cycle: 'monthly' }))}
                                            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.billing_cycle === 'monthly' ? 'bg-navy-900 text-white shadow-lg' : 'text-gray-400 hover:text-navy-900'
                                                }`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, billing_cycle: 'annually' }))}
                                            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.billing_cycle === 'annually' ? 'bg-navy-900 text-white shadow-lg' : 'text-gray-400 hover:text-navy-900'
                                                }`}
                                        >
                                            Annually <span className="text-primary-500 text-[8px] ml-1">(2 Months Free)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    {PLANS.map((plan) => (
                                        <motion.div
                                            key={plan.id}
                                            whileHover={{ y: -10 }}
                                            onClick={() => setFormData(prev => ({ ...prev, plan_id: plan.id }))}
                                            className={`relative bg-white p-10 rounded-[2.5rem] border-4 transition-all cursor-pointer ${formData.plan_id === plan.id
                                                ? 'border-primary-500 shadow-2xl shadow-primary-500/10'
                                                : 'border-transparent hover:border-gray-100 shadow-sm'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary-500/30">
                                                    Most Popular
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.id === 'starter' ? 'bg-blue-50 text-blue-500' :
                                                    plan.id === 'professional' ? 'bg-primary-50 text-primary-500' :
                                                        'bg-navy-50 text-navy-900'
                                                    }`}>
                                                    <plan.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-black text-navy-900">{plan.name}</h3>
                                            </div>

                                            <div className="mb-8">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black text-navy-900">₹{plan.price}</span>
                                                    <span className="text-gray-400 font-bold text-sm">/ {formData.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2 font-medium">{plan.description}</p>
                                            </div>

                                            <div className="space-y-4 mb-10">
                                                {plan.features.map(feature => (
                                                    <div key={feature} className="flex items-center gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-green-500 stroke-[3]" />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-navy-900">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-all ${formData.plan_id === plan.id
                                                ? 'bg-primary-500 text-white shadow-lg'
                                                : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                {formData.plan_id === plan.id ? 'Selected Plan' : 'Select Plan'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-16 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-navy-900 font-black text-sm uppercase tracking-wider transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Back to Org Info
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="bg-navy-900 hover:bg-navy-800 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-navy-900/10 transition-all flex items-center gap-3"
                                    >
                                        Final Step: Admin Account
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="grid lg:grid-cols-2 gap-16 items-center"
                            >
                                <div className="order-2 lg:order-1">
                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-navy-900/5 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-black text-navy-900">Administrator Profile</h2>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">First Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Jane"
                                                        value={formData.admin_user.first_name}
                                                        onChange={(e) => handleChange('admin_user', 'first_name', e.target.value)}
                                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Last Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Doe"
                                                        value={formData.admin_user.last_name}
                                                        onChange={(e) => handleChange('admin_user', 'last_name', e.target.value)}
                                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Personal Email</label>
                                                <div className="relative">
                                                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                    <input
                                                        type="email"
                                                        placeholder="jane@organization.org"
                                                        value={formData.admin_user.email}
                                                        onChange={(e) => handleChange('admin_user', 'email', e.target.value)}
                                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                                                    <div className="relative">
                                                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={formData.admin_user.password}
                                                            onChange={(e) => handleChange('admin_user', 'password', e.target.value)}
                                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm</label>
                                                    <div className="relative">
                                                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                        <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={formData.admin_user.confirm_password}
                                                            onChange={(e) => handleChange('admin_user', 'confirm_password', e.target.value)}
                                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-primary-500 outline-none font-bold text-navy-900 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide px-2">{error}</p>}

                                            <div className="pt-4 space-y-4">
                                                <button
                                                    disabled={loading}
                                                    onClick={handleOnboard}
                                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {loading ? 'Processing Enrollment...' : 'Launch Workspace'}
                                                    {!loading && <Rocket className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => setStep(2)}
                                                    className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-navy-900 transition-all"
                                                >
                                                    Change Selected Plan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-1 lg:order-2">
                                    <h2 className="text-3xl font-black text-navy-900 mb-8 uppercase tracking-tight">Onboarding Summary</h2>
                                    <div className="space-y-4">
                                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-2">Organization</p>
                                            <p className="text-2xl font-black text-navy-900">{formData.organization.name || 'Your NGO'}</p>
                                            <p className="text-sm text-gray-400 font-bold">{formData.organization.subdomain || 'subdomain'}.dristacloud.com</p>
                                        </div>

                                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-2">Subscription Plan</p>
                                                    <p className="text-2xl font-black text-navy-900 capitalize">{formData.plan_id} Plan</p>
                                                    <p className="text-sm text-gray-400 font-bold">Billing Cycle: {formData.billing_cycle}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-navy-900">₹{PLANS.find(p => p.id === formData.plan_id)?.price}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">+ 18% GST</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 flex items-center gap-4 text-gray-400">
                                            <CreditCard className="w-6 h-6" />
                                            <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wide">
                                                No payment required today. An invoice will be generated and sent to your email upon activation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <footer className="text-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-12">
                &copy; 2024 Drista Cloud Solutions. All rights reserved. &bull; <Link href="/terms" className="hover:text-primary-500">Terms</Link> &bull; <Link href="/privacy" className="hover:text-primary-500">Privacy</Link>
            </footer>
        </div>
    )
}
