'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, MessageSquare, Loader2 } from 'lucide-react'

interface DecisionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (comment: string) => void
    decision: 'approved' | 'rejected' | null
    title: string
    loading?: boolean
}

export default function DecisionModal({ isOpen, onClose, onConfirm, decision, title, loading }: DecisionModalProps) {
    const [comment, setComment] = useState('')

    // Reset comment when modal opens
    useEffect(() => {
        if (isOpen) {
            setComment('')
        }
    }, [isOpen])

    if (!isOpen || !decision) return null

    const isApprove = decision === 'approved'

    const handleConfirm = () => {
        onConfirm(comment)
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl"
                >
                    <div className={`p-8 ${isApprove ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-3 rounded-2xl ${isApprove ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isApprove ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                                disabled={loading}
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-navy-900 mb-1 tracking-tight">
                            {isApprove ? 'Approve' : 'Reject'} Request
                        </h2>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest truncate">{title}</p>
                    </div>

                    <div className="p-8">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
                            {isApprove ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-gray-300" />
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={isApprove ? "Add any internal notes..." : "Please explain why this request is being rejected..."}
                                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-primary-500 focus:bg-white outline-none font-bold text-navy-900 transition-all min-h-[140px] resize-none"
                                required={!isApprove}
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="py-4 bg-gray-100 text-gray-600 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || (!isApprove && !comment.trim())}
                                className={`py-4 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isApprove
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                    }`}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Processing...' : `Confirm ${isApprove ? 'Approval' : 'Rejection'}`}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
