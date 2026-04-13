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
            <div className="bg-[#1a1c1e] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Audit Trail</span>
                    </div>
                </div>
                <div className="p-3 space-y-3 max-h-[250px] overflow-y-auto scrollbar-hide">
                    {logs.length === 0 && !load ? (
                        <div className="py-4 text-center text-white/20 italic text-[10px]">No technical events captured yet.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="relative pl-5 pb-3 border-l border-white/10 last:pb-0">
                                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#1a1c1e] border-2 border-white/20 flex items-center justify-center">
                                    <div className={`w-1 h-1 rounded-full ${log.status === 'processed' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                </div>
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-mono text-primary-400 uppercase">{log.event_type}</span>
                                    <span className="text-[9px] text-white/30">{formatDate(log.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {getStatusIcon(log.status)}
                                    <span className="text-[10px] text-white/50 capitalize">{log.status.replace('_', ' ')}</span>
                                </div>
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
            <div className="bg-gray-900 rounded-lg p-3 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <FileJson size={12} className="text-primary-400" />
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">{title}</span>
                </div>
                <pre className="text-[9px] font-mono text-primary-100/70 overflow-x-auto custom-scrollbar leading-tight">
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
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 py-9 pt-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-navy-900 tracking-tight">Active Subscriptions</h1>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Managed Financial Node</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchSubscriptions}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-navy-900 uppercase tracking-widest hover:border-primary-500/30 transition-all shadow-sm group"
                            >
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
                                <Download size={12} />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-primary-100 transition-colors" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Active Core</p>
                                <h3 className="text-2xl font-black text-navy-900">{subscriptions.length}</h3>
                                <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Status
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">MRR (INR)</p>
                            <h3 className="text-2xl font-black text-navy-900">
                                {formatCurrency(subscriptions.reduce((acc, s) => acc + (Number(s.amount) || 0), 0))}
                            </h3>
                            <p className="text-[9px] font-bold text-primary-500 mt-1 uppercase tracking-widest">Monthly Commitment</p>
                        </div>
                        <div className="bg-navy-900 p-4 rounded-2xl shadow-xl flex flex-col justify-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Health Grade</p>
                            <h3 className="text-2xl font-black text-white">OPTIMAL</h3>
                            <p className="text-[9px] font-bold text-primary-400 mt-1 uppercase tracking-widest">SSL SECURED</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-4 bg-gray-50/30">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search commitments..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-primary-500/30 font-bold text-[11px] outline-none transition-all placeholder:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                                    Status: Active Only
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[300px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Node Data...</p>
                                </div>
                            ) : filteredSubscriptions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-gray-300 opacity-50">
                                    <Activity size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-4">Buffer Empty</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-gray-50/50">
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Donor Identity</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Project Target</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Progression</th>
                                            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Commitment</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSubscriptions.map((s) => (
                                            <React.Fragment key={s.id}>
                                                <tr
                                                    onClick={() => toggleExpand(s.id)}
                                                    className={`hover:bg-primary-50/10 transition-all group cursor-pointer ${expandedId === s.id ? 'bg-primary-50/30' : ''}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white text-[11px] font-black group-hover:scale-105 transition-transform">
                                                                {(s.donor?.first_name?.[0] || 'U')}{(s.donor?.last_name?.[0] || '')}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-navy-900">{s.donor?.first_name} {s.donor?.last_name}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.donor?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-[10px] font-black text-navy-900 uppercase truncate max-w-[150px]">{s.project?.name || s.fundraiser?.title || 'GENERAL'}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {s.gateway_subscription_id}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="w-full max-w-[140px]">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-[9px] font-black text-navy-900 uppercase tracking-wider">{s.paid_count}/{s.total_count || '∞'}</p>
                                                                <p className="text-[9px] font-black text-primary-500 uppercase">{s.frequency.replace('ly', '')}</p>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary-500 rounded-full"
                                                                    style={{ width: `${Math.min((s.paid_count / (s.total_count || 12)) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <p className="text-sm font-black text-navy-900 tracking-tight">{formatCurrency(s.amount)}</p>
                                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest leading-none mt-0.5">{s.status}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${expandedId === s.id ? 'bg-navy-900 text-white rotate-180' : 'text-gray-200 group-hover:text-primary-500'}`}>
                                                            <ChevronDown size={14} />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                    {expandedId === s.id && (
                                                        <tr>
                                                            <td colSpan={5} className="p-0 border-none bg-gray-50/50">
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                        <div className="space-y-4">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Core Node</p>
                                                                                    <div className="space-y-2">
                                                                                        <div>
                                                                                            <p className="text-[8px] text-gray-400 font-bold uppercase">Endpoint ID</p>
                                                                                            <p className="text-[10px] font-black text-primary-600 font-mono">{s.gateway_subscription_id}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-[8px] text-gray-400 font-bold uppercase">Next Event</p>
                                                                                            <p className="text-[10px] font-black text-navy-900">{formatDate(s.next_billing_at)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Execution</p>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleSync(s.id); }}
                                                                                        disabled={syncingId === s.id}
                                                                                        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                                            syncingId === s.id
                                                                                            ? 'bg-gray-100 text-gray-400'
                                                                                            : 'bg-navy-900 text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20'
                                                                                        }`}
                                                                                    >
                                                                                        <RefreshCw size={12} className={syncingId === s.id ? 'animate-spin' : ''} />
                                                                                        {syncingId === s.id ? 'Reconciling' : 'Sync Gateway'}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            <JsonViewer data={s.metadata} title="Meta Cluster" />
                                                                        </div>
                                                                        <div className="space-y-4">
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
