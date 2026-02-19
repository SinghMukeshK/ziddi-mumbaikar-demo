'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    galleryService,
    GalleryAlbum,
    GalleryAlbumMedia,
    MediaItem,
} from '@/services/gallery.service'
import {
    Images, ChevronLeft, ChevronRight, X, Loader2,
    FolderOpen, ZoomIn, Download, Search
} from 'lucide-react'

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
    items,
    index,
    onClose,
    onPrev,
    onNext,
}: {
    items: GalleryAlbumMedia[]
    index: number
    onClose: () => void
    onPrev: () => void
    onNext: () => void
}) {
    const item = items[index]
    const media = item?.media

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onPrev()
            if (e.key === 'ArrowRight') onNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, onPrev, onNext])

    if (!media) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                onClick={onClose}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Counter */}
                <div className="absolute top-5 left-5 text-white/60 text-xs font-bold uppercase tracking-widest">
                    {index + 1} / {items.length}
                </div>

                {/* Prev */}
                {items.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev() }}
                        className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Image */}
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative max-w-5xl max-h-[85vh] w-full mx-16"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                        <Image
                            src={media.file_url}
                            alt={media.alt_text || media.file_name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                    </div>
                    {(item.caption || media.caption || media.alt_text) && (
                        <p className="text-white/70 text-sm text-center mt-4 px-4">
                            {item.caption || media.caption || media.alt_text}
                        </p>
                    )}
                </motion.div>

                {/* Next */}
                {items.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext() }}
                        className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Download */}
                <a
                    href={media.file_url}
                    download={media.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                    <Download className="w-4 h-4" /> Download
                </a>
            </motion.div>
        </AnimatePresence>
    )
}

// ── Album Detail View ─────────────────────────────────────────────────────────

function AlbumView({
    album,
    onBack,
}: {
    album: GalleryAlbum
    onBack: () => void
}) {
    const [media, setMedia] = useState<GalleryAlbumMedia[]>([])
    const [loading, setLoading] = useState(true)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    useEffect(() => {
        galleryService.getAlbumMedia(album.id)
            .then(res => setMedia(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [album.id])

    const imageItems = media.filter(m => m.media?.file_type?.startsWith('image') || m.media?.mime_type?.startsWith('image'))

    return (
        <div>
            {/* Album header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-navy-900 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4" /> All Albums
                </button>
                <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">{album.title}</h1>
                {album.description && (
                    <p className="text-gray-500 mt-2 max-w-2xl">{album.description}</p>
                )}
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-3">
                    {imageItems.length} photo{imageItems.length !== 1 ? 's' : ''}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                </div>
            ) : imageItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Images className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No photos in this album yet.</p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                    {imageItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ y: -4 }}
                            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            onClick={() => setLightboxIndex(idx)}
                        >
                            <Image
                                src={item.media!.file_url}
                                alt={item.media!.alt_text || item.media!.file_name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-navy-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                            {(item.caption || item.media?.caption) && (
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-xs font-bold line-clamp-2">{item.caption || item.media?.caption}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    items={imageItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() => setLightboxIndex(i => (i! - 1 + imageItems.length) % imageItems.length)}
                    onNext={() => setLightboxIndex(i => (i! + 1) % imageItems.length)}
                />
            )}
        </div>
    )
}

// ── Main Gallery Page ─────────────────────────────────────────────────────────

export default function GalleryPage() {
    const [albums, setAlbums] = useState<GalleryAlbum[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        galleryService.getAlbums({ is_published: true, limit: 100 })
            .then(res => setAlbums(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filtered = albums.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero */}
            <div className="bg-navy-900 pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto relative">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors mb-6"
                    >
                        <ChevronLeft className="w-4 h-4" /> Home
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <p className="text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">Visual Journey</p>
                            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                                Our <span className="text-primary-400">Gallery</span>
                            </h1>
                            <p className="text-white/50 mt-3 max-w-lg">
                                Browse through albums of our community work, events, and impact across Mumbai.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 w-full sm:w-72">
                            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search albums…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent text-white placeholder-white/30 text-sm font-bold outline-none flex-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">

                {selectedAlbum ? (
                    <AlbumView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
                ) : loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <FolderOpen className="w-20 h-20 mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-black text-gray-500 mb-2">
                            {search ? 'No albums match your search' : 'No albums published yet'}
                        </h2>
                        <p className="text-sm">Check back soon for photos of our work.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                            {filtered.length} album{filtered.length !== 1 ? 's' : ''}
                        </p>
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filtered.map((album, idx) => (
                                <motion.div
                                    key={album.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => setSelectedAlbum(album)}
                                    className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
                                >
                                    {/* Cover image */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        {album.cover_image_url ? (
                                            <Image
                                                src={album.cover_image_url}
                                                alt={album.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Images className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        {album.media_count !== undefined && (
                                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                {album.media_count} photos
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <h3 className="font-black text-navy-900 text-base leading-tight group-hover:text-primary-500 transition-colors line-clamp-2">
                                            {album.title}
                                        </h3>
                                        {album.description && (
                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                                {album.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(album.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1 text-primary-500 text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                                                View <ChevronRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    )
}
