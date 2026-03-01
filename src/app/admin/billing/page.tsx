'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Calendar,
    Download,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    History,
    ChevronRight,
    ArrowUpRight,
    Settings,
    Shield
} from 'lucide-react'
import { billingService, Subscription, Invoice } from '@/services/billing.service'

export default function AdministrativeBillingPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchBillingData()
    }, [])

    const fetchBillingData = async () => {
        setLoading(true)
        try {
            const [subData, invData] = await Promise.all([
                billingService.getCurrentSubscription(),
                billingService.getInvoices()
            ])

            if (subData.success) {
                setSubscription(subData.data)
            }

            if ((invData as any).success) {
                setInvoices((invData as any).data)
            }
        } catch (err: any) {
            console.error('Billing fetch error:', err)
            setError('Failed to load billing information')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-50 text-green-500'
            case 'open': return 'bg-blue-50 text-blue-500'
            case 'past_due': return 'bg-red-50 text-red-500'
            default: return 'bg-gray-50 text-gray-500'
        }
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Financial Records...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-navy-900 text-white rounded-xl">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing & Subscription</h1>
                </div>
                <h2 className="text-4xl font-black text-navy-900 tracking-tight">Financial Oversight</h2>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Subscription Card */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-navy-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden"
                    >
                        {/* Abstract Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-2">Current Subscription</p>
                                    <h3 className="text-3xl font-black">{subscription?.plan?.name || 'Professional'} Plan</h3>
                                </div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{subscription?.status || 'Active'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Billing cycle</p>
                                    <p className="text-lg font-bold capitalize">{subscription?.billing_cycle || 'Monthly'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Next Billing Date</p>
                                    <p className="text-lg font-bold">
                                        {subscription?.next_billing_date
                                            ? new Date(subscription.next_billing_date).toLocaleDateString()
                                            : 'April 01, 2024'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Amount Due</p>
                                    <p className="text-lg font-bold">₹{subscription?.plan?.monthly_price?.toLocaleString() || '2,999'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20">
                                    Change Plan
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10">
                                    Cancel Subscription
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Usage Limits */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">User Seats</p>
                                <span className="text-[10px] font-black text-navy-900">12 / 15 Used</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 w-[80%]" />
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Beneficiary Profiles</p>
                                <span className="text-[10px] font-black text-navy-900">120 / 500 Used</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[24%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Actions */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
                        <h4 className="text-xs font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Billing Settings
                        </h4>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all group">
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-500">Update Tax ID</span>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all group">
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-500">Payment Methods</span>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all group">
                                <span className="text-xs font-bold text-gray-600 group-hover:text-primary-500">Email Notifications</span>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary-50 p-8 rounded-[2rem] border border-primary-100 relative overflow-hidden">
                        <Shield className="w-24 h-24 text-primary-200 absolute -bottom-6 -right-6 opacity-50" />
                        <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-4">Security Note</h4>
                        <p className="text-navy-900 font-bold text-[11px] leading-relaxed relative z-10">
                            Your billing data is encrypted. We use industry-standard PCI-compliant gateways for all transactions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl">
                            <History className="w-5 h-5 text-navy-900" />
                        </div>
                        <h3 className="text-xl font-black text-navy-900 uppercase tracking-tight">Invoice History</h3>
                    </div>
                    <button className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                        Download All Records <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Invoice ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date Issued</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoices.length > 0 ? invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-navy-900">{invoice.invoice_number}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-navy-900">₹{invoice.total.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`px-3 py-1 rounded-full w-fit ${getStatusColor(invoice.status)} text-[10px] font-black uppercase tracking-widest`}>
                                                {invoice.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-navy-900 hover:text-white rounded-lg transition-all text-gray-400">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <AlertCircle className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No transaction history found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
