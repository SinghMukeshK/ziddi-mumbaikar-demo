'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    fundraiserService,
    Fundraiser,
    FundraiserCategory,
    FundraiserImage,
    FundraiserDocument,
} from '@/services/fundraiser.service'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import Image from 'next/image'
import ImageEditor from '@/components/ImageEditor'
import {
    ArrowLeft, Save, AlertCircle, Loader2, Upload, Trash2,
    ImageIcon, FileText, Settings, Star, AlertTriangle, Sparkles,
    ShieldCheck, Plus, X, CheckCircle2, Pencil
} from 'lucide-react'

type Tab = 'content' | 'images' | 'documents'

export default function EditFundraiserPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isLoggedIn } = useAuth()

    const [activeTab, setActiveTab] = useState<Tab>('content')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [categories, setCategories] = useState<FundraiserCategory[]>([])
    const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null)

    // Extensions
    const [existingImages, setExistingImages] = useState<FundraiserImage[]>([])
    const [existingDocuments, setExistingDocuments] = useState<FundraiserDocument[]>([])

    // New uploads
    const [newImages, setNewImages] = useState<File[]>([])
    const [newDocuments, setNewDocuments] = useState<File[]>([])
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadingDocs, setUploadingDocs] = useState(false)
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

    const imageInputRef = useRef<HTMLInputElement>(null)
    const docInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        description: '',
        goal_amount: '',
        category_id: '',
        is_urgent: false,
        is_featured: false,
        status: '',
        is_zakat_eligible: false,
        is_sadaqah_eligible: false,
        is_lillah_eligible: false,
        is_interest_eligible: false,
    })

    // Redirect non-admins
    useEffect(() => {
        if (!loading && isLoggedIn && user && user.role !== 'admin' && user.role !== 'super_admin') {
            router.push('/')
        }
    }, [loading, isLoggedIn, user, router])

    useEffect(() => {
        const fetchData = async () => {
            if (!params?.id) return
            try {
                setLoading(true)
                const [fundRes, catRes, extRes] = await Promise.all([
                    fundraiserService.getFundraiserById(params.id as string),
                    fundraiserService.getCategories(),
                    fundraiserService.getFundraiserExtensions(params.id as string),
                ])

                if (fundRes.data) {
                    const f = fundRes.data
                    setFundraiser(f)
                    setFormData({
                        title: f.title,
                        short_description: f.short_description,
                        description: f.description,
                        goal_amount: f.goal_amount.toString(),
                        category_id: f.category.id,
                        is_urgent: f.is_urgent,
                        is_featured: f.is_featured,
                        status: f.status,
                        is_zakat_eligible: f.is_zakat_eligible,
                        is_sadaqah_eligible: f.is_sadaqah_eligible,
                        is_lillah_eligible: f.is_lillah_eligible,
                        is_interest_eligible: f.is_interest_eligible,
                    })
                }
                if (catRes.data) setCategories(catRes.data)
                if (extRes.data) {
                    setExistingImages(extRes.data.images || [])
                    setExistingDocuments(extRes.data.documents || [])
                }
            } catch (err: any) {
                setError('Failed to load fundraiser details.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params])

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const target = e.target as HTMLInputElement
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? target.checked : value }))
    }

    const handleContentSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fundraiser) return
        setSubmitting(true)
        setError('')
        try {
            await fundraiserService.updateFundraiser(fundraiser.id, {
                title: formData.title,
                short_description: formData.short_description,
                description: formData.description,
                goal_amount: parseFloat(formData.goal_amount),
                category_id: formData.category_id,
                is_urgent: formData.is_urgent,
                is_featured: formData.is_featured,
                status: formData.status as any,
                is_zakat_eligible: formData.is_zakat_eligible,
                is_sadaqah_eligible: formData.is_sadaqah_eligible,
                is_lillah_eligible: formData.is_lillah_eligible,
                is_interest_eligible: formData.is_interest_eligible,
            })
            showSuccess('Fundraiser content updated successfully!')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update fundraiser.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Images ──────────────────────────────────────────────────────────────

    const handleImageFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        setNewImages(prev => [...prev, ...files].slice(0, 10))
        e.target.value = ''
    }

    const handleImageEdited = (editedFile: File) => {
        if (editingImageIndex === null) return
        setNewImages(prev => prev.map((f, i) => i === editingImageIndex ? editedFile : f))
        setEditingImageIndex(null)
    }

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleUploadImages = async () => {
        if (!fundraiser || newImages.length === 0) return
        setUploadingImages(true)
        setError('')
        let uploaded = 0
        const updatedExisting = [...existingImages]

        for (let i = 0; i < newImages.length; i++) {
            try {
                const uploadRes = await fundraiserService.uploadMedia(newImages[i], 'fundraisers', fundraiser.id)
                if (uploadRes.success && uploadRes.data?.url) {
                    const url = uploadRes.data.url
                    const isFirst = existingImages.length === 0 && i === 0

                    // If no cover image yet, set this as cover
                    if (isFirst) {
                        await fundraiserService.updateFundraiser(fundraiser.id, { cover_image_url: url })
                    }

                    const imgRes = await fundraiserService.addFundraiserImages(fundraiser.id, {
                        image_url: url,
                        alt_text: `Image ${existingImages.length + i + 1}`,
                        display_order: existingImages.length + i,
                    })
                    if (imgRes.data) updatedExisting.push(imgRes.data)
                    uploaded++
                }
            } catch (e) {
                console.error('Image upload failed:', e)
            }
        }

        // Refresh extensions
        try {
            const extRes = await fundraiserService.getFundraiserExtensions(fundraiser.id)
            if (extRes.data) setExistingImages(extRes.data.images || [])
        } catch { }

        setNewImages([])
        setUploadingImages(false)
        showSuccess(`${uploaded} image(s) uploaded successfully!`)
    }

    const handleDeleteImage = async (img: FundraiserImage) => {
        if (!fundraiser) return
        setDeletingImageId(img.id)
        try {
            await fundraiserService.deleteFundraiserImage(fundraiser.id, img.id)
            setExistingImages(prev => prev.filter(i => i.id !== img.id))
            showSuccess('Image removed.')
        } catch (e) {
            setError('Failed to delete image.')
        } finally {
            setDeletingImageId(null)
        }
    }

    // ── Documents ────────────────────────────────────────────────────────────

    const handleDocFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        setNewDocuments(prev => [...prev, ...files].slice(0, 10))
        e.target.value = ''
    }

    const handleUploadDocuments = async () => {
        if (!fundraiser || newDocuments.length === 0) return
        setUploadingDocs(true)
        setError('')
        let uploaded = 0

        for (const doc of newDocuments) {
            try {
                const uploadRes = await fundraiserService.uploadMedia(doc, 'fundraisers', fundraiser.id)
                if (uploadRes.success && uploadRes.data?.url) {
                    await fundraiserService.addFundraiserDocuments(fundraiser.id, {
                        document_type: 'evidence',
                        file_url: uploadRes.data.url,
                        file_name: doc.name,
                    })
                    uploaded++
                }
            } catch (e) {
                console.error('Doc upload failed:', e)
            }
        }

        try {
            const extRes = await fundraiserService.getFundraiserExtensions(fundraiser.id)
            if (extRes.data) setExistingDocuments(extRes.data.documents || [])
        } catch { }

        setNewDocuments([])
        setUploadingDocs(false)
        showSuccess(`${uploaded} document(s) uploaded successfully!`)
    }

    const handleDeleteDocument = async (doc: FundraiserDocument) => {
        if (!fundraiser) return
        setDeletingDocId(doc.id)
        try {
            await fundraiserService.deleteFundraiserDocument(fundraiser.id, doc.id)
            setExistingDocuments(prev => prev.filter(d => d.id !== doc.id))
            showSuccess('Document removed.')
        } catch (e) {
            setError('Failed to delete document.')
        } finally {
            setDeletingDocId(null)
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        )
    }

    if (!fundraiser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-navy-900 mb-2">Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'Fundraiser not found.'}</p>
                    <Link href="/fundraisers" className="inline-flex items-center gap-2 text-primary-500 font-bold hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Fundraisers
                    </Link>
                </div>
            </div>
        )
    }

    const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
        { id: 'content', label: 'Content', icon: Settings },
        { id: 'images', label: 'Images', icon: ImageIcon, count: existingImages.length },
        { id: 'documents', label: 'Documents', icon: FileText, count: existingDocuments.length },
    ]

    const toggleBtn = (
        field: 'is_urgent' | 'is_featured' | 'is_zakat_eligible' | 'is_sadaqah_eligible' | 'is_lillah_eligible' | 'is_interest_eligible',
        label: string,
        color: string,
        Icon: React.ElementType
    ) => {
        const active = formData[field] as boolean
        const colors: Record<string, string> = {
            red: active ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300',
            amber: active ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300',
            green: active ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
            blue: active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
            purple: active ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
        }
        const iconColors: Record<string, string> = {
            red: active ? 'bg-red-500' : 'bg-gray-100',
            amber: active ? 'bg-amber-500' : 'bg-gray-100',
            green: active ? 'bg-green-500' : 'bg-gray-100',
            blue: active ? 'bg-blue-500' : 'bg-gray-100',
            purple: active ? 'bg-purple-500' : 'bg-gray-100',
        }
        const pillColors: Record<string, string> = {
            red: active ? 'bg-red-500' : 'bg-gray-200',
            amber: active ? 'bg-amber-500' : 'bg-gray-200',
            green: active ? 'bg-green-500' : 'bg-gray-200',
            blue: active ? 'bg-blue-500' : 'bg-gray-200',
            purple: active ? 'bg-purple-500' : 'bg-gray-200',
        }
        return (
            <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [field]: !prev[field] }))}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all w-full ${colors[color]}`}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[color]}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className="flex-1 font-black text-sm uppercase tracking-widest text-gray-700">{label}</span>
                <div className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${pillColors[color]}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
            </button>
        )
    }

    return (
        <ProtectedRoute>
            {/* ImageEditor modal */}
            {editingImageIndex !== null && newImages[editingImageIndex] && (
                <ImageEditor
                    file={newImages[editingImageIndex]}
                    onSave={handleImageEdited}
                    onCancel={() => setEditingImageIndex(null)}
                    aspectRatio={16 / 9}
                />
            )}

            <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link
                                href={`/fundraisers/${fundraiser.id}`}
                                className="text-gray-500 hover:text-navy-900 flex items-center gap-2 mb-3 font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Case
                            </Link>
                            <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                                Edit <span className="text-primary-500">Fundraiser</span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{fundraiser.title}</p>
                        </div>
                        <div className="hidden sm:block px-4 py-2 bg-navy-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            Admin Mode
                        </div>
                    </div>

                    {/* Toast messages */}
                    {successMsg && (
                        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            {successMsg}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl font-bold text-sm">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            {error}
                            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-6 shadow-sm">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-navy-900 text-white shadow-md'
                                    : 'text-gray-400 hover:text-navy-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: Content ─────────────────────────────────────────────── */}
                    {activeTab === 'content' && (
                        <form onSubmit={handleContentSave}>
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 space-y-8">

                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Case Title</label>
                                    <input
                                        type="text" name="title" value={formData.title} onChange={handleChange} required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900"
                                    />
                                </div>

                                {/* Category & Goal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                        <select
                                            name="category_id" value={formData.category_id} onChange={handleChange} required
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900 appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Goal Amount (₹)</label>
                                        <input
                                            type="number" name="goal_amount" value={formData.goal_amount} onChange={handleChange} required
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                    <select
                                        name="status" value={formData.status} onChange={handleChange} required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900 appearance-none"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pending_review">Pending Review</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Short Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Short Description (Listing Preview)</label>
                                    <textarea
                                        name="short_description" value={formData.short_description} onChange={handleChange} rows={2} required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900"
                                    />
                                </div>

                                {/* Full Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Story & Impact</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleChange} rows={10} required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900"
                                    />
                                </div>

                                {/* Flags */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Flags & Eligibility</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {toggleBtn('is_urgent', 'Urgent Case', 'red', AlertTriangle)}
                                        {toggleBtn('is_featured', 'Featured', 'amber', Sparkles)}
                                        {toggleBtn('is_zakat_eligible', 'Zakat Eligible', 'green', ShieldCheck)}
                                        {toggleBtn('is_sadaqah_eligible', 'Sadaqah', 'blue', ShieldCheck)}
                                        {toggleBtn('is_lillah_eligible', 'Lillah', 'purple', ShieldCheck)}
                                        {toggleBtn('is_interest_eligible', 'Interest', 'red', ShieldCheck)}
                                    </div>
                                </div>

                                {/* Save button */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex items-center gap-3 px-10 py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {submitting ? 'Saving…' : 'Save Content'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ── TAB: Images ──────────────────────────────────────────────── */}
                    {activeTab === 'images' && (
                        <div className="space-y-6">

                            {/* Existing images */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Current Images ({existingImages.length})</h2>
                                {existingImages.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">No images uploaded yet.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {existingImages.map((img, idx) => (
                                            <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                                                <Image src={img.image_url} alt={img.alt_text || `Image ${idx + 1}`} fill className="object-cover" />
                                                {idx === 0 && (
                                                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow">
                                                        <Star className="w-2.5 h-2.5 fill-white" /> Cover
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleDeleteImage(img)}
                                                        disabled={deletingImageId === img.id}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow disabled:opacity-50"
                                                    >
                                                        {deletingImageId === img.id
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <Trash2 className="w-3 h-3" />}
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upload new images */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Upload New Images</h2>

                                {/* Drop zone */}
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-2xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group mb-5"
                                >
                                    <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageFilePick} className="hidden" />
                                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                                        <ImageIcon className="w-7 h-7 text-primary-500" />
                                    </div>
                                    <p className="font-bold text-navy-900 text-sm">Click to select images</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB · Opens in editor</p>
                                </div>

                                {/* New image previews */}
                                {newImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                                        {newImages.map((file, idx) => (
                                            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setEditingImageIndex(idx)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-navy-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
                                                    >
                                                        <Pencil className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => removeNewImage(idx)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                                                    >
                                                        <X className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleUploadImages}
                                        disabled={newImages.length === 0 || uploadingImages}
                                        className="flex items-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-40"
                                    >
                                        {uploadingImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                        {uploadingImages ? 'Uploading…' : `Upload ${newImages.length > 0 ? newImages.length : ''} Image${newImages.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: Documents ───────────────────────────────────────────── */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">

                            {/* Existing documents */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Current Documents ({existingDocuments.length})</h2>
                                {existingDocuments.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">No documents uploaded yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {existingDocuments.map(doc => (
                                            <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-primary-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-navy-900 text-sm truncate">{doc.file_name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{doc.document_type}</p>
                                                </div>
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
                                                >
                                                    View
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc)}
                                                    disabled={deletingDocId === doc.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {deletingDocId === doc.id
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <Trash2 className="w-3 h-3" />}
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upload new documents */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Upload New Documents</h2>

                                <div
                                    onClick={() => docInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer group mb-5"
                                >
                                    <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple onChange={handleDocFilePick} className="hidden" />
                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                                        <FileText className="w-7 h-7 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <p className="font-bold text-navy-900 text-sm">Click to select documents</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, Images up to 10MB each</p>
                                </div>

                                {newDocuments.length > 0 && (
                                    <div className="space-y-2 mb-5">
                                        {newDocuments.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                                <span className="flex-1 text-sm font-bold text-navy-900 truncate">{doc.name}</span>
                                                <span className="text-[10px] text-gray-400">{(doc.size / 1024).toFixed(0)} KB</span>
                                                <button
                                                    onClick={() => setNewDocuments(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleUploadDocuments}
                                        disabled={newDocuments.length === 0 || uploadingDocs}
                                        className="flex items-center gap-3 px-8 py-4 bg-navy-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-navy-800 transition-all shadow-xl disabled:opacity-40"
                                    >
                                        {uploadingDocs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                        {uploadingDocs ? 'Uploading…' : `Upload ${newDocuments.length > 0 ? newDocuments.length : ''} Document${newDocuments.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </ProtectedRoute>
    )
}
