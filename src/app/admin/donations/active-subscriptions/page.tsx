'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    Search,
    CreditCard,
    ArrowUpRight,
    TrendingUp,
    Download,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    User,
    Activity,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileJson,
    Info,
    LayoutDashboard,
    Terminal,
    ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { donationService, Subscription } from '@/services/donation.service'
import { auditService, WebhookEventLog } from '@/services/audit.service'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'

export default function ActiveSubscriptionsPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [syncingId, setSyncingId] = useState<string | null>(null)

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/')
        } else if (isLoggedIn) {
            fetchSubscriptions()
        }
    }, [isLoggedIn, user, router])

    const fetchSubscriptions = async () => {
        setLoading(true)
        try {
            const res = await donationService.getSubscriptions()
            if (res.success) {
                const rawData = res.data as any;
                const data = (Array.isArray(rawData) ? rawData : (rawData?.data || [])) as Subscription[];
                // Filter only ACTIVE subscriptions as per user request
                const activeOnly = data.filter(s => s.status === 'active');
                setSubscriptions(activeOnly)
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (id: string) => {
        if (syncingId) return;
        setSyncingId(id);
        try {
            const res = await donationService.syncSubscription(id);
            if (res.success) {
                await fetchSubscriptions();
            }
        } catch (error) {
            console.error('Failed to sync subscription:', error);
        } finally {
            setSyncingId(null);
        }
    }

    // --- Sub-component for Webhook Audit Trail ---
    const WebhookAuditTrail = ({ subId }: { subId: string }) => {
        const [logs, setLogs] = useState<WebhookEventLog[]>([]);
        const [load, setLoad] = useState(false);

        useEffect(() => {
            if (subId) fetchLogs();
        }, [subId]);

        const fetchLogs = async () => {
            setLoad(true);
            try {
                const res = await auditService.getWebhookLogsByReference(subId);
                if (res.success) setLogs(res.data);
            } catch (err) {
                console.error('Audit trail error:', err);
            } finally {
                setLoad(false);
            }
        };

        const getStatusIcon = (status: string) => {
            switch (status) {
                case 'processed': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
                case 'failed': return <XCircle className="w-3 h-3 text-rose-400" />;
                case 'invalid_signature': return <ShieldAlert className="w-3 h-3 text-amber-400" />;
                default: return <Clock className="w-3 h-3 text-slate-400" />;
            }
        };

        return (
            <div className="bg-[#1a1c1e] rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary-400" />
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Technical Audit Trail</span>
                    </div>
                    {load && <RefreshCw className="w-3 h-3 text-primary-400 animate-spin" />}
                </div>
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                    {logs.length === 0 && !load ? (
                        <div className="py-8 text-center text-white/20 italic text-xs">No technical events captured yet.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="relative pl-6 pb-4 border-l border-white/10 last:pb-0">
                                <div className="absolute left-[-6px] top-1 w-3 h-3 rounded-full bg-[#1a1c1e] border-2 border-white/20 flex items-center justify-center">
                                    <div className={`w-1 h-1 rounded-full ${log.status === 'processed' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-mono text-primary-400 uppercase">{log.event_type}</span>
                                    <span className="text-[10px] text-white/30">{formatDate(log.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(log.status)}
                                    <span className="text-[11px] text-white/50 capitalize">{log.status.replace('_', ' ')}</span>
                                </div>
                                {log.error_message && (
                                    <div className="mt-2 text-[10px] text-rose-400/80 bg-rose-400/5 p-2 rounded-lg border border-rose-400/10">
                                        {log.error_message}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue || dateValue === 'Invalid Date') return '—';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return '—'; }
    }

    const formatCurrency = (amount: any) => {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num)
    }

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const JsonViewer = ({ data, title }: { data: any, title: string }) => {
        if (!data) return null;
        return (
            <div className="bg-gray-900 rounded-xl p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <FileJson size={14} className="text-primary-400" />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{title}</span>
                </div>
                <pre className="text-[10px] font-mono text-primary-100/70 overflow-x-auto custom-scrollbar leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        )
    }

    const filteredSubscriptions = subscriptions.filter(s => {
        const donorName = `${s.donor?.first_name || ''} ${s.donor?.last_name || ''}`.toLowerCase()
        return donorName.includes(searchQuery.toLowerCase()) || 
               (s.donor?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                    <Activity size={20} />
                                </div>
                                <h1 className="text-3xl font-black text-navy-900 tracking-tight">Active Subscriptions</h1>
                            </div>
                            <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">Monitoring all active recurring donor commitments.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchSubscriptions}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-navy-900 uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm group"
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                                Refresh
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white border border-navy-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
                                <Download size={14} />
                                Export List
                            </button>
                        </div>
                    </div>

                    {/* Quick Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Live Subscriptions</p>
                                <h3 className="text-4xl font-black tracking-tight">{subscriptions.length}</h3>
                                <p className="text-[10px] font-bold text-primary-400 mt-2 flex items-center gap-1">
                                    <Activity size={10} className="animate-pulse" /> SYSTEM ONLINE
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-500/5 flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Monthly Run Rate</p>
                            <h3 className="text-2xl font-black text-navy-900">
                                {formatCurrency(subscriptions.reduce((acc, s) => acc + (Number(s.amount) || 0), 0))}
                            </h3>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Sustainable Growth</span>
                            </div>
                        </div>
                        <div className="bg-primary-500 p-6 rounded-[32px] text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Commitment Grade</p>
                             <h3 className="text-2xl font-black">HIGH FIDELITY</h3>
                             <p className="text-[10px] font-bold text-white/70 mt-2 uppercase tracking-widest">Verified via Razorpay API</p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-500/5 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:max-w-md">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search active donors..."
                                    className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/20 outline-none font-bold text-sm transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Showing: ACTIVE ONLY</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscriptions Table */}
                        <div className="overflow-x-auto min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary-100 rounded-full"></div>
                                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-navy-900 uppercase tracking-[0.3em] mb-1">Authenticating Data</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Please wait while we sync with financial gateways</p>
                                    </div>
                                </div>
                            ) : filteredSubscriptions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                                        <Activity size={32} />
                                    </div>
                                    <p className="text-sm font-black text-navy-900 uppercase tracking-widest">No Active Subscriptions Found</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-gray-50/50">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Donor Identity</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Commitment</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cycle Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Run Rate</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSubscriptions.map((s) => (
                                            <React.Fragment key={s.id}>
                                                <tr
                                                    onClick={() => toggleExpand(s.id)}
                                                    className={`hover:bg-primary-50/10 transition-all group cursor-pointer ${expandedId === s.id ? 'bg-primary-50/30' : ''}`}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-navy-900 flex items-center justify-center text-white shadow-lg shadow-navy-900/10 transition-transform group-hover:scale-110">
                                                                <span className="font-black text-sm">
                                                                    {(s.donor?.first_name?.[0] || 'U')}{(s.donor?.last_name?.[0] || '')}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-navy-900 text-base">{s.donor?.first_name} {s.donor?.last_name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.donor?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div>
                                                            <p className="text-[11px] font-black text-navy-900 uppercase mb-1">{s.project?.name || s.fundraiser?.title || 'GENERAL DONATION'}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={12} className="text-primary-500" />
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Since {formatDate(s.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="w-full max-w-[180px]">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-[10px] font-black text-navy-900 uppercase tracking-widest">
                                                                    {s.paid_count}/{s.total_count || '∞'} PAYMENTS
                                                                </p>
                                                                <p className="text-[10px] font-black text-primary-500 uppercase">
                                                                    {s.frequency}
                                                                </p>
                                                            </div>
                                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min((s.paid_count / (s.total_count || 12)) * 100, 100)}%` }}
                                                                    className="h-full bg-primary-500 rounded-full shadow-[0_0_10px_rgba(240,117,10,0.3)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <p className="font-black text-navy-900 text-lg tracking-tighter">{formatCurrency(s.amount)}</p>
                                                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.1em]">Verified Active</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${expandedId === s.id ? 'bg-navy-900 text-white rotate-180' : 'text-gray-300 group-hover:text-primary-500'}`}>
                                                            <ChevronDown size={18} />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                    {expandedId === s.id && (
                                                        <tr>
                                                            <td colSpan={5} className="p-0 border-none">
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="bg-gray-50/50"
                                                                >
                                                                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                                        <div className="space-y-6">
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-12 translate-x-12 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                    <div className="relative z-10">
                                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Core</p>
                                                                                        <div className="space-y-4">
                                                                                            <div>
                                                                                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Gateway Reference</p>
                                                                                                <p className="text-xs font-black text-primary-600 font-mono tracking-tight">{s.gateway_subscription_id}</p>
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Next Billing Event</p>
                                                                                                <p className="text-xs font-black text-navy-900">{formatDate(s.next_billing_at)}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                                                                    <div>
                                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Node Actions</p>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handleSync(s.id); }}
                                                                                            disabled={syncingId === s.id}
                                                                                            className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                                                syncingId === s.id
                                                                                                ? 'bg-gray-100 text-gray-400'
                                                                                                : 'bg-navy-900 text-white hover:bg-navy-800'
                                                                                            }`}
                                                                                        >
                                                                                            <RefreshCw size={14} className={syncingId === s.id ? 'animate-spin' : ''} />
                                                                                            {syncingId === s.id ? 'Reconciling...' : 'Sync Gateway State'}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                                                                <div className="flex items-center justify-between mb-4">
                                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metadata Cluster</p>
                                                                                </div>
                                                                                <JsonViewer data={s.metadata} title="Audit Meta" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-6">
                                                                            <WebhookAuditTrail subId={s.gateway_subscription_id} />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
