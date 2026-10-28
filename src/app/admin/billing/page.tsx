'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Download, Receipt, RefreshCw } from 'lucide-react'
import { billingService, Invoice } from '@/services/billing.service'

// Admin › Billing: the bills for the platform (Drista's subscription bills, and any invoices the
// organisation raised itself). Cards for what is still pending and what has been paid, then the
// bills, filtered by status and paged here (every bill is loaded so the totals cover all of them).

type Filter = 'all' | 'pending' | 'paid'
const PAGE_SIZE = 10

const rupees = (n: number) => `₹${(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
const fmtDate = (s?: string | null) => {
    if (!s) return '—'
    const d = new Date(s)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }

/** A bill as this page reads it: what it's for, what's paid, what's left, and whether it's late. */
interface Bill {
    id: string
    number: string
    issued?: string
    due?: string
    total: number
    paid: number
    balance: number
    state: 'paid' | 'pending' | 'void'
    overdue: boolean
    pdf?: string
}

function toBill(i: Invoice & Record<string, any>): Bill {
    const total = Number(i.total ?? i.total_amount) || 0
    const paid = Number(i.amount_paid) || 0
    const status = String(i.status || '').toLowerCase()
    const voided = ['void', 'cancelled', 'draft'].includes(status)
    const balance = voided ? 0 : Math.max(0, i.amount_remaining != null ? Number(i.amount_remaining) || 0 : total - paid)
    const isPaid = !voided && (status === 'paid' || balance <= 0.005)
    const due = i.due_date || undefined
    return {
        id: i.id,
        number: i.invoice_number || i.bill_number || '—',
        issued: i.bill_date || i.created_at || i.createdAt,
        due,
        total, paid: isPaid ? Math.max(paid, total) : paid, balance: isPaid ? 0 : balance,
        state: voided ? 'void' : isPaid ? 'paid' : 'pending',
        overdue: !voided && !isPaid && !!due && new Date(due).getTime() < startOfToday(),
        pdf: i.invoice_pdf_url,
    }
}

export default function AdministrativeBillingPage() {
    const [bills, setBills] = useState<Bill[] | null>(null)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState<Filter>('all')
    const [page, setPage] = useState(1)

    const load = async () => {
        setError('')
        setBills(null)
        try {
            // Every page, so the cards add up all the bills.
            const all: Invoice[] = []
            for (let p = 1; p <= 20; p++) {
                const res: any = await billingService.getInvoices(p, 100)
                if (!res?.success) throw new Error(res?.message || 'Failed to load the bills')
                all.push(...(res.data || []))
                if (p >= (res.pagination?.totalPages || 1)) break
            }
            setBills(all.map((i) => toBill(i as any)).sort((a, b) => new Date(b.issued || 0).getTime() - new Date(a.issued || 0).getTime()))
        } catch (err: any) {
            console.error('Billing fetch error:', err)
            setError(err?.message || 'Failed to load the bills')
            setBills([])
        }
    }
    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [filter])

    const summary = useMemo(() => {
        const list = (bills || []).filter((b) => b.state !== 'void')
        const pending = list.filter((b) => b.state === 'pending')
        const overdue = pending.filter((b) => b.overdue)
        const nextDue = pending.filter((b) => b.due).sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())[0]
        return {
            pendingAmount: pending.reduce((n, b) => n + b.balance, 0),
            pendingCount: pending.length,
            overdueAmount: overdue.reduce((n, b) => n + b.balance, 0),
            overdueCount: overdue.length,
            oldestDue: nextDue?.due,
            paidAmount: list.reduce((n, b) => n + b.paid, 0),
            paidCount: list.filter((b) => b.state === 'paid').length,
            lastPaid: list.filter((b) => b.state === 'paid').sort((a, b) => new Date(b.issued || 0).getTime() - new Date(a.issued || 0).getTime())[0],
            billed: list.reduce((n, b) => n + b.total, 0),
            count: list.length,
        }
    }, [bills])

    const shown = useMemo(() => (bills || []).filter((b) => filter === 'all' || b.state === filter), [bills, filter])
    const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
    const rows = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    if (bills === null) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] pt-32 text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading your bills…</p>
            </div>
        )
    }

    const tabs: { key: Filter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: (bills || []).length },
        { key: 'pending', label: 'Pending', count: summary.pendingCount },
        { key: 'paid', label: 'Paid', count: summary.paidCount },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-navy-900 text-white rounded-xl">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing</span>
                    </div>
                    <h1 className="text-3xl font-black text-navy-900 tracking-tight">My Bills</h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">Your platform subscription bills, what is paid and what is still due.</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white text-navy-900 border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </header>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                </div>
            )}

            {/* The cards: pending, paid, billed in all */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="relative overflow-hidden bg-navy-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-300/40">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-500 rounded-full opacity-20 blur-3xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Pending</span>
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center"><Clock className="w-5 h-5 text-primary-300" /></div>
                        </div>
                        <p className="text-4xl font-black tracking-tight" data-card="pending">{rupees(summary.pendingAmount)}</p>
                        <p className="mt-2 text-xs font-bold text-white/70">
                            {summary.pendingCount === 0 ? 'Nothing due. You are all paid up.' : `${summary.pendingCount} bill${summary.pendingCount === 1 ? '' : 's'} to pay`}
                        </p>
                        {summary.overdueCount > 0 && (
                            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-black text-red-200">
                                <AlertCircle className="w-3.5 h-3.5" /> {rupees(summary.overdueAmount)} overdue · {summary.overdueCount} bill{summary.overdueCount === 1 ? '' : 's'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paid</span>
                        <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
                    </div>
                    <p className="text-4xl font-black tracking-tight text-navy-900" data-card="paid">{rupees(summary.paidAmount)}</p>
                    <p className="mt-2 text-xs font-bold text-gray-500">
                        {summary.paidCount} bill{summary.paidCount === 1 ? '' : 's'} paid{summary.lastPaid ? ` · last ${summary.lastPaid.number}` : ''}
                    </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Billed in all</span>
                        <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center"><Receipt className="w-5 h-5 text-primary-500" /></div>
                    </div>
                    <p className="text-4xl font-black tracking-tight text-navy-900">{rupees(summary.billed)}</p>
                    <p className="mt-2 text-xs font-bold text-gray-500">{summary.count} bill{summary.count === 1 ? '' : 's'}</p>
                    {summary.billed > 0 && (
                        <div className="mt-4">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (summary.paidAmount / summary.billed) * 100)}%` }} />
                            </div>
                            <p className="mt-1.5 text-[11px] font-bold text-gray-400">{Math.round((summary.paidAmount / summary.billed) * 100)}% paid</p>
                        </div>
                    )}
                </div>
            </div>

            {/* The bills */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 pt-6 pb-4">
                    <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest">Bills</h2>
                    <div className="flex gap-1 rounded-xl bg-gray-50 p-1" role="tablist" aria-label="Filter bills">
                        {tabs.map((t) => (
                            <button key={t.key} role="tab" aria-selected={filter === t.key} onClick={() => setFilter(t.key)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === t.key ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}>
                                {t.label} <span className="ml-1 text-gray-400">{t.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Phones: one card per bill */}
                <div className="sm:hidden divide-y divide-gray-50 border-t border-gray-100">
                    {rows.map((b) => (
                        <div key={b.id} className="px-6 py-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-navy-900">{b.number}</p>
                                <p className="text-xs font-bold text-gray-400">{fmtDate(b.issued)}{b.state === 'pending' && b.due ? ` · due ${fmtDate(b.due)}` : ''}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-navy-900">{rupees(b.state === 'pending' ? b.balance : b.total)}</p>
                                <StatusBadge bill={b} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Wider screens: the table */}
                <div className="hidden sm:block overflow-x-auto border-t border-gray-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/60">
                                {['Bill', 'Issued', 'Due', 'Amount', 'Paid', 'Balance', 'Status', ''].map((h, i) => (
                                    <th key={i} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 ${i >= 3 && i <= 5 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rows.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors" data-bill={b.number}>
                                    <td className="px-6 py-4 text-sm font-black text-navy-900 whitespace-nowrap">{b.number}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{fmtDate(b.issued)}</td>
                                    <td className={`px-6 py-4 text-xs font-bold whitespace-nowrap ${b.overdue ? 'text-red-500' : 'text-gray-500'}`}>{fmtDate(b.due)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-navy-900 text-right whitespace-nowrap">{rupees(b.total)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-right whitespace-nowrap">{b.paid ? rupees(b.paid) : '—'}</td>
                                    <td className="px-6 py-4 text-sm font-black text-right whitespace-nowrap">{b.balance ? <span className="text-navy-900">{rupees(b.balance)}</span> : <span className="text-gray-300">—</span>}</td>
                                    <td className="px-6 py-4"><StatusBadge bill={b} /></td>
                                    <td className="px-6 py-4 text-right">
                                        {b.pdf && (
                                            <a href={b.pdf} target="_blank" rel="noopener noreferrer" title="Download the bill"
                                                className="inline-flex p-2 rounded-lg text-primary-500 bg-primary-50 hover:bg-navy-900 hover:text-white transition-all">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {rows.length === 0 && (
                    <div className="px-8 py-16 text-center border-t border-gray-100">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {filter === 'pending' ? 'No pending bills' : filter === 'paid' ? 'No paid bills yet' : 'No bills yet'}
                        </p>
                    </div>
                )}

                {pages > 1 && (
                    <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, shown.length)} of {shown.length}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page"
                                className="p-2 bg-white text-navy-900 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                            <button disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} aria-label="Next page"
                                className="p-2 bg-white text-navy-900 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    )
}

function StatusBadge({ bill }: { bill: Bill }) {
    const [label, tone] = bill.state === 'paid' ? ['Paid', 'bg-green-50 text-green-600']
        : bill.state === 'void' ? ['Cancelled', 'bg-gray-100 text-gray-500']
            : bill.overdue ? ['Overdue', 'bg-red-50 text-red-500']
                : bill.paid > 0 ? ['Part paid', 'bg-amber-50 text-amber-600'] : ['Pending', 'bg-blue-50 text-blue-500']
    return <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${tone}`}>{label}</span>
}
