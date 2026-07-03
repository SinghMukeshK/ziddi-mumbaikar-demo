'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
    Heart, Search, Loader2, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Eye, Calendar, X, MapPin, User, Phone, Map, Briefcase, Award
} from 'lucide-react'
import { groupMarriageService, GroupMarriageCouple } from '@/services/group-marriage.service'
import { fixImageUrl } from '@/lib/image-utils'
import { fundraiserService } from '@/services/fundraiser.service'

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    applied:            { label: 'Applied',      bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500',     border: 'border-blue-100' },
    docs_verified:      { label: 'Verified',     bg: 'bg-indigo-50',   text: 'text-indigo-700',   dot: 'bg-indigo-500',   border: 'border-indigo-100' },
    approved:           { label: 'Approved',     bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  border: 'border-emerald-100' },
    cancelled:          { label: 'Cancelled',    bg: 'bg-rose-50',     text: 'text-rose-700',     dot: 'bg-rose-500',     border: 'border-rose-100' },
    participated:       { label: 'Participated', bg: 'bg-teal-50',     text: 'text-teal-700',     dot: 'bg-teal-500',     border: 'border-teal-100' },
    certificate_issued: { label: 'Certified',    bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500',    border: 'border-amber-100' },
}

function formatDate(dt?: string) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

type FilterKey = 'all' | 'applied' | 'docs_verified' | 'approved' | 'cancelled'

const FILTER_TABS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
    { key: 'all',           label: 'All Registrations', icon: FileText },
    { key: 'applied',       label: 'Applied',           icon: Clock },
    { key: 'docs_verified', label: 'Verified',          icon: AlertCircle },
    { key: 'approved',      label: 'Approved',          icon: CheckCircle2 },
    { key: 'cancelled',     label: 'Cancelled',         icon: XCircle },
]

