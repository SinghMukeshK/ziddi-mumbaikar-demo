'use client'

import { motion } from 'framer-motion'
import { Heart, Clock, CheckCircle2, Users, ArrowRight, Share2, Info, Edit, Star, Ban } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Fundraiser, fundraiserService } from '@/services/fundraiser.service'
import { formatDate } from '@/lib/date-utils'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

interface FundraiserCardProps {
    fundraiser: Fundraiser;
    index?: number;
    onCancel?: (id: string) => void;
    isCancelling?: boolean;
    onComplete?: (id: string) => void;
    isCompleting?: boolean;
    isAdmin?: boolean;
}

export default function FundraiserCard({
    fundraiser,
    index = 0,
    onCancel,
    isCancelling,
    onComplete,
    isCompleting,
    isAdmin = false
}: FundraiserCardProps) {
    const progress = fundraiser.completion_percentage || (fundraiser.raised_amount / fundraiser.goal_amount) * 100
    const isUrgent = fundraiser.is_urgent
    const isFeatured = fundraiser.is_featured
    const isCompleted = fundraiser.status === 'completed'
    const isCancelled = fundraiser.status === 'cancelled'

    // Image carousel logic
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [fetchedImages, setFetchedImages] = useState<string[]>([])

    useEffect(() => {
        // Fetch gallery if images array is logically empty and we have an ID
        if ((!fundraiser.images || fundraiser.images.length === 0) && fundraiser.id) {
            const loadGallery = async () => {
                try {
                    const res = await fundraiserService.getFundraiserExtensions(fundraiser.id);
                    if (res.success && res.data && res.data.images && res.data.images.length > 0) {
                        setFetchedImages(res.data.images.map(img => img.image_url));
                    }
                } catch (e) {
                    console.error("Error loading gallery for card", e);
                }
            };
            loadGallery();
        }
    }, [fundraiser.id, fundraiser.images]);

    const images = (fundraiser.images && fundraiser.images.length > 0)
        ? fundraiser.images.map((img: any) => img.image_url)
        : (fetchedImages.length > 0 ? fetchedImages : [fundraiser.cover_image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80'])

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 3000); // Scroll every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareData = {
            title: fundraiser.title,
            text: fundraiser.short_description || `Help us support ${fundraiser.title}`,
            url: window.location.origin + `/fundraisers/${fundraiser.id}`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="group relative"
        >
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/15">

                {/* Image Section with Smart Overlays */}
                <div className="relative h-60 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={images[currentImageIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt={fundraiser.title}
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Status Badges - Top Left */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isUrgent && (
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/30 animate-pulse">
                                <Clock className="w-3.5 h-3.5" /> Urgent
                            </div>
                        )}
                        {isFeatured && (
                            <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Featured
                            </div>
                        )}
                    </div>

                    {/* Right Side Status Badges */}
                    <div className="absolute top-4 right-4">
                        {isCompleted && (
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Done
                            </div>
                        )}
                        {isCancelled && (
                            <div className="bg-navy-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <Ban className="w-2.5 h-2.5 text-red-500" /> Cancelled
                            </div>
                        )}
                    </div>

                    {/* Interactive Hover Actions */}
                    <div className="absolute bottom-4 right-4 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 bg-white text-navy-900 rounded-full flex items-center justify-center shadow-xl hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 bg-white text-primary-500 rounded-full flex items-center justify-center shadow-xl hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Admin Floating Controls */}
                    {isAdmin && (
                        <div className="absolute bottom-4 left-4 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 delay-75 ease-out">
                            <Link
                                href={`/fundraisers/${fundraiser.id}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 bg-navy-900 text-white rounded-lg flex items-center justify-center shadow-xl hover:bg-navy-800 transition-all border border-navy-700/50"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </Link>
                            {!isCancelled && !isCompleted && fundraiser.raised_amount >= fundraiser.goal_amount && onComplete && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onComplete(fundraiser.id); }}
                                    disabled={isCompleting}
                                    title="Mark as Completed"
                                    className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-xl hover:bg-green-700 transition-all border border-green-500/50"
                                >
                                    {isCompleting ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}
                            {!isCancelled && onCancel && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onCancel(fundraiser.id); }}
                                    disabled={isCancelling}
                                    className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-xl hover:bg-red-700 transition-all border border-red-500/50"
                                >
                                    {isCancelling ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Ban className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Image Indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                </div>

                {/* Dynamic Content Section */}
                <div className="p-6 flex flex-col flex-1 relative">

                    {/* Top Info Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-primary-100">
                                {fundraiser.category?.name || 'General'}
                            </span>
                            {fundraiser.is_zakat_eligible && (
                                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-green-100">
                                    Zakat
                                </span>
                            )}
                            {fundraiser.is_sadaqah_eligible && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-100">
                                    Sadaqah
                                </span>
                            )}
                            {fundraiser.is_lillah_eligible && (
                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-purple-100">
                                    Lillah
                                </span>
                            )}
                            {fundraiser.is_interest_eligible && (
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-red-100">
                                    Interest
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0 whitespace-nowrap">
                            <Users className="w-3 h-3 text-primary-500" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">{fundraiser.donor_count || 0}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 leading-[1.3] tracking-tight min-h-[48px]">
                        {fundraiser.title}
                    </h3>

                    {/* Progress Visualization */}
                    <div className="mt-auto space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Raised</span>
                                    <span className="text-navy-900 font-extrabold text-lg">₹{Number(fundraiser.raised_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Goal</span>
                                    <span className="text-gray-600 font-bold text-sm">₹{Number(fundraiser.goal_amount || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className={`absolute top-0 left-0 h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-primary-400'
                                        }`}
                                />
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.15em] text-primary-500">
                                <span>{progress.toFixed(0)}% Funded</span>
                                {!isCompleted && <span className="text-gray-500">Targeting {formatDate(fundraiser.end_date || fundraiser.start_date)}</span>}
                            </div>
                        </div>

                        <Link
                            href={`/fundraisers/${fundraiser.id}`}
                            className={`group/btn flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${isCompleted
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-600/20'
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-xl shadow-primary-500/20 hover:shadow-primary-600/40'
                                }`}
                        >
                            {isCompleted ? 'Successfully Done' : 'Contribute Now'}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
