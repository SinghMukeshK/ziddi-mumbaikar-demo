'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import { eventService, Event } from '@/services/event.service'
import { galleryService } from '@/services/gallery.service'
import {
    Calendar, Plus, Trash2, Edit, Search,
    MapPin, Clock, Tag, Image as ImageIcon,
    X, Check, AlertCircle, Loader2, Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ImageEditor from '@/components/ImageEditor'

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
    { value: 'Education', label: 'Education', bg: 'bg-blue-50', text: 'text-blue-700' },
    { value: 'Environment', label: 'Environment', bg: 'bg-green-50', text: 'text-green-700' },
    { value: 'Health', label: 'Health', bg: 'bg-red-50', text: 'text-red-700' },
    { value: 'Empowerment', label: 'Empowerment', bg: 'bg-purple-50', text: 'text-purple-700' },
    { value: 'General', label: 'General', bg: 'bg-gray-100', text: 'text-gray-600' },
]

const STATUS_OPTIONS = [
    { value: 'published', label: 'Published', bg: 'bg-primary-50', text: 'text-primary-700' },
    { value: 'draft', label: 'Draft', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    { value: 'archived', label: 'Archived', bg: 'bg-red-50', text: 'text-red-700' },
]

// ─── Event Form Modal ────────────────────────────────────────────────────────

function EventModal({
    isOpen,
    onClose,
    onSave,
    event = null
}: {
    isOpen: boolean,
    onClose: () => void,
    onSave: () => void,
    event?: Event | null
}) {
    const [formData, setFormData] = useState<Partial<Event>>({
        title: '',
        description: '',
        location: 'Mumbai, Maharashtra',
        event_type: 'General',
        status: 'published',
        start_datetime: '',
        end_datetime: '',
        cover_image_url: ''
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [fileToEdit, setFileToEdit] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    useEffect(() => {
        if (event) {
            setFormData({
                ...event,
                start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : ''
            })
            setImagePreview(event.cover_image_url || '')
        } else {
            setFormData({
                title: '',
                description: '',
                location: 'Mumbai, Maharashtra',
                event_type: 'General',
                status: 'published',
                start_datetime: '',
                end_datetime: '',
                cover_image_url: ''
            })
            setImagePreview('')
            setImageFile(null)
        }
        setFormError('')
    }, [event, isOpen])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileToEdit(file)
            e.target.value = '' // Clear input so same file can be selected again
        }
    }

    const handleImageEditComplete = async (editedBlob: Blob) => {
        const file = new File([editedBlob], fileToEdit?.name || 'event-cover.jpg', { type: 'image/jpeg' })
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setFileToEdit(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.start_datetime) {
            setFormError('Title and Start Date are required')
            toast.error('Validation failed')
            return
        }

        setIsSubmitting(true)
        setFormError('')
        try {
            let cover_image_url = formData.cover_image_url

            // Upload image if changed
            if (imageFile) {
                const uploadRes = await galleryService.uploadMedia(imageFile, 'events', 'events')
                // Support both wrapped {success, data: {file_url}} and flat {file_url} responses
                const uploadedUrl = uploadRes.data?.file_url || (uploadRes as any).file_url || uploadRes.data?.url || (uploadRes as any).url

                if (uploadedUrl) {
                    cover_image_url = uploadedUrl
                } else if (uploadRes.success === false) {
                    throw new Error(uploadRes.message || 'Image upload failed')
                } else {
                    console.error('Image upload response unexpected:', uploadRes)
                    // Fallback: check if we have a string that looks like a URL
                    if (typeof uploadRes === 'string' && uploadRes.startsWith('http')) {
                        cover_image_url = uploadRes
                    }
                }
            }

            // Build payload explicitly - mapping title to name as backend often expects name
            const dataToSave: any = {
                name: formData.title,
                title: formData.title,
                description: formData.description,
                location: formData.location || 'Mumbai, Maharashtra',
                event_type: formData.event_type || 'General',
                status: formData.status || 'published',
                cover_image_url: cover_image_url || null,
                start_datetime: formData.start_datetime ? new Date(formData.start_datetime).toISOString() : new Date().toISOString(),
                end_datetime: formData.end_datetime ? new Date(formData.end_datetime).toISOString() : undefined
            }

            // Generate slug for new events if not provided
            if (!event || !event.slug) {
                const baseSlug = formData.title?.toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                dataToSave.slug = baseSlug || `event-${Date.now()}`;
            }

            let result;
            if (event) {
                result = await eventService.updateEvent(event.id, dataToSave)
                if (result.success) toast.success('Event updated successfully')
            } else {
                result = await eventService.createEvent(dataToSave)
                if (result.success) toast.success('Event created successfully')
            }

            if (result && !result.success) {
                throw new Error((result as any).message || 'Failed to save event data')
            }

            onSave()
            onClose()
        } catch (err: any) {
            console.error('Failed to save event', err)

            // Extract specific validation errors if available
            let msg = err.message || 'Failed to save event'
            if (err.data && typeof err.data === 'object') {
                const details = Object.entries(err.data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(' | ')
                if (details) msg = `${msg} (${details})`
            }

            setFormError(msg)
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-navy-900">{event ? 'Edit Event' : 'Create New Event'}</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {formError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 flex items-center gap-3 p-4 rounded-2xl text-red-600 mb-2"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-xs font-bold">{formError}</span>
                            </motion.div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Event Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Annual Charity Drive 2024"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell us about the event..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Dates */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.start_datetime}
                                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_datetime}
                                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Oshiwara, Mumbai"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium"
                                />
                            </div>

                            {/* Type & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Event Type</label>
                                    <select
                                        value={formData.event_type}
                                        onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium bg-white"
                                    >
                                        {EVENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 font-medium bg-white"
                                    >
                                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
                            <div className="flex items-start gap-4">
                                <div className="relative group w-32 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        title="Upload Image"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                        <Edit className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 leading-relaxed italic">
                                        Choose a high-quality cover photo. 16:9 ratio recommended. (Limit 5MB)
                                    </p>
                                    {imageFile && <p className="text-[10px] font-bold text-primary-600 mt-1 uppercase tracking-widest">New Image Selected: {imageFile.name}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 px-4 border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 px-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {event ? 'Update Event' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Editor Modal - Rendered outside the modal to prevent stacking context clipping */}
            {fileToEdit && (
                <ImageEditor
                    file={fileToEdit}
                    onSave={handleImageEditComplete}
                    onCancel={() => setFileToEdit(null)}
                    aspectRatio={16 / 9}
                />
            )}
        </>
    )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function AdminEventsPage() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin') router.push('/')
    }, [isLoggedIn, user, router])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const res = await eventService.getEvents({ limit: 100 })
            setEvents(res.data || [])
        } catch (err) {
            toast.error('Failed to load events')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') return
        fetchEvents()
    }, [isLoggedIn, user])

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        const tid = toast.loading('Deleting event...')
        try {
            const res = await eventService.deleteEvent(id)
            if (res.success) {
                toast.success('Event deleted successfully', { id: tid })
                fetchEvents()
            } else {
                toast.error((res as any).message || 'Failed to delete event', { id: tid })
            }
        } catch (err: any) {
            console.error('Failed to delete event', err)
            toast.error(err.message || 'Failed to delete event', { id: tid })
        }
    }

    const filtered = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.location.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || e.event_type === typeFilter
        return matchesSearch && matchesType
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/profile" className="hover:text-primary-500 transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Events Management</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-navy-900">Events Management</h1>
                        <p className="text-gray-500 text-sm mt-1">{events.length} total events in platform</p>
                    </div>
                    <button
                        onClick={() => { setEditingEvent(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10"
                    >
                        <Plus className="w-4 h-4" /> Create New Event
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by event title or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 bg-white shadow-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-6 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-500 bg-white shadow-sm font-bold text-xs uppercase tracking-widest"
                        >
                            <option value="all">All Types</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                        <p className="font-bold text-xs uppercase tracking-[0.2em]">Loading Events...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                        <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-1">No Events Found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((event) => {
                            const typeCfg = EVENT_TYPE_OPTIONS.find(o => o.value === event.event_type) || EVENT_TYPE_OPTIONS[EVENT_TYPE_OPTIONS.length - 1]

                            // Derive status from dates
                            const now = new Date()
                            const start = new Date(event.start_datetime)
                            const end = event.end_datetime ? new Date(event.end_datetime) : start

                            let statusLabel = 'Upcoming'
                            let statusColor = 'bg-blue-500'

                            if ((start <= now && end >= now) || (start.toDateString() === now.toDateString())) {
                                statusLabel = 'Ongoing'
                                statusColor = 'bg-green-500'
                            } else if (end < now) {
                                statusLabel = 'Completed'
                                statusColor = 'bg-gray-500'
                            }

                            const date = start.toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })

                            return (
                                <motion.div
                                    layout
                                    key={event.id}
                                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                                >
                                    {/* Cover Image */}
                                    <div className="relative h-44 bg-gray-100">
                                        {event.cover_image_url ? (
                                            <Image src={event.cover_image_url} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typeCfg.bg} ${typeCfg.text} border border-white/50 backdrop-blur-sm shadow-sm`}>
                                                {typeCfg.label}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${statusColor} border border-white/20 backdrop-blur-sm shadow-sm w-fit`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {date}
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3" /> {event.location}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-navy-900 mb-2 line-clamp-1">{event.title}</h3>
                                        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
                                            {event.description || 'No description provided.'}
                                        </p>

                                        {/* Row actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${event.status === 'published' ? 'bg-primary-500' : 'bg-yellow-400'}`}></span>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{event.status}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEditingEvent(event); setModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Edit Event"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id, event.title)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            <EventModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingEvent(null); }}
                onSave={() => fetchEvents()}
                event={editingEvent}
            />

            <Footer />
        </div>
    )
}

export default function AdminEvents() {
    return (
        <ProtectedRoute>
            <AdminEventsPage />
        </ProtectedRoute>
    )
}
