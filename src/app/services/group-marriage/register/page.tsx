'use client'
/* eslint-disable react/no-unescaped-entities */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { ArrowLeft, Loader2, Plus, Trash2, Heart, Users, Home, FileText, AlertCircle, CheckCircle2, ChevronRight, Calendar, MapPin } from 'lucide-react'
import { groupMarriageService, GroupMarriageEvent } from '@/services/group-marriage.service'
import { eventService } from '@/services/event.service'
import { fundraiserService } from '@/services/fundraiser.service'
import { fixImageUrl } from '@/lib/image-utils'

const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-xs text-navy-900 placeholder:text-gray-300 focus:border-primary-500 focus:bg-white transition-all'
const inputErrCls = 'w-full px-4 py-2.5 bg-rose-50 border border-rose-300 rounded-xl outline-none font-bold text-xs text-navy-900 placeholder:text-rose-300 focus:border-rose-500 focus:bg-rose-50/50 transition-all'
const labelCls = 'block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5'
const labelErrCls = 'block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5'

type ValidationErrors = Record<string, string>

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']
const EDUCATIONS = ['No Formal Education', 'Primary', 'Secondary', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate', 'Other']

type Tab = 'groom' | 'bride' | 'family' | 'notes'

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'groom',     label: 'Groom',         icon: Heart,    color: 'text-blue-500' },
    { key: 'bride',     label: 'Bride',          icon: Heart,    color: 'text-rose-500' },
    { key: 'family',    label: 'Family Contact', icon: Home,     color: 'text-primary-500' },
    { key: 'notes',     label: 'Notes',          icon: FileText, color: 'text-gray-400' },
]

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div>
            <label className={error ? labelErrCls : labelCls}>{label}</label>
            {children}
            {error && (
                <p className="mt-1 text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle size={9} className="flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="col-span-full border-b border-gray-100 pb-1.5 mt-3 mb-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-navy-900">{title}</h3>
        </div>
    )
}

const SUB_TABS = ['personal', 'address', 'employment', 'verification', 'documents'] as const
type SubTabType = typeof SUB_TABS[number]