export default function AllRegistrationsPage() {
    const [couples, setCouples] = useState<GroupMarriageCouple[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<FilterKey>('all')
    const [selectedCouple, setSelectedCouple] = useState<GroupMarriageCouple | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [uploadingTypes, setUploadingTypes] = useState<Record<string, boolean>>({})
    const [editError, setEditError] = useState<string | null>(null)

    const loadCouples = () => {
        setLoading(true)
        groupMarriageService.listAllCouples({ limit: 200 })
            .then(res => {
                if (res.data) setCouples(res.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    const startEditing = () => {
        setEditForm({ ...selectedCouple })
        setEditError(null)
        setIsEditing(true)
    }

    const cancelEditing = () => {
        setIsEditing(false)
        setEditForm(null)
        setEditError(null)
    }

    const saveChanges = async () => {
        if (!editForm.groom_first_name?.trim() || !editForm.bride_first_name?.trim()) {
            setEditError('Groom and Bride first names are required')
            return
        }
        setSaving(true)
        setEditError(null)
        try {
            const payload = {
                ...editForm,
                groom_age: editForm.groom_age ? Number(editForm.groom_age) : undefined,
                bride_age: editForm.bride_age ? Number(editForm.bride_age) : undefined,
                groom_family_income: editForm.groom_family_income ? Number(editForm.groom_family_income) : undefined,
                bride_family_income: editForm.bride_family_income ? Number(editForm.bride_family_income) : undefined,
            }
            const res = await groupMarriageService.updateCouple(selectedCouple!.event_id, selectedCouple!.id!, payload)
            if (res.success) {
                setIsEditing(false)
                setSelectedCouple(res.data)
                setEditForm(null)
                loadCouples()
            } else {
                setEditError(res.message || 'Failed to update details')
            }
        } catch (err: any) {
            setEditError(err.message || 'Something went wrong while saving')
        } finally {
            setSaving(false)
        }
    }

    const addDoc = async (file: File, docType: string) => {
        try {
            setUploadingTypes(prev => ({ ...prev, [docType]: true }))
            const res = await fundraiserService.uploadMedia(file, 'group_marriages')
            if (res.success && res.data?.url) {
                const newDocRes = await groupMarriageService.addDocument(selectedCouple!.event_id, selectedCouple!.id!, {
                    doc_type: docType,
                    url: res.data.url,
                    original_filename: file.name
                })
                if (newDocRes.success) {
                    const freshRes = await groupMarriageService.listAllCouples({ limit: 200 })
                    const freshCouple = freshRes.data?.find((c: any) => c.id === selectedCouple!.id)
                    if (freshCouple) {
                        setSelectedCouple(freshCouple)
                        setEditForm(freshCouple)
                    }
                }
            }
        } catch (err) {
            alert('Upload failed.')
        } finally {
            setUploadingTypes(prev => ({ ...prev, [docType]: false }))
        }
    }

    const removeDoc = async (docId: string) => {
        if (!confirm('Are you sure you want to remove this document?')) return
        try {
            const delRes = await groupMarriageService.deleteDocument(selectedCouple!.event_id, selectedCouple!.id!, docId)
            if (delRes.success) {
                const freshRes = await groupMarriageService.listAllCouples({ limit: 200 })
                const freshCouple = freshRes.data?.find((c: any) => c.id === selectedCouple!.id)
                if (freshCouple) {
                    setSelectedCouple(freshCouple)
                    setEditForm(freshCouple)
                }
            }
        } catch (err) {
            alert('Delete failed.')
        }
    }

    useEffect(() => {
        loadCouples()
    }, [])

    const counts = useMemo(() => ({
        all:           couples.length,
        applied:       couples.filter(c => c.status === 'applied').length,
        docs_verified: couples.filter(c => c.status === 'docs_verified').length,
        approved:      couples.filter(c => c.status === 'approved').length,
        cancelled:     couples.filter(c => c.status === 'cancelled').length,
    }), [couples])

    const filteredCouples = useMemo(() => {
        return couples
            .filter(c => filter === 'all' || c.status === filter)
            .filter(c => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                const groomName = `${c.groom_first_name} ${c.groom_last_name || ''}`.toLowerCase()
                const brideName = `${c.bride_first_name} ${c.bride_last_name || ''}`.toLowerCase()
                const groomPhone = (c.groom_phone || '')
                const bridePhone = (c.bride_phone || '')
                const eventTitle = (c.event?.title || '').toLowerCase()
                const formNo = (c.form_number || '').toLowerCase()

                return groomName.includes(query) ||
                    brideName.includes(query) ||
                    groomPhone.includes(query) ||
                    bridePhone.includes(query) ||
                    eventTitle.includes(query) ||
                    formNo.includes(query)
            })
    }, [couples, filter, searchQuery])

    return (
        <ProtectedRoute>
            <div className="bg-gradient-to-br from-[#fffcf8] via-[#fdf7f2] to-[#fff5ee] min-h-screen pt-28 pb-20 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <span className="bg-primary-50 text-primary-600 border border-primary-200/60 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Social Service Console</span>
                        <h1 className="text-3xl font-display font-black text-navy-900 tracking-tight mt-3">Marriage Registrations</h1>
                        <p className="text-gray-600 text-sm mt-1 max-w-xl font-medium">Verify and monitor all couple registrations submitted under mass marriage festivals.</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                        {[
                            { label: 'Total Applications', value: counts.all,           icon: FileText,     color: 'text-navy-700',   bg: 'bg-white' },
                            { label: 'Applied (Pending)',  value: counts.applied,       icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-50/50' },
                            { label: 'Verified',           value: counts.docs_verified, icon: AlertCircle,  color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                            { label: 'Approved',           value: counts.approved,      icon: CheckCircle2, color: 'text-emerald-600',bg: 'bg-emerald-50/50' },
                            { label: 'Cancelled / Rejected', value: counts.cancelled,   icon: XCircle,      color: 'text-rose-600',   bg: 'bg-rose-50/50' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm`}>
                                <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-inner`}>
                                    <Icon size={16} className={color} />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-navy-900">{value}</div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center justify-between">
                        <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100 flex-wrap shadow-sm">
                            {FILTER_TABS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === key ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <Icon size={11} />
                                    {label}
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {counts[key]}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search couples, phone, form no…"
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-100 rounded-xl outline-none font-medium text-gray-700 placeholder:text-gray-300 focus:border-gray-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Table Card */}
                    {loading ? (
                        <div className="flex justify-center items-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : filteredCouples.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <Heart size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-sm font-bold text-gray-400">No marriage registrations found</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50/30">
                                            <th className="text-left px-6 py-4 font-black">Couple # / Form</th>
                                            <th className="text-left px-6 py-4 font-black">Groom Details</th>
                                            <th className="text-left px-6 py-4 font-black">Bride Details</th>
                                            <th className="text-left px-6 py-4 font-black">Mass Marriage Event</th>
                                            <th className="text-left px-6 py-4 font-black">Reg Date</th>
                                            <th className="text-left px-6 py-4 font-black">Status</th>
                                            <th className="text-center px-6 py-4 font-black">View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCouples.map(c => {
                                            const st = STATUS_STYLE[c.status || 'applied'] || { label: c.status || 'applied', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' }
                                            return (
                                                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-navy-900 font-black">#{c.couple_number || '—'}</div>
                                                        <div className="text-[10px] text-gray-400 font-semibold">{c.form_number || '—'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-navy-900">{c.groom_first_name} {c.groom_last_name || ''}</div>
                                                        <div className="text-[10px] text-gray-400 space-x-1.5 font-medium">
                                                            <span>Age: {c.groom_age || '—'}</span>
                                                            <span>•</span>
                                                            <span>{c.groom_phone || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-navy-900">{c.bride_first_name} {c.bride_last_name || ''}</div>
                                                        <div className="text-[10px] text-gray-400 space-x-1.5 font-medium">
                                                            <span>Age: {c.bride_age || '—'}</span>
                                                            <span>•</span>
                                                            <span>{c.bride_phone || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {c.event ? (
                                                            <>
                                                                <span className="font-bold text-navy-900">{c.event.title}</span>
                                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium mt-0.5">
                                                                    <Calendar size={10} />
                                                                    {formatDate(c.event.start_datetime)}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-300 italic">No Active Event</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{formatDate(c.application_date)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 w-fit ${st.bg} ${st.text} ${st.border}`}>
                                                            <div className={`w-1 h-1 rounded-full ${st.dot}`} />
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedCouple(c)}
                                                            className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all inline-flex items-center justify-center border border-transparent hover:border-primary-100"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Details Preview Modal */}
            {selectedCouple && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-navy-900 text-white flex justify-between items-center">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-400">
                                    {isEditing ? 'Edit Mode' : 'Application Preview'}
                                </span>
                                <h3 className="text-lg font-black tracking-tight mt-0.5">Couple #{selectedCouple.couple_number || '—'} Details</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCouple(null)
                                    setIsEditing(false)
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white/80 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {isEditing ? (
                                <div className="space-y-6">
                                    {editError && (
                                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-semibold text-rose-600">
                                            {editError}
                                        </div>
                                    )}

                                    {/* Photos Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Groom Photo */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                                {editForm.groom_photo_url ? (
                                                    <img src={fixImageUrl(editForm.groom_photo_url)} alt="Groom Photo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">No Photo</span>
                                                )}
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <label className="block text-[9px] font-black uppercase tracking-wider text-navy-900">Groom Passport Photo</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="modal-groom-photo-input"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            try {
                                                                setUploadingTypes(prev => ({ ...prev, groom_photo: true }))
                                                                const res = await fundraiserService.uploadMedia(file, 'group_marriages')
                                                                if (res.success && res.data?.url) {
                                                                    setEditForm((prev: any) => ({ ...prev, groom_photo_url: res.data.url }))
                                                                }
                                                            } catch (err) {
                                                                alert('Upload failed.')
                                                            } finally {
                                                                setUploadingTypes(prev => ({ ...prev, groom_photo: false }))
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('modal-groom-photo-input')?.click()}
                                                        className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-[9px] uppercase hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        Upload
                                                    </button>
                                                    {editForm.groom_photo_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm((prev: any) => ({ ...prev, groom_photo_url: '' }))}
                                                            className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[9px] font-bold uppercase transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    {uploadingTypes.groom_photo && (
                                                        <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading…</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bride Photo */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                                {editForm.bride_photo_url ? (
                                                    <img src={fixImageUrl(editForm.bride_photo_url)} alt="Bride Photo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">No Photo</span>
                                                )}
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <label className="block text-[9px] font-black uppercase tracking-wider text-navy-900">Bride Passport Photo</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="modal-bride-photo-input"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            try {
                                                                setUploadingTypes(prev => ({ ...prev, bride_photo: true }))
                                                                const res = await fundraiserService.uploadMedia(file, 'group_marriages')
                                                                if (res.success && res.data?.url) {
                                                                    setEditForm((prev: any) => ({ ...prev, bride_photo_url: res.data.url }))
                                                                }
                                                            } catch (err) {
                                                                alert('Upload failed.')
                                                            } finally {
                                                                setUploadingTypes(prev => ({ ...prev, bride_photo: false }))
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('modal-bride-photo-input')?.click()}
                                                        className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-[9px] uppercase hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        Upload
                                                    </button>
                                                    {editForm.bride_photo_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditForm((prev: any) => ({ ...prev, bride_photo_url: '' }))}
                                                            className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[9px] font-bold uppercase transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    {uploadingTypes.bride_photo && (
                                                        <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading…</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groom Fields */}
                                    <div className="space-y-4 bg-blue-50/10 border border-blue-100/20 rounded-3xl p-5">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-600">Groom Information</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">First Name *</label>
                                                <input value={editForm.groom_first_name || ''} onChange={e => setEditForm({ ...editForm, groom_first_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Last Name</label>
                                                <input value={editForm.groom_last_name || ''} onChange={e => setEditForm({ ...editForm, groom_last_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Date of Birth</label>
                                                <input type="date" value={editForm.groom_dob || ''} onChange={e => setEditForm({ ...editForm, groom_dob: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Age</label>
                                                <input type="number" value={editForm.groom_age || ''} onChange={e => setEditForm({ ...editForm, groom_age: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Phone</label>
                                                <input value={editForm.groom_phone || ''} onChange={e => setEditForm({ ...editForm, groom_phone: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Aadhaar</label>
                                                <input value={editForm.groom_aadhaar || ''} onChange={e => setEditForm({ ...editForm, groom_aadhaar: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Father&apos;s Name</label>
                                                <input value={editForm.groom_father_name || ''} onChange={e => setEditForm({ ...editForm, groom_father_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Mother&apos;s Name</label>
                                                <input value={editForm.groom_mother_name || ''} onChange={e => setEditForm({ ...editForm, groom_mother_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Religion</label>
                                                <input value={editForm.groom_religion || ''} onChange={e => setEditForm({ ...editForm, groom_religion: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Caste</label>
                                                <input value={editForm.groom_caste || ''} onChange={e => setEditForm({ ...editForm, groom_caste: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Occupation</label>
                                                <input value={editForm.groom_occupation || ''} onChange={e => setEditForm({ ...editForm, groom_occupation: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Education</label>
                                                <input value={editForm.groom_education || ''} onChange={e => setEditForm({ ...editForm, groom_education: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bride Fields */}
                                    <div className="space-y-4 bg-pink-50/10 border border-pink-100/20 rounded-3xl p-5">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-pink-600">Bride Information</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">First Name *</label>
                                                <input value={editForm.bride_first_name || ''} onChange={e => setEditForm({ ...editForm, bride_first_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Last Name</label>
                                                <input value={editForm.bride_last_name || ''} onChange={e => setEditForm({ ...editForm, bride_last_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Date of Birth</label>
                                                <input type="date" value={editForm.bride_dob || ''} onChange={e => setEditForm({ ...editForm, bride_dob: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Age</label>
                                                <input type="number" value={editForm.bride_age || ''} onChange={e => setEditForm({ ...editForm, bride_age: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Phone</label>
                                                <input value={editForm.bride_phone || ''} onChange={e => setEditForm({ ...editForm, bride_phone: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Aadhaar</label>
                                                <input value={editForm.bride_aadhaar || ''} onChange={e => setEditForm({ ...editForm, bride_aadhaar: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Father&apos;s Name</label>
                                                <input value={editForm.bride_father_name || ''} onChange={e => setEditForm({ ...editForm, bride_father_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Mother&apos;s Name</label>
                                                <input value={editForm.bride_mother_name || ''} onChange={e => setEditForm({ ...editForm, bride_mother_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Religion</label>
                                                <input value={editForm.bride_religion || ''} onChange={e => setEditForm({ ...editForm, bride_religion: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Caste</label>
                                                <input value={editForm.bride_caste || ''} onChange={e => setEditForm({ ...editForm, bride_caste: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Occupation</label>
                                                <input value={editForm.bride_occupation || ''} onChange={e => setEditForm({ ...editForm, bride_occupation: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Education</label>
                                                <input value={editForm.bride_education || ''} onChange={e => setEditForm({ ...editForm, bride_education: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Addresses, Income, Introducer */}
                                    <div className="space-y-4 bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-navy-900">Address, Income & introducer</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="col-span-full">
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Current Residential Address</label>
                                                <textarea value={editForm.groom_address || ''} onChange={e => setEditForm({ ...editForm, groom_address: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900 resize-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">City</label>
                                                <input value={editForm.groom_city || ''} onChange={e => setEditForm({ ...editForm, groom_city: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">State</label>
                                                <input value={editForm.groom_state || ''} onChange={e => setEditForm({ ...editForm, groom_state: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Zipcode</label>
                                                <input value={editForm.groom_zipcode || ''} onChange={e => setEditForm({ ...editForm, groom_zipcode: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Family Yearly Income (₹)</label>
                                                <input type="number" value={editForm.groom_family_income || ''} onChange={e => setEditForm({ ...editForm, groom_family_income: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Introduced By</label>
                                                <input value={editForm.groom_introduced_by || ''} onChange={e => setEditForm({ ...editForm, groom_introduced_by: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Introducer Phone</label>
                                                <input value={editForm.groom_introduced_by_phone || ''} onChange={e => setEditForm({ ...editForm, groom_introduced_by_phone: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900" />
                                            </div>
                                            <div className="col-span-full">
                                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Additional Remarks / Notes</label>
                                                <textarea value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white border border-gray-150 rounded-xl outline-none font-bold text-xs text-navy-900 resize-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Uploading Section */}
                                    <div className="space-y-4 bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-navy-900">Verification Documents</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { type: 'aadhaar_groom', title: 'Groom Aadhaar' },
                                                { type: 'aadhaar_bride', title: 'Bride Aadhaar' },
                                                { type: 'birth_cert_groom', title: 'Groom Birth Certificate' },
                                                { type: 'birth_cert_bride', title: 'Bride Birth Certificate' },
                                                { type: 'caste_cert_groom', title: 'Groom Caste Certificate' },
                                                { type: 'caste_cert_bride', title: 'Bride Caste Certificate' },
                                            ].map((docDef) => {
                                                const uploaded = editForm.documents?.find((d: any) => d.doc_type === docDef.type)
                                                const uploading = uploadingTypes[docDef.type]

                                                return (
                                                    <div key={docDef.type} className="bg-white border border-gray-150 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                                        <div className="space-y-0.5 max-w-[70%]">
                                                            <p className="font-bold text-navy-900 text-[10px] uppercase tracking-wider">{docDef.title}</p>
                                                            {uploaded ? (
                                                                <p className="text-[9px] text-gray-400 font-semibold truncate">{uploaded.original_filename || 'uploaded-file'}</p>
                                                            ) : (
                                                                <p className="text-[9px] text-amber-500 font-bold italic">Not uploaded</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <input
                                                                type="file"
                                                                id={`modal-upload-${docDef.type}`}
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0]
                                                                    if (file) addDoc(file, docDef.type)
                                                                }}
                                                            />
                                                            {uploading ? (
                                                                <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading…</span>
                                                            ) : uploaded ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDoc(uploaded.id)}
                                                                    className="px-2 py-1 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                >
                                                                    Remove
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => document.getElementById(`modal-upload-${docDef.type}`)?.click()}
                                                                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all"
                                                                >
                                                                    Upload
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Additional Documents uploader inside Modal */}
                                        <div className="mt-4 border-t border-gray-150 pt-4">
                                            <label className="block text-[9px] font-black uppercase text-gray-400 mb-2">Additional Uploads</label>
                                            
                                            <div className="space-y-2 mb-3">
                                                {editForm.documents?.filter((d: any) => d.doc_type.startsWith('other_')).map((doc: any, idx: number) => (
                                                    <div key={doc.id} className="bg-white border border-gray-150 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                                        <div className="flex items-center gap-2 max-w-[70%]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                            <a href={fixImageUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="font-bold text-[10px] text-primary-600 hover:underline truncate">
                                                                {doc.original_filename || `Additional Document ${idx + 1}`}
                                                            </a>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDoc(doc.id)}
                                                            className="px-2 py-1 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <input
                                                type="file"
                                                id="modal-upload-additional-other"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) addDoc(file, 'other_groom')
                                                }}
                                            />
                                            {uploadingTypes.other_groom ? (
                                                <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading additional…</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('modal-upload-additional-other')?.click()}
                                                    className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-navy-900 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all shadow-sm border-dashed"
                                                >
                                                    + Add Additional Document
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Status and event banner */}
                                    <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4 justify-between items-start sm:items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status:</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${STATUS_STYLE[selectedCouple.status || 'applied']?.bg} ${STATUS_STYLE[selectedCouple.status || 'applied']?.text} ${STATUS_STYLE[selectedCouple.status || 'applied']?.border}`}>
                                                <div className={`w-1 h-1 rounded-full ${STATUS_STYLE[selectedCouple.status || 'applied']?.dot}`} />
                                                {STATUS_STYLE[selectedCouple.status || 'applied']?.label}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-semibold text-gray-500 flex items-center gap-1.5">
                                            <Calendar size={11} className="text-primary-500" /> App Date: {formatDate(selectedCouple.application_date)}
                                        </div>
                                    </div>

                                    {/* Groom and Bride grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Groom panel */}
                                        <div className="space-y-3 bg-blue-50/20 border border-blue-100/30 rounded-2xl p-4">
                                            <div className="flex justify-between items-center border-b border-blue-100/50 pb-1.5">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1"><User size={10} /> Groom Details</h4>
                                                {selectedCouple.groom_photo_url && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-blue-100 shadow-sm bg-white">
                                                        <img src={fixImageUrl(selectedCouple.groom_photo_url)} alt="Groom Photo" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between font-bold"><span className="text-gray-400">Name</span><span className="text-navy-900">{selectedCouple.groom_first_name} {selectedCouple.groom_last_name || ''}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Date of Birth</span><span className="text-gray-800 font-semibold">{formatDate(selectedCouple.groom_dob)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Age</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_age || '—'} yrs</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_phone || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Aadhaar</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_aadhaar || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Father Name</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_father_name || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Mother Name</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_mother_name || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Religion/Caste</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_religion || '—'} {selectedCouple.groom_caste ? `(${selectedCouple.groom_caste})` : ''}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Education</span><span className="text-gray-800 font-semibold">{selectedCouple.groom_education || '—'}</span></div>
                                            </div>
                                        </div>

                                        {/* Bride panel */}
                                        <div className="space-y-3 bg-pink-50/20 border border-pink-100/30 rounded-2xl p-4">
                                            <div className="flex justify-between items-center border-b border-pink-100/50 pb-1.5">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-600 flex items-center gap-1"><User size={10} /> Bride Details</h4>
                                                {selectedCouple.bride_photo_url && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-pink-100 shadow-sm bg-white">
                                                        <img src={fixImageUrl(selectedCouple.bride_photo_url)} alt="Bride Photo" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between font-bold"><span className="text-gray-400">Name</span><span className="text-navy-900">{selectedCouple.bride_first_name} {selectedCouple.bride_last_name || ''}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Date of Birth</span><span className="text-gray-800 font-semibold">{formatDate(selectedCouple.bride_dob)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Age</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_age || '—'} yrs</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_phone || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Aadhaar</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_aadhaar || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Father Name</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_father_name || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Mother Name</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_mother_name || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Religion/Caste</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_religion || '—'} {selectedCouple.bride_caste ? `(${selectedCouple.bride_caste})` : ''}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Education</span><span className="text-gray-800 font-semibold">{selectedCouple.bride_education || '—'}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Addresses & Occupations */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs">
                                            <div className="font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider text-[9px]"><Map size={10} /> Residential Address</div>
                                            <div className="text-navy-900 font-medium leading-relaxed mt-1">
                                                <p>{selectedCouple.groom_address || '—'}</p>
                                                <p className="mt-1 text-[10px] text-gray-500">
                                                    {selectedCouple.groom_city && `${selectedCouple.groom_city}, `}
                                                    {selectedCouple.groom_state && `${selectedCouple.groom_state}, `}
                                                    {selectedCouple.groom_zipcode && `${selectedCouple.groom_zipcode}, `}
                                                    {selectedCouple.groom_country}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs">
                                            <div className="font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider text-[9px]"><Briefcase size={10} /> Employment & Income</div>
                                            <div className="space-y-1.5 mt-1 font-semibold text-gray-800">
                                                <div className="flex justify-between"><span className="text-gray-400">Groom Job</span><span>{selectedCouple.groom_occupation || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Bride Job</span><span>{selectedCouple.bride_occupation || '—'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-400">Yearly Income</span><span className="text-emerald-700">₹{selectedCouple.groom_family_income?.toLocaleString('en-IN') || '—'}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Introducer details */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs">
                                        <div className="font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider text-[9px]"><Phone size={10} /> Introducer & Coordinator</div>
                                        <div className="grid grid-cols-2 gap-4 mt-2 font-semibold">
                                            <div><span className="text-gray-400">Introduced By:</span> <span className="text-gray-800">{selectedCouple.groom_introduced_by || '—'}</span></div>
                                            <div><span className="text-gray-400">Introducer Phone:</span> <span className="text-gray-800">{selectedCouple.groom_introduced_by_phone || '—'}</span></div>
                                        </div>
                                    </div>

                                    {/* Uploaded Documents */}
                                    {selectedCouple.documents && selectedCouple.documents.length > 0 && (
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-3">
                                            <div className="font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider text-[9px]"><Award size={10} /> Verification Documents</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedCouple.documents.map((doc) => {
                                                    const labels: Record<string, string> = {
                                                        aadhaar_groom: 'Groom Aadhaar',
                                                        aadhaar_bride: 'Bride Aadhaar',
                                                        birth_cert_groom: 'Groom Birth Cert / Age Proof',
                                                        birth_cert_bride: 'Bride Birth Cert / Age Proof',
                                                        caste_cert_groom: 'Groom Caste Cert',
                                                        caste_cert_bride: 'Bride Caste Cert',
                                                        other_groom: 'Groom Other Doc',
                                                        other_bride: 'Bride Other Doc',
                                                    }
                                                    const label = labels[doc.doc_type] || doc.doc_type.replace(/_/g, ' ').toUpperCase()
                                                    
                                                    return (
                                                        <div key={doc.id} className="bg-white border border-gray-150 rounded-xl p-3 flex justify-between items-center shadow-inner">
                                                            <div className="space-y-0.5 max-w-[70%]">
                                                                <p className="font-bold text-navy-900 text-[10px] uppercase tracking-wider">{label}</p>
                                                                <p className="text-[9px] text-gray-400 font-semibold truncate">{doc.original_filename || 'document-file'}</p>
                                                            </div>
                                                            <a
                                                                href={fixImageUrl(doc.url)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-2.5 py-1.5 bg-primary-50 text-primary-600 font-bold rounded-lg text-[9px] uppercase tracking-wider hover:bg-primary-100 transition-all"
                                                            >
                                                                View file
                                                            </a>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional notes */}
                                    {selectedCouple.notes && (
                                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs">
                                            <div className="font-bold text-amber-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">Additional Notes</div>
                                            <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap font-medium">{selectedCouple.notes}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-500 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveChanges}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 transition-all shadow-md"
                                    >
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={startEditing}
                                        className="px-4 py-2 bg-navy-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-navy-800 transition-all"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => window.open(`/admin/marriage-registrations/print/${selectedCouple?.id}`, '_blank')}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-700 transition-all"
                                    >
                                        🖨️ Print Application
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCouple(null)}
                                        className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-500 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                    >
                                        Close Details
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    )
}
