'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationService, Notification } from '@/services/notification.service'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function NotificationBell() {
    const { isLoggedIn } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        if (!isLoggedIn) return
        try {
            const [notifsResp, countResp] = await Promise.all([
                notificationService.getMyNotifications({ limit: 5 }),
                notificationService.getUnreadCount()
            ])
            if (notifsResp.success) setNotifications(notifsResp.data)
            if (countResp.success) setUnreadCount(countResp.data.unread_count)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications()
            // Poll every 60 seconds
            const interval = setInterval(fetchNotifications, 60000)
            return () => clearInterval(interval)
        }
    }, [isLoggedIn])

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    if (!isLoggedIn) return null

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all relative ${isOpen ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-black text-navy-900 uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400 text-xs font-bold">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${!n.is_read ? 'bg-primary-500' : 'bg-transparent'}`} />
                                                <div className="flex-1">
                                                    <p className={`text-sm leading-snug ${!n.is_read ? 'text-navy-900 font-bold' : 'text-gray-600 font-medium'}`}>
                                                        {n.template?.subject || 'Notification'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                                                        {/* Simple HTML strip if content is HTML, or just show it */}
                                                        {n.template?.content?.replace(/<[^>]*>/g, '') || 'You have a new alert'}
                                                    </p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase mt-2">
                                                        {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-50 bg-slate-50/30 text-center">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-black text-slate-400 hover:text-navy-900 uppercase tracking-widest transition-colors"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
