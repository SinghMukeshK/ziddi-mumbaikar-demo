'use client'

import { useState, useEffect } from 'react'
import { tenantService, Tenant } from '@/services/tenant.service'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion } from 'framer-motion'
import {
    Settings,
    Globe,
    Mail,
    Phone,
    MapPin,
    Info,
    Save,
    Building2,
    Fingerprint,
    ShieldCheck,
    Briefcase
} from 'lucide-react'

function TenantSettingsContent() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [tenant, setTenant] = useState<Partial<Tenant>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (isLoggedIn && user?.role !== 'admin' && user?.role !== 'super_admin') {
            router.push('/')
        }
    }, [isLoggedIn, user, router])

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                setLoading(true)
                const response = await tenantService.getTenantInfo()
                if (response.success) {
                    setTenant(response.data)
                }
            } catch (err) {
                console.error('Failed to fetch tenant info:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchTenant()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setTenant(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })
        try {
            const response = await tenantService.updateTenantInfo(tenant)
            if (response.success) {
                setMessage({ type: 'success', text: 'Organization information updated successfully!' })
                setTenant(response.data)
                // Scroll to top to see success message
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update information' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 5000)
        }
    }

    const tabs = [
        { id: 'general', label: 'General Info', icon: Info },
        { id: 'address', label: 'Address / Location', icon: MapPin },
        { id: 'bank', label: 'Banking', icon: Briefcase },
        { id: 'tax', label: 'Tax & Compliance', icon: ShieldCheck },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 flex justify-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-navy-900 tracking-tight">Organization Profile</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Configure your legal entity details, banking and compliance documents.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-xl font-black shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>

                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-4 rounded-2xl text-sm font-bold border flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {message.text}
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* Navigation Sidebar (Desktop) / Tabs (Mobile) */}
                    <div className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-left ${activeTab === tab.id
                                        ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20'
                                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 min-h-[500px]">
                        <form id="tenantForm" onSubmit={handleSubmit} className="space-y-10">
                            {activeTab === 'general' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-xl font-black text-navy-900 mb-1">Company Basics</h3>
                                        <p className="text-gray-400 text-sm font-medium">Public information about your organization.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={tenant.name || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Ziddi Mumbaikar"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Legal/Full Name</label>
                                            <input
                                                type="text"
                                                name="legal_name"
                                                value={tenant.legal_name || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Ziddi Mumbaikar Social Welfare Society"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subdomain (Fixed)</label>
                                            <input
                                                type="text"
                                                name="subdomain"
                                                value={tenant.subdomain || ''}
                                                readOnly
                                                className="w-full px-5 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Organization Type</label>
                                            <select
                                                name="business_type"
                                                value={tenant.business_type || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all appearance-none"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="ngo">NGO</option>
                                                <option value="charity">Charity</option>
                                                <option value="foundation">Foundation</option>
                                                <option value="institution">Institution</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Primary Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={tenant.email || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="support@ziddimumbaikar.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Primary Hotline</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={tenant.phone || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'address' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-xl font-black text-navy-900 mb-1">Office Address</h3>
                                        <p className="text-gray-400 text-sm font-medium">Where your organization is physically located.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Address Line 1 (Building/Street)</label>
                                            <input
                                                type="text"
                                                name="address_line1"
                                                value={tenant.address_line1 || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="B-42, Global Business Park"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Address Line 2 (Area/Sector)</label>
                                            <input
                                                type="text"
                                                name="address_line2"
                                                value={tenant.address_line2 || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Andheri East, Sector-V"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Landmark</label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={tenant.landmark || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Near Metro Station"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pincode / ZIP</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={tenant.pincode || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="400053"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={tenant.city || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Mumbai"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">State / Province</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={tenant.state || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Maharashtra"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'bank' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-xl font-black text-navy-900 mb-1">Bank Account Details</h3>
                                        <p className="text-gray-400 text-sm font-medium">Used for disbursements and donation payouts.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Holder Name</label>
                                            <input
                                                type="text"
                                                name="account_name"
                                                value={tenant.account_name || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Foundation Legal Name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bank Name</label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                value={tenant.bank_name || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="HDFC Bank / ICICI / SBI"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Type</label>
                                            <select
                                                name="account_type"
                                                value={tenant.account_type || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all appearance-none"
                                            >
                                                <option value="savings">Savings Account</option>
                                                <option value="current">Current Account</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                value={tenant.account_number || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="0000 1111 2222 33"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifsc_code"
                                                value={tenant.ifsc_code || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all uppercase"
                                                placeholder="HDFC0000123"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Branch Name</label>
                                            <input
                                                type="text"
                                                name="branch_name"
                                                value={tenant.branch_name || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Main Market Branch, Andheri"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'tax' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-xl font-black text-navy-900 mb-1">Compliance & ID</h3>
                                        <p className="text-gray-400 text-sm font-medium">Verify your tax status and registration codes.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">PAN Number</label>
                                            <input
                                                type="text"
                                                name="pan_number"
                                                value={tenant.pan_number || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all uppercase"
                                                placeholder="ABCDE1234F"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registration No.</label>
                                            <input
                                                type="text"
                                                name="registration_number"
                                                value={tenant.registration_number || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="Reg / 2024 / 001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">80G Status No.</label>
                                            <input
                                                type="text"
                                                name="ngo_80g"
                                                value={tenant.ngo_80g || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="80G Registration"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">12A Status No.</label>
                                            <input
                                                type="text"
                                                name="ngo_12a"
                                                value={tenant.ngo_12a || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="12A Registration"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Niti Aayog Darpan ID</label>
                                            <input
                                                type="text"
                                                name="darpan_id"
                                                value={tenant.darpan_id || ''}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                                                placeholder="MH/2024/000123"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default function TenantSettingsPage() {
    return (
        <ProtectedRoute>
            <TenantSettingsContent />
        </ProtectedRoute>
    )
}
