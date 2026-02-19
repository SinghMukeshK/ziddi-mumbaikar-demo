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
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (isLoggedIn && user?.role !== 'admin') {
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
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update information' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 5000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 flex justify-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-navy-900 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary-500" />
                        Organization Settings
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your organization&apos;s legal profile and contact information.</p>
                </div>

                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-navy-900 border-b border-gray-50 pb-4">Basic Information</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={tenant.name || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="Ziddi Mumbaikar"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Legal Name</label>
                                <div className="relative">
                                    <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="legal_name"
                                        value={tenant.legal_name || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="Ziddi Mumbaikar Foundation"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Subdomain</label>
                                <div className="relative text-gray-400">
                                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="subdomain"
                                        value={tenant.subdomain || ''}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-xl outline-none font-bold cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Business Type</label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="business_type"
                                        value={tenant.business_type || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold appearance-none"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="ngo">NGO</option>
                                        <option value="charity">Charity</option>
                                        <option value="foundation">Foundation</option>
                                        <option value="institution">Institution</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Website URL</label>
                            <div className="relative">
                                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="url"
                                    name="website"
                                    value={tenant.website || ''}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                    placeholder="https://www.ziddimumbaikar.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax & Legal */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-navy-900 border-b border-gray-50 pb-4">Tax & Compliance</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">PAN Number</label>
                                <div className="relative">
                                    <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="pan_number"
                                        value={tenant.pan_number || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold uppercase"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">80G Registration</label>
                                <div className="relative">
                                    <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="ngo_80g"
                                        value={tenant.ngo_80g || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="80G Reg No"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">12A Registration</label>
                                <div className="relative">
                                    <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="ngo_12a"
                                        value={tenant.ngo_12a || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="12A Reg No"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-navy-900 border-b border-gray-50 pb-4">Contact Details</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Public Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={tenant.email || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="support@ngo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Public Phone</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={tenant.phone || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={tenant.city || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={tenant.state || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                    placeholder="Maharashtra"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={tenant.country || 'India'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                    placeholder="India"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-3 rounded-2xl font-black shadow-xl shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
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
