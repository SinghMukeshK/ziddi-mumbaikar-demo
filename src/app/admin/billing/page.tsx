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
    Shield,
    Trash2
} from 'lucide-react'
import { billingService, Subscription, Invoice } from '@/services/billing.service'
import { toast } from 'react-hot-toast'

export default function AdministrativeBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const handleDownload = (invoice: Invoice) => {
        if (invoice.invoice_pdf_url) {
            window.open(invoice.invoice_pdf_url, '_blank')
        } else {
            setPrintingInvoice(invoice)
            setTimeout(() => {
                window.print()
                setTimeout(() => setPrintingInvoice(null), 500)
            }, 150)
        }
    }

    useEffect(() => {
        fetchBillingData(currentPage)
    }, [currentPage])

    const fetchBillingData = async (page: number) => {
        setLoading(true)
        try {
            const invData = await billingService.getInvoices(page, 10)

            if ((invData as any).success) {
                const sorted = [...((invData as any).data || [])].sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0).getTime()
                    const dateB = new Date(b.created_at || b.createdAt || 0).getTime()
                    return dateB - dateA
                })
                setInvoices(sorted)
                setTotalPages((invData as any).pagination?.totalPages || 1)
            }
        } catch (err: any) {
            console.error('Billing fetch error:', err)
            setError('Failed to load invoice history')
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
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-navy-900 text-white">
                            <History className="w-5 h-5" />
                        </div>
                        <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing</h1>
                    </div>
                    <h2 className="text-2xl font-black text-navy-900 py-5 tracking-tight">My Bills</h2>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Invoice ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date Issued</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                {/* <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length > 0 ? invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-navy-900">{invoice.invoice_number}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-gray-500">
                                            {(() => {
                                                const dateString = invoice.created_at || invoice.createdAt;
                                                if (!dateString) return 'N/A';
                                                const date = new Date(dateString);
                                                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                                            })()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-navy-900">₹{invoice.total.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`px-3 py-1 rounded-full w-fit ${getStatusColor(invoice.status)} text-[10px] font-black uppercase tracking-widest`}>
                                            {invoice.status}
                                        </div>
                                    </td>
                                    {/* <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleDownload(invoice)}
                                            className="inline-block p-2 hover:bg-navy-900 hover:text-white hover:shadow-sm rounded-lg transition-all text-primary-500 bg-primary-50 active:scale-95"
                                            title="Print / Download Receipt"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td> */}
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="px-6 py-2.5 text-xs font-bold bg-white text-navy-900 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="px-6 py-2.5 text-xs font-bold bg-white text-navy-900 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* PRINT COMPONENT FRONTEND FALLBACK */}
            {printingInvoice && (
                <div className="print-invoice-container bg-white text-black font-sans">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                @media print {
                    @page { margin: 15mm; size: A4 portrait; }
                    body * { visibility: hidden; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-invoice-container, .print-invoice-container * { visibility: visible; }
                    .print-invoice-container { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        max-width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white !important; 
                    }
                }
                @media screen {
                    .print-invoice-container { display: none; }
                }
            ` }} />
                    <div className="w-full max-w-full overflow-hidden">
                        <div className="flex justify-between items-start mb-8 border-b-2 border-gray-900 pb-6">
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter text-navy-900 uppercase">INVOICE</h1>
                                <p className="text-gray-500 font-bold mt-1 text-sm tracking-widest">{printingInvoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-black text-xl text-primary-500">Ziddi Mumbaikar</h2>
                                <p className="text-xs text-gray-600 font-medium">Headquarters, Mumbai</p>
                                <p className="text-xs text-gray-600 font-medium">contact@ziddimumbaikar.com</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Billed To</p>
                                <p className="font-bold text-gray-800">Tenant Billing Account</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Issue Date</p>
                                <p className="font-bold text-gray-800">
                                    {(() => {
                                        const dateString = printingInvoice.created_at || printingInvoice.createdAt;
                                        if (!dateString) return 'N/A';
                                        const d = new Date(dateString);
                                        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-GB');
                                    })()}
                                </p>
                            </div>
                        </div>

                        <table className="w-full text-left mb-8 border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="py-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 font-semibold text-gray-800">Software Subscription & Access</td>
                                    <td className="py-4 font-bold text-gray-900 text-right">₹{printingInvoice.total.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end mb-12">
                            <div className="w-1/2 bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-gray-500">Subtotal</p>
                                    <p className="font-semibold">₹{printingInvoice.total.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-gray-500">Tax</p>
                                    <p className="font-semibold">₹0</p>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                    <p className="text-sm font-black text-navy-900 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-lg font-black text-primary-500">₹{printingInvoice.total.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs font-bold text-gray-400 border-t border-gray-100 pt-8 uppercase tracking-widest">
                            Thank you for your continued partnership.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