function PersonTab({ prefix, form, set, countries, states, handleCountryChange, documents, setDocuments, uploadingTypes, setUploadingTypes, subTab, setSubTab, errors, touched, onBlur }: {
    prefix: 'groom' | 'bride'
    form: Record<string, string>
    set: (field: string, value: string) => void
    countries: { id: string; name: string }[]
    states: { id: string; name: string }[]
    handleCountryChange: (val: string) => void
    documents: { doc_type: string; url: string; original_filename: string }[]
    setDocuments: React.Dispatch<React.SetStateAction<{ doc_type: string; url: string; original_filename: string }[]>>
    uploadingTypes: Record<string, boolean>
    setUploadingTypes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
    subTab: SubTabType
    setSubTab: (val: SubTabType) => void
    errors: ValidationErrors
    touched: Record<string, boolean>
    onBlur: (field: string) => void
}) {
    // Helper: return error message if field is touched and has error
    const fieldErr = (field: string) => touched[field] ? errors[field] : undefined
    const ic = (field: string) => fieldErr(field) ? inputErrCls : inputCls
    const subTabs: { key: SubTabType; label: string; fields: string[] }[] = [
        { key: 'personal',     label: 'Personal & Parents', fields: [`${prefix}_first_name`, `${prefix}_last_name`, `${prefix}_phone`, `${prefix}_dob`, `${prefix}_age`, `${prefix}_photo_url`] },
        { key: 'address',      label: 'Address Details',     fields: [`${prefix}_address`, `${prefix}_city`, `${prefix}_zipcode`] },
        { key: 'employment',   label: 'Employment & Income', fields: [] },
        { key: 'verification', label: 'Verification & Introducer', fields: [`${prefix}_aadhaar`] },
        { key: 'documents',    label: 'Documents',           fields: [] },
    ]

    const subTabHasError = (fields: string[]) => fields.some(f => touched[f] && errors[f])

    return (
        <div className="space-y-6">
            {/* Sub-tab Bar */}
            <div className="flex gap-1.5 border-b border-gray-100 overflow-x-auto pb-2 scrollbar-none">
                {subTabs.map(st => {
                    const hasErr = subTabHasError(st.fields)
                    return (
                        <button
                            key={st.key}
                            type="button"
                            onClick={() => setSubTab(st.key)}
                            className={`relative px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                subTab === st.key
                                    ? 'bg-primary-50 text-primary-600 border border-primary-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {st.label}
                            {hasErr && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Sub-tab Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subTab === 'personal' && (
                    <>
                        <SectionHeader title="Personal Details" />
                        <div className={`col-span-full p-4 rounded-2xl mb-2 flex flex-col sm:flex-row items-center gap-4 transition-all ${
                            fieldErr(`${prefix}_photo_url`)
                                ? 'bg-rose-50 border border-rose-300'
                                : 'bg-gray-50 border border-gray-100'
                        }`}>
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative group">
                                {form[`${prefix}_photo_url`] ? (
                                    <img src={fixImageUrl(form[`${prefix}_photo_url`])} alt="Photo preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center px-1">No Image</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                <label className={`block text-[10px] font-black uppercase tracking-wider ${
                                    fieldErr(`${prefix}_photo_url`) ? 'text-rose-500' : 'text-navy-900'
                                }`}>
                                    Passport Photo * (JPEG/PNG)
                                </label>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id={`${prefix}-photo-input`}
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                try {
                                                    set(`${prefix}_photo_url`, 'Uploading...')
                                                    const res = await fundraiserService.uploadMedia(file, 'group_marriages')
                                                    if (res.success && res.data?.url) {
                                                        set(`${prefix}_photo_url`, res.data.url)
                                                        onBlur(`${prefix}_photo_url`)
                                                    } else {
                                                        set(`${prefix}_photo_url`, '')
                                                        alert('Image upload failed.')
                                                    }
                                                } catch (err) {
                                                    set(`${prefix}_photo_url`, '')
                                                    alert('Image upload failed due to network error.')
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { document.getElementById(`${prefix}-photo-input`)?.click(); onBlur(`${prefix}_photo_url`) }}
                                        className={`px-3 py-1.5 border font-bold rounded-lg text-[9px] uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1 shadow-sm ${
                                            fieldErr(`${prefix}_photo_url`)
                                                ? 'bg-rose-100 border-rose-300 text-rose-700'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Choose File…
                                    </button>
                                    {form[`${prefix}_photo_url`] && form[`${prefix}_photo_url`] !== 'Uploading...' && (
                                        <button
                                            type="button"
                                            onClick={() => set(`${prefix}_photo_url`, '')}
                                            className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[9px] font-bold uppercase transition-all"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    {form[`${prefix}_photo_url`] === 'Uploading...' && (
                                        <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading…</span>
                                    )}
                                </div>
                                {fieldErr(`${prefix}_photo_url`) && (
                                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                                        <AlertCircle size={9} className="flex-shrink-0" />
                                        {fieldErr(`${prefix}_photo_url`)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Field label="First Name *" error={fieldErr(`${prefix}_first_name`)}>
                            <input
                                value={form[`${prefix}_first_name`] || ''}
                                onChange={e => set(`${prefix}_first_name`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_first_name`)}
                                placeholder="First name"
                                className={ic(`${prefix}_first_name`)}
                            />
                        </Field>
                        <Field label="Last Name *" error={fieldErr(`${prefix}_last_name`)}>
                            <input
                                value={form[`${prefix}_last_name`] || ''}
                                onChange={e => set(`${prefix}_last_name`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_last_name`)}
                                placeholder="Last name"
                                className={ic(`${prefix}_last_name`)}
                            />
                        </Field>
                        <Field label="Date of Birth *" error={fieldErr(`${prefix}_dob`)}>
                            <input
                                type="date"
                                value={form[`${prefix}_dob`] || ''}
                                onChange={e => set(`${prefix}_dob`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_dob`)}
                                className={ic(`${prefix}_dob`)}
                            />
                        </Field>
                        <Field label="Age *" error={fieldErr(`${prefix}_age`)}>
                            <input
                                type="number"
                                min="18"
                                value={form[`${prefix}_age`] || ''}
                                onChange={e => set(`${prefix}_age`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_age`)}
                                placeholder="Age (min 18 for groom, 18 for bride)"
                                className={ic(`${prefix}_age`)}
                            />
                        </Field>
                        <Field label="Phone *" error={fieldErr(`${prefix}_phone`)}>
                            <input
                                value={form[`${prefix}_phone`] || ''}
                                onChange={e => set(`${prefix}_phone`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_phone`)}
                                placeholder="10-digit mobile"
                                className={ic(`${prefix}_phone`)}
                                maxLength={10}
                            />
                        </Field>
                        <Field label="Alternate / Tel">
                            <input value={form[`${prefix}_alternate_phone`] || ''} onChange={e => set(`${prefix}_alternate_phone`, e.target.value)} placeholder="Alternate phone" className={inputCls} />
                        </Field>
                        <Field label="Religion">
                            <select value={form[`${prefix}_religion`] || ''} onChange={e => set(`${prefix}_religion`, e.target.value)} className={inputCls}>
                                <option value="">Select…</option>
                                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Field>
                        <Field label="Caste">
                            <input value={form[`${prefix}_caste`] || ''} onChange={e => set(`${prefix}_caste`, e.target.value)} placeholder="Caste" className={inputCls} />
                        </Field>
                        <Field label="Education">
                            <select value={form[`${prefix}_education`] || ''} onChange={e => set(`${prefix}_education`, e.target.value)} className={inputCls}>
                                <option value="">Select…</option>
                                {EDUCATIONS.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                            </select>
                        </Field>

                        <SectionHeader title="Parents & Guardian" />
                        <Field label="Mother's Name">
                            <input value={form[`${prefix}_mother_name`] || ''} onChange={e => set(`${prefix}_mother_name`, e.target.value)} placeholder="Mother's name" className={inputCls} />
                        </Field>
                        <Field label="Father's Name">
                            <input value={form[`${prefix}_father_name`] || ''} onChange={e => set(`${prefix}_father_name`, e.target.value)} placeholder="Father's name" className={inputCls} />
                        </Field>
                        <Field label="Guardian's Name">
                            <input value={form[`${prefix}_guardian_name`] || ''} onChange={e => set(`${prefix}_guardian_name`, e.target.value)} placeholder="Guardian's name (if applicable)" className={inputCls} />
                        </Field>
                    </>
                )}

                {subTab === 'address' && (
                    <>
                        <SectionHeader title="Residential & Native Address" />
                        <div className="col-span-full">
                            <Field label="Residential Address *" error={fieldErr(`${prefix}_address`)}>
                                <textarea
                                    value={form[`${prefix}_address`] || ''}
                                    onChange={e => set(`${prefix}_address`, e.target.value)}
                                    onBlur={() => onBlur(`${prefix}_address`)}
                                    rows={2}
                                    placeholder="Current residential address"
                                    className={(fieldErr(`${prefix}_address`) ? inputErrCls : inputCls) + ' resize-none'}
                                />
                            </Field>
                        </div>
                        <Field label="Zip / Postal Code *" error={fieldErr(`${prefix}_zipcode`)}>
                            <input
                                value={form[`${prefix}_zipcode`] || ''}
                                onChange={e => set(`${prefix}_zipcode`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_zipcode`)}
                                placeholder="6-digit Pincode"
                                className={ic(`${prefix}_zipcode`)}
                                maxLength={6}
                            />
                        </Field>
                        <Field label="City *" error={fieldErr(`${prefix}_city`)}>
                            <input
                                value={form[`${prefix}_city`] || ''}
                                onChange={e => set(`${prefix}_city`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_city`)}
                                placeholder="City"
                                className={ic(`${prefix}_city`)}
                            />
                        </Field>
                        <Field label="Country">
                            {countries.length > 0 ? (
                                <select
                                    value={form[`${prefix}_country`] || ''}
                                    onChange={e => handleCountryChange(e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">Select Country…</option>
                                    {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            ) : (
                                <input value={form[`${prefix}_country`] || ''} onChange={e => set(`${prefix}_country`, e.target.value)} placeholder="Country" className={inputCls} />
                            )}
                        </Field>
                        <Field label="State">
                            {states.length > 0 ? (
                                <select
                                    value={form[`${prefix}_state`] || ''}
                                    onChange={e => set(`${prefix}_state`, e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">Select State…</option>
                                    {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            ) : (
                                <input value={form[`${prefix}_state`] || ''} onChange={e => set(`${prefix}_state`, e.target.value)} placeholder="State" className={inputCls} />
                            )}
                        </Field>
                        <div className="col-span-full">
                            <Field label="Native Place Address">
                                <textarea value={form[`${prefix}_native_address`] || ''} onChange={e => set(`${prefix}_native_address`, e.target.value)} rows={2} placeholder="Native place address" className={inputCls + ' resize-none'} />
                            </Field>
                        </div>
                    </>
                )}

                {subTab === 'employment' && (
                    <>
                        <SectionHeader title="Employment & Income" />
                        <Field label="Occupation">
                            <input value={form[`${prefix}_occupation`] || ''} onChange={e => set(`${prefix}_occupation`, e.target.value)} placeholder="Occupation" className={inputCls} />
                        </Field>
                        <Field label="Father/Guardian Occupation">
                            <input value={form[`${prefix}_father_guardian_occupation`] || ''} onChange={e => set(`${prefix}_father_guardian_occupation`, e.target.value)} placeholder="Father/Guardian occupation" className={inputCls} />
                        </Field>
                        <Field label="Family Yearly Income (INR)">
                            <input type="number" value={form[`${prefix}_family_income`] || ''} onChange={e => set(`${prefix}_family_income`, e.target.value)} placeholder="Family yearly income" className={inputCls} />
                        </Field>
                    </>
                )}

                {subTab === 'verification' && (
                    <>
                        <SectionHeader title="Verification & Introducer" />
                        <Field label="Aadhaar Number *" error={fieldErr(`${prefix}_aadhaar`)}>
                            <input
                                value={form[`${prefix}_aadhaar`] || ''}
                                onChange={e => set(`${prefix}_aadhaar`, e.target.value)}
                                onBlur={() => onBlur(`${prefix}_aadhaar`)}
                                placeholder="12-digit Aadhaar"
                                className={ic(`${prefix}_aadhaar`)}
                                maxLength={12}
                            />
                        </Field>
                        <Field label="Ration Card Number">
                            <input value={form[`${prefix}_ration_card`] || ''} onChange={e => set(`${prefix}_ration_card`, e.target.value)} placeholder="Ration card number" className={inputCls} />
                        </Field>
                        <Field label="Introduced By">
                            <input value={form[`${prefix}_introduced_by`] || ''} onChange={e => set(`${prefix}_introduced_by`, e.target.value)} placeholder="Introduced by name" className={inputCls} />
                        </Field>
                        <Field label="Introduced By Phone">
                            <input value={form[`${prefix}_introduced_by_phone`] || ''} onChange={e => set(`${prefix}_introduced_by_phone`, e.target.value)} placeholder="Introducer phone" className={inputCls} />
                        </Field>
                    </>
                )}

                {subTab === 'documents' && (
                    <div className="col-span-full space-y-6">
                        <div>
                            <SectionHeader title="Required Documents" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                {[
                                    { type: `aadhaar_${prefix}`, title: 'Aadhaar Card', desc: 'UIDAI Aadhaar Card PDF or Image (max 5MB)' },
                                    { type: `birth_cert_${prefix}`, title: 'Birth Certificate / Age Proof', desc: 'School leaving, birth cert or age proof' },
                                    { type: `caste_cert_${prefix}`, title: 'Caste Certificate', desc: 'Caste certificate document if applicable' },
                                ].map((docDef) => {
                                    const docType = docDef.type
                                    const actualDocType = docType
                                    const uploaded = documents.find(d => d.doc_type === actualDocType)
                                    const uploading = uploadingTypes[actualDocType]

                                    return (
                                        <div key={docDef.type} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                                            <div>
                                                <h5 className="font-bold text-navy-900 text-xs">{docDef.title}</h5>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{docDef.desc}</p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                {uploaded ? (
                                                    <div className="flex items-center gap-2 max-w-[70%]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                        <a
                                                            href={fixImageUrl(uploaded.url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] font-semibold text-primary-600 hover:underline truncate"
                                                            title={uploaded.original_filename}
                                                        >
                                                            {uploaded.original_filename || 'Uploaded Document'}
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-semibold italic">Not uploaded</span>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        id={`file-input-${actualDocType}`}
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                try {
                                                                    setUploadingTypes(prev => ({ ...prev, [actualDocType]: true }))
                                                                    const res = await fundraiserService.uploadMedia(file, 'group_marriages')
                                                                    if (res.success && res.data?.url) {
                                                                        const newDoc = {
                                                                            doc_type: actualDocType,
                                                                            url: res.data.url,
                                                                            original_filename: file.name
                                                                        }
                                                                        setDocuments(prev => {
                                                                            const filtered = prev.filter(d => d.doc_type !== actualDocType)
                                                                            return [...filtered, newDoc]
                                                                        })
                                                                    } else {
                                                                        alert('Upload failed.')
                                                                    }
                                                                } catch (err) {
                                                                    alert('Upload failed due to error.')
                                                                } finally {
                                                                    setUploadingTypes(prev => ({ ...prev, [actualDocType]: false }))
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    {uploading ? (
                                                        <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading…</span>
                                                    ) : uploaded ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDocuments(prev => prev.filter(d => d.doc_type !== actualDocType))
                                                            }}
                                                            className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => document.getElementById(`file-input-${actualDocType}`)?.click()}
                                                            className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all"
                                                        >
                                                            Upload
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Additional Documents Section */}
                        <div className="border-t border-gray-150 pt-6">
                            <SectionHeader title="Additional Documents" />
                            <p className="text-[10px] text-gray-400 font-medium mt-1">Upload any other certificates, income proofs, or affidavits if required.</p>
                            
                            {/* List of uploaded other documents */}
                            <div className="space-y-2 mt-3">
                                {documents.filter(d => d.doc_type === `other_${prefix}`).map((doc, idx) => (
                                    <div key={doc.url} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center text-xs shadow-sm">
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                            <a
                                                href={fixImageUrl(doc.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-primary-600 hover:underline truncate"
                                                title={doc.original_filename}
                                            >
                                                {doc.original_filename || `Additional Document ${idx + 1}`}
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDocuments(prev => prev.filter(d => d.url !== doc.url))
                                            }}
                                            className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                {documents.filter(d => d.doc_type === `other_${prefix}`).length === 0 && (
                                    <p className="text-[10px] text-gray-400 italic">No additional documents uploaded</p>
                                )}
                            </div>

                            {/* Upload button */}
                            <div className="mt-4">
                                <input
                                    type="file"
                                    id={`additional-doc-input-${prefix}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const actualDocType = `other_${prefix}`
                                            try {
                                                setUploadingTypes(prev => ({ ...prev, [`add_${prefix}`]: true }))
                                                const res = await fundraiserService.uploadMedia(file, 'group_marriages')
                                                if (res.success && res.data?.url) {
                                                    const newDoc = {
                                                        doc_type: actualDocType,
                                                        url: res.data.url,
                                                        original_filename: file.name
                                                    }
                                                    setDocuments(prev => [...prev, newDoc])
                                                } else {
                                                    alert('Upload failed.')
                                                }
                                            } catch (err) {
                                                alert('Upload failed due to error.')
                                            } finally {
                                                setUploadingTypes(prev => ({ ...prev, [`add_${prefix}`]: false }))
                                            }
                                        }
                                    }}
                                />
                                {uploadingTypes[`add_${prefix}`] ? (
                                    <span className="text-[10px] text-gray-400 font-semibold animate-pulse">Uploading additional document…</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById(`additional-doc-input-${prefix}`)?.click()}
                                        className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-navy-900 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all shadow-sm border-dashed"
                                    >
                                        + Add Additional Document
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function GroupMarriageRegisterPage() {
    const router = useRouter()
    const [event, setEvent] = useState<GroupMarriageEvent | null>(null)
    const [loadingEvent, setLoadingEvent] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('groom')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [documents, setDocuments] = useState<{ doc_type: string; url: string; original_filename: string }[]>([])
    const [uploadingTypes, setUploadingTypes] = useState<Record<string, boolean>>({})
    const [groomSubTab, setGroomSubTab] = useState<SubTabType>('personal')
    const [brideSubTab, setBrideSubTab] = useState<SubTabType>('personal')
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const onBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

    const validateAll = (data: Record<string, string>): ValidationErrors => {
        const e: ValidationErrors = {}
        const phone = /^\d{10}$/
        const aadhaar = /^\d{12}$/
        const minAge18 = (age: string) => parseInt(age, 10) >= 18
        const minAge21 = (age: string) => parseInt(age, 10) >= 21

        // Groom
        if (!data.groom_photo_url?.trim() || data.groom_photo_url === 'Uploading...') e.groom_photo_url = 'Passport photo is required'
        if (!data.groom_first_name?.trim()) e.groom_first_name = 'First name is required'
        if (!data.groom_last_name?.trim()) e.groom_last_name = 'Last name is required'
        if (!data.groom_dob) e.groom_dob = 'Date of birth is required'
        if (!data.groom_age) e.groom_age = 'Age is required'
        else if (!minAge21(data.groom_age)) e.groom_age = 'Groom must be at least 21 years old'
        if (!data.groom_phone?.trim()) e.groom_phone = 'Phone is required'
        else if (!phone.test(data.groom_phone)) e.groom_phone = 'Must be a valid 10-digit number'
        if (!data.groom_address?.trim()) e.groom_address = 'Residential address is required'
        if (!data.groom_city?.trim()) e.groom_city = 'City is required'
        if (!data.groom_zipcode?.trim()) e.groom_zipcode = 'Pincode is required'
        else if (!/^\d{6}$/.test(data.groom_zipcode)) e.groom_zipcode = 'Must be a 6-digit pincode'
        if (data.groom_aadhaar && !aadhaar.test(data.groom_aadhaar)) e.groom_aadhaar = 'Must be a valid 12-digit Aadhaar'

        // Bride
        if (!data.bride_photo_url?.trim() || data.bride_photo_url === 'Uploading...') e.bride_photo_url = 'Passport photo is required'
        if (!data.bride_first_name?.trim()) e.bride_first_name = 'First name is required'
        if (!data.bride_last_name?.trim()) e.bride_last_name = 'Last name is required'
        if (!data.bride_dob) e.bride_dob = 'Date of birth is required'
        if (!data.bride_age) e.bride_age = 'Age is required'
        else if (!minAge18(data.bride_age)) e.bride_age = 'Bride must be at least 18 years old'
        if (!data.bride_phone?.trim()) e.bride_phone = 'Phone is required'
        else if (!phone.test(data.bride_phone)) e.bride_phone = 'Must be a valid 10-digit number'
        if (!data.bride_address?.trim()) e.bride_address = 'Residential address is required'
        if (!data.bride_city?.trim()) e.bride_city = 'City is required'
        if (!data.bride_zipcode?.trim()) e.bride_zipcode = 'Pincode is required'
        else if (!/^\d{6}$/.test(data.bride_zipcode)) e.bride_zipcode = 'Must be a 6-digit pincode'
        if (data.bride_aadhaar && !aadhaar.test(data.bride_aadhaar)) e.bride_aadhaar = 'Must be a valid 12-digit Aadhaar'

        return e
    }

    const touchAllFieldsForTab = (tab: Tab, subTab?: SubTabType) => {
        const fieldsToTouch: string[] = []
        const prefix = tab === 'groom' ? 'groom' : 'bride'

        if (tab === 'groom' || tab === 'bride') {
            if (subTab === 'personal') {
                fieldsToTouch.push(`${prefix}_photo_url`, `${prefix}_first_name`, `${prefix}_last_name`, `${prefix}_dob`, `${prefix}_age`, `${prefix}_phone`)
            } else if (subTab === 'address') {
                fieldsToTouch.push(`${prefix}_address`, `${prefix}_city`, `${prefix}_zipcode`)
            } else if (subTab === 'verification') {
                fieldsToTouch.push(`${prefix}_aadhaar`)
            }
        }

        if (fieldsToTouch.length) {
            setTouched(prev => {
                const next = { ...prev }
                fieldsToTouch.forEach(f => { next[f] = true })
                return next
            })
        }
    }

    const touchAll = () => {
        const allFields = [
            'groom_photo_url', 'groom_first_name', 'groom_last_name', 'groom_dob', 'groom_age', 'groom_phone',
            'groom_address', 'groom_city', 'groom_zipcode', 'groom_aadhaar',
            'bride_photo_url', 'bride_first_name', 'bride_last_name', 'bride_dob', 'bride_age', 'bride_phone',
            'bride_address', 'bride_city', 'bride_zipcode', 'bride_aadhaar',
        ]
        setTouched(prev => {
            const next = { ...prev }
            allFields.forEach(f => { next[f] = true })
            return next
        })
    }


    const [countries, setCountries] = useState<{ id: string; name: string }[]>([])
    const [groomStates, setGroomStates] = useState<{ id: string; name: string }[]>([])
    const [brideStates, setBrideStates] = useState<{ id: string; name: string }[]>([])

    const [form, setForm] = useState<Record<string, string>>({
        groom_first_name: '', groom_last_name: '', groom_dob: '', groom_age: '',
        groom_phone: '', groom_aadhaar: '', groom_father_name: '',
        groom_mother_name: '', groom_guardian_name: '', groom_address: '',
        groom_city: '', groom_state: '', groom_zipcode: '', groom_country: 'India',
        groom_native_address: '', groom_ration_card: '', groom_alternate_phone: '',
        groom_father_guardian_occupation: '', groom_family_income: '',
        groom_introduced_by: '', groom_introduced_by_phone: '',
        groom_religion: '', groom_caste: '', groom_occupation: '', groom_education: '',

        bride_first_name: '', bride_last_name: '', bride_dob: '', bride_age: '',
        bride_phone: '', bride_aadhaar: '', bride_father_name: '',
        bride_mother_name: '', bride_guardian_name: '', bride_address: '',
        bride_city: '', bride_state: '', bride_zipcode: '', bride_country: 'India',
        bride_native_address: '', bride_ration_card: '', bride_alternate_phone: '',
        bride_father_guardian_occupation: '', bride_family_income: '',
        bride_introduced_by: '', bride_introduced_by_phone: '',
        bride_religion: '', bride_caste: '', bride_occupation: '', bride_education: '',
        family_contact_name: '', family_contact_phone: '', family_address: '',
        application_date: new Date().toLocaleDateString('sv-SE'),
        form_number: '',
        notes: '',
    })

    const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

    // Recompute errors whenever form changes
    React.useEffect(() => {
        setErrors(validateAll(form))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form])

    // Helper: does a given main tab have any errors (touched or not)?
    const tabHasErrors = (tab: Tab): boolean => {
        const allErrors = validateAll(form)
        const prefix = tab === 'groom' ? 'groom' : tab === 'bride' ? 'bride' : null
        if (!prefix) return false
        return Object.keys(allErrors).some(k => k.startsWith(prefix))
    }


    // Load countries on mount
    useEffect(() => {
        groupMarriageService.getCountries()
            .then(res => {
                if (res.success && res.data) {
                    setCountries(res.data)
                    // If India exists, pre-load states for India (both groom and bride)
                    const india = res.data.find(c => c.name.toLowerCase() === 'india')
                    if (india) {
                        groupMarriageService.getStates(india.id)
                            .then(sRes => {
                                if (sRes.success && sRes.data) {
                                    setGroomStates(sRes.data)
                                    setBrideStates(sRes.data)
                                }
                            })
                    }
                }
            })
            .catch(console.error)
    }, [])

    const handleGroomCountryChange = async (countryName: string) => {
        set('groom_country', countryName)
        set('groom_state', '')
        const matched = countries.find(c => c.name === countryName)
        if (matched) {
            try {
                const sRes = await groupMarriageService.getStates(matched.id)
                if (sRes.success) setGroomStates(sRes.data)
            } catch (err) {
                console.error(err)
            }
        } else {
            setGroomStates([])
        }
    }

    const handleBrideCountryChange = async (countryName: string) => {
        set('bride_country', countryName)
        set('bride_state', '')
        const matched = countries.find(c => c.name === countryName)
        if (matched) {
            try {
                const sRes = await groupMarriageService.getStates(matched.id)
                if (sRes.success) setBrideStates(sRes.data)
            } catch (err) {
                console.error(err)
            }
        } else {
            setBrideStates([])
        }
    }

    // Zipcode lookup Groom
    useEffect(() => {
        const pin = form.groom_zipcode
        if (/^\d{6}$/.test(pin)) {
            groupMarriageService.lookupPincode(pin)
                .then(async (res) => {
                    if (res.success && res.data) {
                        const { city, state, country } = res.data
                        set('groom_city', city)
                        
                        const matchedCountry = countries.find(c => c.name.toLowerCase() === country.toLowerCase())
                        if (matchedCountry) {
                            set('groom_country', matchedCountry.name)
                            const sRes = await groupMarriageService.getStates(matchedCountry.id)
                            if (sRes.success && sRes.data) {
                                setGroomStates(sRes.data)
                                const matchedState = sRes.data.find(s => s.name.toLowerCase() === state.toLowerCase())
                                if (matchedState) {
                                    set('groom_state', matchedState.name)
                                } else {
                                    set('groom_state', state)
                                }
                            }
                        } else {
                            set('groom_country', country)
                            set('groom_state', state)
                        }
                    }
                })
                .catch(console.error)
        }
    }, [form.groom_zipcode, countries])

    // Zipcode lookup Bride
    useEffect(() => {
        const pin = form.bride_zipcode
        if (/^\d{6}$/.test(pin)) {
            groupMarriageService.lookupPincode(pin)
                .then(async (res) => {
                    if (res.success && res.data) {
                        const { city, state, country } = res.data
                        set('bride_city', city)
                        
                        const matchedCountry = countries.find(c => c.name.toLowerCase() === country.toLowerCase())
                        if (matchedCountry) {
                            set('bride_country', matchedCountry.name)
                            const sRes = await groupMarriageService.getStates(matchedCountry.id)
                            if (sRes.success && sRes.data) {
                                setBrideStates(sRes.data)
                                const matchedState = sRes.data.find(s => s.name.toLowerCase() === state.toLowerCase())
                                if (matchedState) {
                                    set('bride_state', matchedState.name)
                                } else {
                                    set('bride_state', state)
                                }
                            }
                        } else {
                            set('bride_country', country)
                            set('bride_state', state)
                        }
                    }
                })
                .catch(console.error)
        }
    }, [form.bride_zipcode, countries])

    // Calculate groom age from DOB
    useEffect(() => {
        const dob = form.groom_dob
        if (dob) {
            const birthDate = new Date(dob)
            if (!isNaN(birthDate.getTime())) {
                const today = new Date()
                let age = today.getFullYear() - birthDate.getFullYear()
                const m = today.getMonth() - birthDate.getMonth()
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--
                }
                if (age >= 0) {
                    set('groom_age', age.toString())
                }
            }
        }
    }, [form.groom_dob])

    // Calculate bride age from DOB
    useEffect(() => {
        const dob = form.bride_dob
        if (dob) {
            const birthDate = new Date(dob)
            if (!isNaN(birthDate.getTime())) {
                const today = new Date()
                let age = today.getFullYear() - birthDate.getFullYear()
                const m = today.getMonth() - birthDate.getMonth()
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--
                }
                if (age >= 0) {
                    set('bride_age', age.toString())
                }
            }
        }
    }, [form.bride_dob])

    useEffect(() => {
        const loadEvent = async () => {
            try {
                // Fetch group marriage events from service
                const res = await groupMarriageService.listEvents({ status: 'published' })
                if (res.data && res.data.length > 0) {
                    setEvent(res.data[0])
                } else {
                    // Fallback to searching general events if endpoint returns empty list
                    const genEvents = await eventService.getEvents({ status: 'published' })
                    const massMarriage = genEvents.data?.find(e => 
                        e.event_type?.toLowerCase() === 'group_marriage' || 
                        e.slug.includes('marriage') ||
                        e.title.toLowerCase().includes('marriage')
                    )
                    if (massMarriage) {
                        setEvent({
                            id: massMarriage.id,
                            title: massMarriage.title,
                            slug: massMarriage.slug,
                            location: massMarriage.location,
                            start_datetime: massMarriage.start_datetime,
                            end_datetime: massMarriage.end_datetime,
                            event_type: 'group_marriage',
                            status: massMarriage.status
                        })
                    }
                }
            } catch (err) {
                console.error('Failed to load group marriage events:', err)
            } finally {
                setLoadingEvent(false)
            }
        }
        loadEvent()
    }, [])

    const handleSubmit = async () => {
        if (!event) {
            setError('No active group marriage event found to register under.')
            return
        }
        // Touch all fields and validate
        touchAll()
        const currentErrors = validateAll(form)
        setErrors(currentErrors)
        if (Object.keys(currentErrors).length > 0) {
            // Navigate to the first tab/subtab that has an error
            const groomFields = ['groom_first_name', 'groom_dob', 'groom_age', 'groom_phone', 'groom_address', 'groom_city', 'groom_zipcode', 'groom_aadhaar']
            const brideFields = ['bride_first_name', 'bride_dob', 'bride_age', 'bride_phone', 'bride_address', 'bride_city', 'bride_zipcode', 'bride_aadhaar']
            const hasGroomErr = groomFields.some(f => currentErrors[f])
            const hasBrideErr = brideFields.some(f => currentErrors[f])

            if (hasGroomErr) {
                setActiveTab('groom')
                if (currentErrors.groom_first_name || currentErrors.groom_dob || currentErrors.groom_age || currentErrors.groom_phone) {
                    setGroomSubTab('personal')
                } else if (currentErrors.groom_address || currentErrors.groom_city || currentErrors.groom_zipcode) {
                    setGroomSubTab('address')
                } else if (currentErrors.groom_aadhaar) {
                    setGroomSubTab('verification')
                }
            } else if (hasBrideErr) {
                setActiveTab('bride')
                if (currentErrors.bride_first_name || currentErrors.bride_dob || currentErrors.bride_age || currentErrors.bride_phone) {
                    setBrideSubTab('personal')
                } else if (currentErrors.bride_address || currentErrors.bride_city || currentErrors.bride_zipcode) {
                    setBrideSubTab('address')
                } else if (currentErrors.bride_aadhaar) {
                    setBrideSubTab('verification')
                }
            }
            setError('Please fix the highlighted errors before submitting.')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const payload: any = {
                ...form,
                groom_age: form.groom_age ? Number(form.groom_age) : undefined,
                bride_age:  form.bride_age  ? Number(form.bride_age)  : undefined,
                groom_family_income: form.groom_family_income ? Number(form.groom_family_income) : undefined,
                bride_family_income: form.bride_family_income ? Number(form.bride_family_income) : undefined,
                groom_dob: form.groom_dob || undefined,
                bride_dob:  form.bride_dob  || undefined,
                application_date: form.application_date || undefined,
                documents: documents,
            }
            const res = await groupMarriageService.registerCouple(event.id, payload)
            if (res.success) {
                setSuccess(true)
            } else {
                setError(res.message || 'Failed to submit registration')
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        // Touch and validate the current sub-tab before advancing
        if (activeTab === 'groom') {
            touchAllFieldsForTab('groom', groomSubTab)
            const currentErrors = validateAll(form)
            setErrors(currentErrors)
            // Check if current sub-tab has errors (only for fields in this sub-tab)
            const subTabFields: Record<SubTabType, string[]> = {
                personal: ['groom_photo_url', 'groom_first_name', 'groom_last_name', 'groom_dob', 'groom_age', 'groom_phone'],
                address: ['groom_address', 'groom_city', 'groom_zipcode'],
                employment: [],
                verification: ['groom_aadhaar'],
                documents: [],
            }
            const currentSubTabErrors = subTabFields[groomSubTab].filter(f => currentErrors[f])
            if (currentSubTabErrors.length > 0) return // stay on current sub-tab

            const idx = SUB_TABS.indexOf(groomSubTab)
            if (idx < SUB_TABS.length - 1) {
                setGroomSubTab(SUB_TABS[idx + 1])
            } else {
                setActiveTab('bride')
                setBrideSubTab('personal')
            }
        } else if (activeTab === 'bride') {
            touchAllFieldsForTab('bride', brideSubTab)
            const currentErrors = validateAll(form)
            setErrors(currentErrors)
            const subTabFields: Record<SubTabType, string[]> = {
                personal: ['bride_photo_url', 'bride_first_name', 'bride_last_name', 'bride_dob', 'bride_age', 'bride_phone'],
                address: ['bride_address', 'bride_city', 'bride_zipcode'],
                employment: [],
                verification: ['bride_aadhaar'],
                documents: [],
            }
            const currentSubTabErrors = subTabFields[brideSubTab].filter(f => currentErrors[f])
            if (currentSubTabErrors.length > 0) return // stay on current sub-tab

            const idx = SUB_TABS.indexOf(brideSubTab)
            if (idx < SUB_TABS.length - 1) {
                setBrideSubTab(SUB_TABS[idx + 1])
            } else {
                setActiveTab('family')
            }
        } else {
            const nextIdx = tabIdx + 1
            if (nextIdx < TABS.length) {
                setActiveTab(TABS[nextIdx].key)
            }
        }
    }

    const handlePrevious = () => {
        if (activeTab === 'groom') {
            const idx = SUB_TABS.indexOf(groomSubTab)
            if (idx > 0) {
                setGroomSubTab(SUB_TABS[idx - 1])
            }
        } else if (activeTab === 'bride') {
            const idx = SUB_TABS.indexOf(brideSubTab)
            if (idx > 0) {
                setBrideSubTab(SUB_TABS[idx - 1])
            } else {
                setActiveTab('groom')
                setGroomSubTab('documents')
            }
        } else if (activeTab === 'family') {
            setActiveTab('bride')
            setBrideSubTab('documents')
        } else if (activeTab === 'notes') {
            setActiveTab('family')
        }
    }

    const tabIdx = TABS.findIndex(t => t.key === activeTab)
    const isLast = tabIdx === TABS.length - 1
    const isFirstStep = activeTab === 'groom' && groomSubTab === 'personal'

    return (
        <div className="bg-gradient-to-br from-[#fffcf8] via-[#fdf7f2] to-[#fff5ee] min-h-screen">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">


                <div className="mb-8">
                    <span className="bg-primary-50 text-primary-600 border border-primary-200/60 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Social Welfare Program</span>
                    <h1 className="text-3xl sm:text-4xl font-display font-black text-navy-900 tracking-tight mt-3">Group Marriage Application</h1>
                    <p className="text-gray-600 text-sm mt-1 max-w-xl font-medium">Register for our upcoming mass marriage festival. All applications are reviewed by our community volunteers.</p>
                </div>

                {loadingEvent ? (
                    <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : !event ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <AlertCircle className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-navy-900">Registration opening soon..</h3>
                        <p className="text-gray-500 text-xs mt-1.5 max-w-sm mx-auto">There are no upcoming scheduled Mass Marriage events accepting applications at the moment. Please contact our support team for offline inquiry.</p>
                    </div>
                ) : success ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-500/10">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-navy-900">Application Submitted Successfully</h3>
                            <p className="text-gray-500 text-xs mt-2 max-w-md mx-auto">Thank you for registering under the **&ldquo;{event.title}&rdquo;** event. Our community desk will review your details and reach out on the registered phone numbers.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 max-w-md mx-auto space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-navy-900 border-b border-gray-200 pb-1.5">Next Steps &amp; Required Documents</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Please ensure you have physical copies of the following ready for our volunteers during verification:</p>
                            <ul className="list-disc list-inside text-gray-700 text-[10px] font-bold space-y-1">
                                <li>Aadhaar Card (both Groom and Bride)</li>
                                <li>Birth Certificate or School Leaving Certificate (Age Proof)</li>
                                <li>Caste Certificate (if claiming benefits)</li>
                                <li>Ration Card (Yellow/Orange)</li>
                                <li>2 Passport-sized Photographs each</li>
                            </ul>
                        </div>
                        <div className="pt-2">
                            <Link href="/services" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary-500/20">
                                Return to Services
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Event details card */}
                        <div className="bg-white border border-primary-100/80 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-navy-900 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500">
                                    <Heart size={18} className="fill-current" />
                                </div>
                                <div>
                                    <div className="text-[9px] text-primary-600 font-black uppercase tracking-widest">Active Mass Marriage Event</div>
                                    <div className="text-sm font-bold text-navy-900">{event.title}</div>
                                </div>
                            </div>
                            <div className="flex flex-col text-left sm:text-right gap-1 font-semibold text-[10px] text-gray-500">
                                {event.location && <span className="flex items-center gap-1 sm:justify-end"><MapPin size={10} className="text-primary-500" /> {event.location}</span>}
                                <span className="flex items-center gap-1 sm:justify-end"><Calendar size={10} className="text-primary-500" /> {new Date(event.start_datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-bold">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}



                        {/* Tab Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
                            {/* Tab Bar */}
                            <div className="flex border-b border-gray-100 overflow-x-auto">
                                {TABS.map(({ key, label, icon: Icon, color }) => {
                                    const hasErr = tabHasErrors(key)
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setActiveTab(key)}
                                            className={`relative flex items-center gap-1.5 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                                                activeTab === key
                                                    ? 'border-primary-500 text-navy-900 bg-gray-50/50'
                                                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/30'
                                            }`}
                                        >
                                            <Icon size={11} className={activeTab === key ? color : ''} />
                                            {label}
                                            {hasErr && Object.keys(touched).length > 0 && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5 flex-shrink-0" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 sm:p-8">
                                {activeTab === 'groom' && (
                                    <PersonTab
                                        prefix="groom"
                                        form={form}
                                        set={set}
                                        countries={countries}
                                        states={groomStates}
                                        handleCountryChange={handleGroomCountryChange}
                                        documents={documents}
                                        setDocuments={setDocuments}
                                        uploadingTypes={uploadingTypes}
                                        setUploadingTypes={setUploadingTypes}
                                        subTab={groomSubTab}
                                        setSubTab={setGroomSubTab}
                                        errors={errors}
                                        touched={touched}
                                        onBlur={onBlur}
                                    />
                                )}
                                {activeTab === 'bride' && (
                                    <PersonTab
                                        prefix="bride"
                                        form={form}
                                        set={set}
                                        countries={countries}
                                        states={brideStates}
                                        handleCountryChange={handleBrideCountryChange}
                                        documents={documents}
                                        setDocuments={setDocuments}
                                        uploadingTypes={uploadingTypes}
                                        setUploadingTypes={setUploadingTypes}
                                        subTab={brideSubTab}
                                        setSubTab={setBrideSubTab}
                                        errors={errors}
                                        touched={touched}
                                        onBlur={onBlur}
                                    />
                                )}

                                {activeTab === 'family' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Contact Person Name">
                                            <input value={form.family_contact_name} onChange={e => set('family_contact_name', e.target.value)} placeholder="Parent / guardian name" className={inputCls} />
                                        </Field>
                                        <Field label="Contact Phone">
                                            <input value={form.family_contact_phone} onChange={e => set('family_contact_phone', e.target.value)} placeholder="Phone number" className={inputCls} />
                                        </Field>
                                        <div className="sm:col-span-2">
                                            <Field label="Contact Address">
                                                <textarea value={form.family_address} onChange={e => set('family_address', e.target.value)} rows={3} placeholder="Full correspondence address" className={inputCls + ' resize-none'} />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="space-y-2">
                                        <Field label="Additional Remarks">
                                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={6} placeholder="Any specific requirements, medical considerations, or questions for our coordinators…" className={inputCls + ' resize-none'} />
                                        </Field>
                                        <p className="text-[10px] text-gray-400">These notes will help us coordinate your requirements better.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer nav */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={isFirstStep}
                                    className="px-4 py-2 border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {TABS.map(t => (
                                        <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                                            className={`rounded-full transition-all ${activeTab === t.key ? 'w-5 h-2 bg-primary-500' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`} />
                                    ))}
                                </div>

                                {isLast ? (
                                    <button type="button" onClick={handleSubmit} disabled={loading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20">
                                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Heart size={12} />}
                                        Submit Registration
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleNext}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all">
                                        Next <ChevronRight size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick submit bar */}
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleSubmit} disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20">
                                {loading ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} />}
                                Submit Registration
                            </button>
                            <Link href="/services" className="px-6 py-3 border border-gray-100 bg-white rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">
                                Cancel
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
