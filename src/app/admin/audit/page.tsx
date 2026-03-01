'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { auditService, AuditLog } from '@/services/audit.service'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminAuditPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState<any>(null)
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/')
            return
        }

        const fetchLogs = async () => {
            try {
                setLoading(true)
                const response = await auditService.getLogs({ page, limit: 15 })
                setLogs(response.data || [])
                setMeta(response.meta)
            } catch (err: any) {
                console.error('Failed to fetch audit logs:', err)
                setError('Failed to load audit logs. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (isLoggedIn && (user?.role === 'admin' || user?.role === 'super_admin')) {
            fetchLogs()
        }
    }, [isLoggedIn, user, page, router])

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-700 border-green-200'
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200'
        if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200'
        if (action.includes('LOGIN_FAILED')) return 'bg-orange-100 text-orange-700 border-orange-200'
        if (action.includes('SUCCESS')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    const formatJSON = (val: any) => {
        if (!val) return 'None'
        try {
            return JSON.stringify(val, null, 2)
        } catch (e) {
            return String(val)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#F8FAFC] pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-navy-900 tracking-tight mb-2">System Audit Trail</h1>
                            <p className="text-slate-500 font-medium">Forensic activity logs for security, compliance, and financial transparency.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1 || loading}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-all"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm font-black text-navy-900 border-x border-slate-100">
                                Page {page} {meta?.pages ? `of ${meta.pages}` : ''}
                            </span>
                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={meta && page >= meta.pages || loading}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 font-bold animate-pulse">Retrieving encrypted logs...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl text-center font-bold">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">User / Actor</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {logs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-slate-50/80 transition-color cursor-pointer group"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-navy-900 font-bold text-sm">
                                                            {new Date(log.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-black">
                                                            {new Date(log.created_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-tight border ${getActionColor(log.action)}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-navy-900 font-bold text-sm capitalize">{log.entity_type}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">{log.entity_id || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {log.user ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-[10px] font-black">
                                                                {log.user.first_name?.[0]}{log.user.last_name?.[0]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-navy-900 font-bold text-sm">{log.user.first_name} {log.user.last_name}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium">{log.user.email}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic font-bold">System / Anonymous</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="text-primary-500 hover:text-primary-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                                                        View Diff
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />

                {/* Log Detail Panel (Slide-over) */}
                <AnimatePresence>
                    {selectedLog && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedLog(null)}
                                className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-[60]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white z-[70] shadow-2xl overflow-y-auto"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-navy-900 tracking-tight">Log Details</h2>
                                            <p className="text-slate-500 font-bold text-sm underline decoration-primary-300 underline-offset-4 decoration-2">{selectedLog.id}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedLog(null)}
                                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IP Address</p>
                                            <p className="font-mono text-xs font-bold text-navy-900">{selectedLog.ip_address || 'Unknown'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Action Type</p>
                                            <p className="text-xs font-black text-primary-600">{selectedLog.action}</p>
                                        </div>
                                        <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Agent</p>
                                            <p className="text-[11px] font-medium text-slate-600 line-clamp-2 leading-relaxed">{selectedLog.user_agent || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                Old State (Snapshot)
                                            </h4>
                                            <div className="bg-slate-900 p-6 rounded-2xl overflow-x-auto shadow-inner">
                                                <pre className="text-cyan-400 font-mono text-xs leading-relaxed whitespace-pre font-bold">
                                                    {formatJSON(selectedLog.old_values)}
                                                </pre>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="flex items-center gap-2 text-xs font-black text-green-500 uppercase tracking-widest mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                New State (Modified)
                                            </h4>
                                            <div className="bg-slate-900 p-6 rounded-2xl overflow-x-auto shadow-inner">
                                                <pre className="text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre font-bold">
                                                    {formatJSON(selectedLog.new_values)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    )
}
