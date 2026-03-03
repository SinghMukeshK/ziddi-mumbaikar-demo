'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    galleryService,
    GalleryAlbum,
    GalleryAlbumMedia,
} from '@/services/gallery.service'
import {
    Images, ChevronLeft, ChevronRight, X, Loader2,
    FolderOpen, ZoomIn, Download, Search, Plus, Trash2, Edit, Upload
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import ImageEditor from '@/components/ImageEditor'

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
    items,
    index,
    onClose,
    onPrev,
    onNext,
    isAdmin,
    onDelete,
}: {
    items: GalleryAlbumMedia[]
    index: number
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    isAdmin?: boolean
    onDelete?: () => void
}) {
    const item = items[index]
    const itemMedia = item?.media || (item as any)?.Media

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onPrev()
            if (e.key === 'ArrowRight') onNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, onPrev, onNext])

    if (!itemMedia) return null

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
                            src={itemMedia.file_url}
                            alt={itemMedia.alt_text || itemMedia.file_name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                    </div>
                    {(item.caption || itemMedia.caption || itemMedia.alt_text) && (
                        <p className="text-white/70 text-sm text-center mt-4 px-4">
                            {item.caption || itemMedia.caption || itemMedia.alt_text}
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
                    href={itemMedia.file_url}
                    download={itemMedia.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                    <Download className="w-4 h-4" /> Download
                </a>

                {/* Delete (Admin Only) */}
                {isAdmin && onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete() }}
                        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-500/20"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Photo
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

// ── Album Modal (Create/Edit) ──────────────────────────────────────────────────

function AlbumModal({
    isOpen,
    onClose,
    onUpdate,
    album,
}: {
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
    album?: GalleryAlbum // If present, we're editing
}) {
    const [title, setTitle] = useState(album?.title || '')
    const [description, setDescription] = useState(album?.description || '')
    const [isPublished, setIsPublished] = useState(album ? album.is_published : true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen && album) {
            setTitle(album.title)
            setDescription(album.description || '')
            setIsPublished(album.is_published)
        } else if (isOpen && !album) {
            setTitle('')
            setDescription('')
            setIsPublished(true)
        }
    }, [isOpen, album])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)
        try {
            if (album) {
                await galleryService.updateAlbum(album.id, { title, description, is_published: isPublished })
                toast.success('Album updated successfully')
            } else {
                await galleryService.createAlbum({ title, description, is_published: isPublished })
                toast.success('Album created successfully')
            }
            onUpdate()
            onClose()
        } catch (err: any) {
            console.error('Failed to save album', err)
            toast.error(err.message || 'Failed to save album')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-navy-900 tracking-tight">
                                {album ? 'Edit Album' : 'Create New Album'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Album Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent focus:border-primary-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-navy-900"
                                    placeholder="e.g., Cleanliness Drive 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 border border-transparent focus:border-primary-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-navy-900"
                                    placeholder="Brief details about this album..."
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={isPublished}
                                    onChange={e => setIsPublished(e.target.checked)}
                                    className="w-5 h-5 rounded accent-primary-500"
                                />
                                <label htmlFor="is_published" className="text-xs font-bold text-navy-900 cursor-pointer">
                                    Publish album immediately (visible to public)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-navy-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-500 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : album ? 'Update Album' : 'Create Album'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

// ── Album Detail View ─────────────────────────────────────────────────────────

function AlbumView({
    album,
    onBack,
    isAdmin,
    onAlbumUpdate,
}: {
    album: GalleryAlbum
    onBack: () => void
    isAdmin: boolean
    onAlbumUpdate: () => void
}) {
    const [media, setMedia] = useState<GalleryAlbumMedia[]>([])
    const [loading, setLoading] = useState(true)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [fileToEdit, setFileToEdit] = useState<File | null>(null)

    const fetchMedia = useCallback(() => {
        setLoading(true)
        galleryService.getAlbumMedia(album.id)
            .then(res => setMedia(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [album.id])

    useEffect(() => {
        fetchMedia()
    }, [fetchMedia])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                await galleryService.uploadAndAddToAlbum(album.id, files[i])
            }
            toast.success('Photos uploaded successfully')
            fetchMedia()
            onAlbumUpdate() // Refresh media count in the list
        } catch (err) {
            console.error('Failed to upload some photos', err)
            toast.error('Failed to upload some photos')
        } finally {
            setIsUploading(false)
        }
        e.target.value = ''
    }

    const handleUploadWithEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFileToEdit(file)
        e.target.value = ''
    }

    const handleEditorSave = async (editedFile: File) => {
        setFileToEdit(null)
        setIsUploading(true)
        try {
            await galleryService.uploadAndAddToAlbum(album.id, editedFile)
            toast.success('Photo uploaded successfully')
            fetchMedia()
            onAlbumUpdate()
        } catch (err) {
            console.error('Failed to upload photo', err)
            toast.error('Failed to upload photo')
        } finally {
            setIsUploading(false)
        }
    }

    const handleEditorCancel = () => {
        setFileToEdit(null)
    }

    const handleDeleteMedia = async (mediaId: string) => {
        if (!window.confirm('Remove this photo from the album?')) return
        try {
            await galleryService.removeMediaFromAlbum(album.id, mediaId)
            toast.success('Photo removed')
            fetchMedia()
            onAlbumUpdate() // Refresh media count in the list
            if (lightboxIndex !== null) setLightboxIndex(null)
        } catch (err) {
            console.error('Failed to remove photo', err)
            toast.error('Failed to remove photo')
        }
    }

    const handleSetCover = async (mediaId: string, mediaUrl: string) => {
        try {
            await galleryService.updateAlbum(album.id, {
                cover_image_id: mediaId,
                cover_image_url: mediaUrl
            })
            toast.success('Cover image updated')
            onAlbumUpdate()
        } catch (err) {
            toast.error('Failed to update cover image')
        }
    }

    const handleDeleteAlbum = async () => {
        if (!window.confirm('Are you sure you want to delete this entire album? This cannot be undone.')) return
        setIsDeleting(true)
        try {
            await galleryService.deleteAlbum(album.id)
            toast.success('Album deleted')
            onBack()
            onAlbumUpdate()
        } catch (err) {
            console.error('Failed to delete album', err)
            toast.error('Failed to delete album')
        } finally {
            setIsDeleting(false)
        }
    }

    const imageItems = media.filter(m => {
        const itemMedia = m.media || (m as any).Media;
        if (!itemMedia) return false;
        // If file_type or mime_type says image, or if it just has a file_url and we want to be permissive
        return (
            itemMedia.file_type?.startsWith('image') ||
            itemMedia.mime_type?.startsWith('image') ||
            (itemMedia.file_url && !itemMedia.file_type) // fallback for legacy or missing metadata
        );
    });

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-navy-900 font-bold text-[10px] uppercase tracking-widest transition-colors mb-4"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Gallery
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">{album.title}</h1>
                    {album.description && (
                        <p className="text-gray-500 mt-2 max-w-2xl text-sm leading-relaxed">{album.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                            {imageItems.length} photo{imageItems.length !== 1 ? 's' : ''}
                        </span>
                        {!album.is_published && (
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                Draft
                            </span>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                            {isUploading && fileToEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : (isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />)}
                            {isUploading ? 'Uploading...' : 'Add & Edit'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleUploadWithEdit} disabled={isUploading || !!fileToEdit} />
                        </label>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-navy-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                        >
                            <Edit className="w-4 h-4" /> Edit Album
                        </button>
                        <button
                            onClick={handleDeleteAlbum}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Album Modal */}
            <AlbumModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUpdate={() => {
                    onAlbumUpdate()
                    onBack()
                }}
                album={album}
            />

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
                    {imageItems.map((item, idx) => {
                        const itemMedia = item.media || (item as any).Media;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                whileHover={{ y: -4 }}
                                className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                <Image
                                    src={itemMedia?.file_url || '/placeholder.jpg'}
                                    alt={itemMedia?.alt_text || itemMedia?.file_name || 'Gallery Image'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    onClick={() => setLightboxIndex(idx)}
                                />

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                                    <div className="flex justify-end pointer-events-auto">
                                        {isAdmin && (
                                            <div className="flex gap-2 pointer-events-auto">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetCover(item.media_id, itemMedia?.file_url || '') }}
                                                    title="Set as Album Cover"
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${album.cover_image_id === item.media_id ? 'bg-primary-500 text-white' : 'bg-white/90 text-navy-900 hover:bg-white'}`}
                                                >
                                                    <Images className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id) }}
                                                    title="Remove Photo"
                                                    className="w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-center flex-grow items-center">
                                        <ZoomIn className="w-8 h-8 text-white opacity-80 cursor-pointer pointer-events-auto" onClick={() => setLightboxIndex(idx)} />
                                    </div>
                                    {(item.caption || itemMedia?.caption) && (
                                        <p className="text-white text-[10px] font-bold line-clamp-2 text-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                                            {item.caption || itemMedia?.caption}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
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
                    isAdmin={isAdmin}
                    onDelete={() => handleDeleteMedia(imageItems[lightboxIndex!].id)}
                />
            )}

            {/* Image Editor Modal */}
            {fileToEdit && (
                <ImageEditor
                    file={fileToEdit}
                    onSave={handleEditorSave}
                    onCancel={handleEditorCancel}
                    aspectRatio={undefined}
                />
            )}

        </div>
    )
}

// ── Main Gallery Page ─────────────────────────────────────────────────────────

export default function GalleryPage() {
    const { user } = useAuth()
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    const [albums, setAlbums] = useState<GalleryAlbum[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
    const [search, setSearch] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    const fetchAlbums = useCallback(() => {
        setLoading(true)
        // If admin, show all (including drafts), else only published
        galleryService.getAlbums(isAdmin ? { limit: 100 } : { is_published: true, limit: 100 })
            .then(res => setAlbums(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [isAdmin])

    useEffect(() => {
        fetchAlbums()
    }, [fetchAlbums])

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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" /> Create Album
                                </button>
                            )}
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
            </div>

            {/* Create Album Modal */}
            <AlbumModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUpdate={fetchAlbums}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">

                {selectedAlbum ? (
                    <AlbumView
                        album={selectedAlbum}
                        onBack={() => setSelectedAlbum(null)}
                        isAdmin={isAdmin}
                        onAlbumUpdate={fetchAlbums}
                    />
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
                                        {isAdmin && !album.is_published && (
                                            <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                Draft
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
