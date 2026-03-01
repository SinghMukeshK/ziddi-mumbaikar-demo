'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { fundraiserService, Fundraiser } from '@/services/fundraiser.service'
import FundraiserCard from './FundraiserCard'

export default function TrendingFundraisers() {
    const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
    const [loading, setLoading] = useState(true)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchFundraisers = async () => {
            try {
                const response = await fundraiserService.getFundraisers({ limit: 6, status: 'active', sort: 'trending' })
                if (response.success) {
                    setFundraisers(response.data)
                }
            } catch (err) {
                console.error('Failed to fetch trending fundraisers:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchFundraisers()
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current

            let scrollTo: number
            if (direction === 'left') {
                scrollTo = scrollLeft - clientWidth / 1.5
                if (scrollTo < -10) scrollTo = scrollWidth - clientWidth
            } else {
                scrollTo = scrollLeft + clientWidth / 1.5
                if (scrollLeft + clientWidth >= scrollWidth - 10) scrollTo = 0
            }

            scrollContainerRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        if (loading || fundraisers.length <= 1 || isPaused) return

        const interval = setInterval(() => {
            scroll('right')
        }, 4000)

        return () => clearInterval(interval)
    }, [loading, fundraisers, isPaused])

    if (loading) {
        return (
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div className="space-y-4">
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                            <div className="h-12 w-96 bg-gray-200 animate-pulse rounded-lg"></div>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="min-w-[350px] h-[500px] bg-gray-200 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (fundraisers.length === 0) return null

    return (
        <section
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="py-24 bg-gray-50 relative overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary-600 font-bold tracking-widest uppercase text-sm mb-4"
                        >
                            <TrendingUp className="w-5 h-5" />
                            <span>Trending Across Mumbai</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-navy-900 leading-tight"
                        >
                            Our Active <span className="text-primary-500">Fundraisers</span>
                        </motion.h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => scroll('left')}
                            className="w-14 h-14 rounded-full border-2 border-navy-900/10 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all shadow-sm"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-14 h-14 rounded-full border-2 border-navy-900/10 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all shadow-sm"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Fundraisers Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {fundraisers.map((fundraiser: Fundraiser, index: number) => (
                        <div key={fundraiser.id} className="min-w-[320px] md:min-w-[380px] snap-start">
                            <FundraiserCard fundraiser={fundraiser} index={index} />
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/fundraisers"
                        className="group flex items-center gap-3 bg-navy-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-navy-800 transition-all hover:scale-105 shadow-xl shadow-navy-900/20"
                    >
                        Explore More Fundraisers
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}
