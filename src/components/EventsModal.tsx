'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { eventService, Event as EventType } from '@/services/event.service'

export default function EventsModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Only run on client
        const hasSeenModal = sessionStorage.getItem('events_modal_seen')
        if (hasSeenModal === 'true') {
            setIsLoading(false)
            return
        }


        const fetchEvents = async () => {
            try {
                const res = await eventService.getEvents({ limit: 10 })
                const fetchedEvents = res.data || []

                const now = new Date()
                const upcoming = fetchedEvents.filter((ev) => {
                    const start = new Date(ev.start_datetime)
                    return start > now && !(start.toDateString() === now.toDateString())
                })

                if (upcoming.length > 0) {
                    setUpcomingEvents(upcoming.slice(0, 3)) // Show max 3 events
                    setIsOpen(true)
                }
            } catch (err) {
                console.error("Failed to fetch events for modal", err)
            } finally {
                setIsLoading(false)
            }
        }

        // Small delay to let the page load visually first, feels more native and professional
        const timer = setTimeout(() => {
            fetchEvents()
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        sessionStorage.setItem('events_modal_seen', 'true')
    }

    if (isLoading || upcomingEvents.length === 0) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
                    >
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 flex items-center justify-between text-white shadow-md z-10">
                            <div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/30">
                                    Upcoming in Mumbai
                                </span>
                                <h2 className="font-display text-2xl font-bold mt-2">
                                    Don&apos;t Miss These Events!
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow">
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => {
                                    const startDate = new Date(event.start_datetime)
                                    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

                                    return (
                                        <div key={event.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            {event.cover_image_url && (
                                                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden relative shrink-0">
                                                    <Image
                                                        src={event.cover_image_url}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-primary-600 font-bold text-sm bg-primary-50 px-2 py-0.5 rounded-md">
                                                        {dateStr}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">
                                                        {timeStr}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-navy-900 line-clamp-1">{event.title}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-1 mt-0.5 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Footer area */}
                        <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Maybe Later
                            </button>
                            <Link
                                href="/#events"
                                onClick={handleClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-navy-900 text-white text-center hover:bg-primary-600 transition-colors shadow-lg shadow-navy-900/20"
                            >
                                View All Events
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
