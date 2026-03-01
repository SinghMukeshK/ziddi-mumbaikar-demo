'use client'

import { useState, useEffect } from 'react'
import { notificationService, Notification } from '@/services/notification.service'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, Trash2, Calendar, Clock, ArrowLeft, MoreHorizontal, Inbox } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
    const { isLoggedIn } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState<any>(null)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const fetchNotifications = async () => {
        if (!isLoggedIn) return
        try {
            setLoading(true)
            const params: any = { page, limit: 10 }
            if (filter === 'unread') params.is_read = false

            const response = await notificationService.getMyNotifications(params)
            setNotifications(response.data || [])
            setMeta(response.meta)
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err)
            setError('Failed to load notifications.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [isLoggedIn, page, filter])

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            if (filter === 'unread') setNotifications([])
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-black text-navy-900 tracking-tight">Notifications</h1>
                            </div>
                            <p className="text-slate-500 font-medium ml-12">Stay updated with your activities and community impact.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark all as read
                            </button>
                        </div>
                    </div>

                    {/* Filters & Pagination info */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center justify-between">
                        <div className="flex gap-1">
                            <button
                                onClick={() => { setFilter('all'); setPage(1); }}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-navy-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => { setFilter('unread'); setPage(1); }}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-navy-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Unread
                            </button>
                        </div>

                        {meta && (
                            <div className="flex items-center gap-3 px-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Page {page} of {meta.pages || 1}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={page === 1 || loading}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-navy-900" />
                                    </button>
                                    <button
                                        disabled={(meta && page >= meta.pages) || loading}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-navy-900 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {loading && notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
                                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading your alerts...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                    <Inbox className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-navy-900 mb-2">Clean Slate!</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                    {filter === 'unread'
                                        ? "You've caught up with everything. No unread notifications found."
                                        : "You don't have any notifications yet. They'll appear here once there's activity."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <AnimatePresence mode="popLayout">
                                    {notifications.map((n, idx) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={n.id}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`relative group bg-white rounded-2xl border transition-all duration-300 ${!n.is_read ? 'border-primary-100 shadow-md shadow-primary-500/5' : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
                                        >
                                            <div className="p-5 sm:p-6 flex gap-4">
                                                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${!n.is_read ? 'bg-primary-50 text-primary-500' : 'bg-slate-50 text-slate-400'}`}>
                                                    <Bell className={`w-5 h-5 ${!n.is_read ? 'animate-bounce' : ''}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className={`text-sm tracking-tight truncate pr-4 ${!n.is_read ? 'text-navy-900 font-black' : 'text-slate-600 font-bold'}`}>
                                                            {n.template?.subject || 'Notification Update'}
                                                        </h4>
                                                        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(n.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className={`text-sm leading-relaxed mb-3 ${!n.is_read ? 'text-slate-700 font-medium' : 'text-slate-500 font-medium'}`}
                                                        dangerouslySetInnerHTML={{ __html: n.template?.content || '' }}
                                                    />

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        {!n.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(n.id)}
                                                                className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {!n.is_read && (
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full translate-x-1/2 -translate-y-1/2 shadow-lg shadow-primary-500/50" />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
