'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { eventService, Event as EventType } from '@/services/event.service'

const formatDate = (start: string, end?: string) => {
    const startDate = new Date(start)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    let formatted = startDate.toLocaleDateString('en-US', options)

    if (end) {
        const endDate = new Date(end)
        if (startDate.toDateString() === endDate.toDateString()) {
            formatted += ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
        } else {
            formatted += ` to ${endDate.toLocaleDateString('en-US', options)}`
        }
    }
    return formatted
}

export default function Events() {
    const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming'>('ongoing')
    const [events, setEvents] = useState<EventType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventService.getEvents({ limit: 100 })
                // For direct map from API
                const fetchedEvents = res.data || []
                setEvents(fetchedEvents)
            } catch (err) {
                console.error("Failed to fetch events", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const now = new Date()

    const ongoingEvents = events.filter((ev) => {
        const start = new Date(ev.start_datetime)
        const end = ev.end_datetime ? new Date(ev.end_datetime) : start
        // Considered ongoing if today is between start and end date (inclusive) or if start is today
        return (start <= now && end >= now) || (start.toDateString() === now.toDateString())
    })

    const upcomingEvents = events.filter((ev) => {
        const start = new Date(ev.start_datetime)
        // Upcoming if start strictly after today and it's not ongoing
        return start > now && !(start.toDateString() === now.toDateString())
    })

    const displayedEvents = activeTab === 'ongoing' ? ongoingEvents : upcomingEvents

    return (
        <section id="events" className="py-20 bg-gray-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply opacity-50 blur-3xl" />
            <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-navy-100 rounded-full mix-blend-multiply opacity-50 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-4 block"
                    >
                        Get Involved
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-display font-bold text-navy-900 mb-6"
                    >
                        Our Events & <span className="text-primary-500">Initiatives</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 max-w-2xl mx-auto text-lg"
                    >
                        Join our community-driven events and make a tangible difference. See what we are up to and how you can be part of the change.
                    </motion.p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm inline-flex border border-gray-100 relative">
                        {['ongoing', 'upcoming'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'ongoing' | 'upcoming')}
                                className={`relative px-8 py-3 rounded-xl font-bold text-sm sm:text-base capitalize transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-navy-900'
                                    }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabBadge"
                                        className="absolute inset-0 bg-primary-500 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab} Events</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Cards or Loading */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-navy-900 mb-2">No {activeTab} events found</h3>
                        <p className="text-gray-500">Check back later for more updates and initiatives!</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {displayedEvents.map((event, index) => (
                                <motion.div
                                    key={`${activeTab}-${event.id}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col"
                                >
                                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                        {event.cover_image_url && (
                                            <Image
                                                src={event.cover_image_url}
                                                alt={event.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        )}
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="bg-white/95 backdrop-blur-sm text-primary-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                {event.event_type || 'General'}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4 z-20">
                                            {activeTab === 'ongoing' ? (
                                                <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
                                                </span>
                                            ) : (
                                                <span className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                    Upcoming
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                        <div className="flex items-start gap-4 mb-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium line-clamp-1">{formatDate(event.start_datetime, event.end_datetime)}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl text-sm italic border-l-4 border-primary-200 flex-grow">
                                            &quot;{event.description}&quot;
                                        </p>

                                        <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-6 mt-auto">
                                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium truncate">{event.location || 'Location TBD'}</span>
                                        </div>

                                        <Link
                                            href="/volunteer"
                                            className="w-full flex items-center justify-center gap-2 bg-navy-50 hover:bg-primary-50 text-navy-900 hover:text-primary-600 py-3 rounded-xl font-bold transition-colors group/btn border border-navy-100 hover:border-primary-100"
                                        >
                                            Join Initiative
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
