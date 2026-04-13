'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import { volunteerService, Volunteer } from '@/services/volunteer.service'
import { User, Check, X, Eye, X as CloseIcon, FileText, Download, ExternalLink, ChevronLeft, ChevronRight, Edit, Image as ImageIcon, Upload, PlusCircle, Paperclip, Scan } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { fundraiserService } from '@/services/fundraiser.service'
import ImageEditor from '@/components/ImageEditor'
import { fixImageUrl, fixObjectUrls } from '@/lib/image-utils'
import { payrollService, Designation } from '@/services/payroll.service'

// ─── Constants ───────────────────────────────────────────────────────────────
const NGO_REG = 'Maharashtra State, Mumbai 2018 / GBBSD / 1566 / 2018'
const NGO_ADDRESS = 'Shop No. 09, Bldg. No. R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara, Jogeshwari (W), Mumbai 400102. Maharashtra. INDIA.'
const NGO_ADDRESS_FULL = 'Shop No. 09, Bldg. No. R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara, Jogeshwari (W), Mumbai – 400 102.'

// Watermark pattern component
const WatermarkPattern = () => (
    <div className="absolute pointer-events-none select-none flex flex-col justify-center gap-5 transform -rotate-[25deg] opacity-[0.25]" style={{ left: '-50%', top: '-50%', width: '200%', height: '200%', zIndex: 0 }}>
        {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap flex gap-3 w-full" style={{ transform: i % 2 === 0 ? 'translateX(-10px)' : 'translateX(-40px)' }}>
                {Array.from({ length: 18 }).map((_, j) => (
                    <span key={j} className="text-[#26b4b1] font-extrabold text-[12.5px] tracking-[0.03em]">
                        ZIDDI MUMBAIKAR (NGO)
                    </span>
                ))}
            </div>
        ))}
    </div>
)

// Status config
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    approved: { label: 'Approved', bg: 'bg-blue-50', text: 'text-blue-700' },
    active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
    inactive: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-600' },
    rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600' },
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatDOB(dob?: string) {
    if (!dob) return '—'
    const d = new Date(dob)
    if (isNaN(d.getTime())) return dob
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function formatIdNo(id: string) {
    if (!id) return 'ZM-?????';
    return `ZM-${id.substring(id.length - 5).toUpperCase()}`
}

// ─── Front face of the ID card ────────────────────────────────────────────────
function IDCardFront({ v, index }: { v: Volunteer; index: number }) {
    const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ').toUpperCase()
    const initials = [v.first_name?.[0], v.last_name?.[0]].filter(Boolean).join('').toUpperCase()

    return (
        <div
            className="id-card-front relative overflow-hidden rounded-xl border border-gray-200 select-none bg-white shadow-md shadow-orange-500/5"
            style={{
                width: '340px',
                height: '214px',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                flexShrink: 0,
            }}
        >
            <WatermarkPattern />

            {/* ── Orange Header Section ────────────────────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-[#FF8A00] relative z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-orange-600/20 transform skew-x-[35deg] translate-x-12"></div>
                <div className="flex items-center gap-2.5 px-3 py-2 h-full">
                    {/* NGO Logo */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white p-0.5 shadow-sm border border-orange-500/20 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.webp" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    {/* Title & Registration */}
                    <div className="flex flex-col">
                        <span className="font-extrabold text-white leading-none tracking-tight" style={{ fontSize: '13px' }}>
                            ZIDDI MUMBAIKAR (NGO)
                        </span>
                        <span className="text-white/80 font-bold mt-1" style={{ fontSize: '6px' }}>
                            Reg No: {NGO_REG}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Contact Bar ──────────────────────────────────────────────────── */}
            <div className="absolute top-14 left-0 right-0 py-1 bg-navy-900 z-10 text-center">
                <p className="text-white/90 font-medium px-2 leading-tight" style={{ fontSize: '5.5px', letterSpacing: '0.05em' }}>
                    {NGO_ADDRESS}
                </p>
            </div>

            {/* ── Body Content ─────────────────────────────────────────────────── */}
            <div className="relative z-0 flex gap-2 px-3 pt-[30px] h-full">
                {/* Profile Photo */}
                <div className="flex-shrink-0 pt-2">
                    <div
                        className="border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm"
                        style={{ width: '100px', height: '100px', borderRadius: '5px' }}
                    >
                        {v.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={fixImageUrl(v.photo_url)} alt={fullName} className="w-full h-full object-cover object-top" />
                        ) : (
                            <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                <span className="text-2xl font-black text-orange-200">{initials}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Information Grid */}
                <div className="flex-1 flex flex-col pt-1 pb-1">
                    <div className="mb-1">
                        <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '8px' }}>Name</p>
                        <p className="text-black font-black tracking-tight leading-none" style={{ fontSize: '13px' }}>{fullName}</p>
                    </div>

                    {v.designation?.name && (
                        <div className="mb-1">
                            <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '8px' }}>Designation</p>
                            <p className="text-black font-black leading-none" style={{ fontSize: '13px' }}>{v.designation.name}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5">
                        <div className="space-y-0 text-left">
                            <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '8px' }}>Date of Birth</p>
                            <p className="text-black font-bold leading-none" style={{ fontSize: '9px' }}>{formatDOB(v.date_of_birth)}</p>
                        </div>
                        <div className="space-y-0 text-left">
                            <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '8px' }}>ID</p>
                            <p className="text-black font-black leading-none" style={{ fontSize: '9px' }}>{formatIdNo(v.id)}</p>
                        </div>
                        <div className="space-y-0 text-left">
                            <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '8px' }}>Gender</p>
                            <p className="text-black font-bold uppercase leading-none" style={{ fontSize: '9px' }}>{v.gender || '—'}</p>
                        </div>
                        <div className="space-y-0 text-left">
                            <p className="text-[#929292] font-black uppercase tracking-tighter" style={{ fontSize: '5px' }}>Contact</p>
                            <p className="text-black font-bold leading-none" style={{ fontSize: '9px' }}>{v.phone || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tagline */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#FF8A00]"></div>
        </div>
    )
}

// ─── Back face of the ID card ─────────────────────────────────────────────────
function IDCardBack({ v }: { v: Volunteer }) {
    const fullAddress = [v.address, v.city].filter(Boolean).join(', ')

    return (
        <div
            className="id-card-back relative overflow-hidden rounded-xl border border-gray-200 select-none bg-white shadow-md"
            style={{
                width: '340px',
                height: '214px',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                flexShrink: 0,
            }}
        >
            <WatermarkPattern />

            {/* Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none grayscale">
                <img src="/logo.webp" alt="" className="w-32 h-32 object-contain" />
            </div>

            <div className="relative z-10 h-full flex flex-col p-4">
                {/* Header Back */}
                <div className="mb-4">
                    <p className="text-navy-900 font-black text-[9px] uppercase tracking-widest mb-1">Permanent Address</p>
                    <p className="text-gray-600 font-medium leading-relaxed" style={{ fontSize: '9px' }}>
                        {fullAddress || NGO_ADDRESS_FULL}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-auto">
                    {/* <div>
                        <p className="text-navy-900 font-black text-[8px] uppercase tracking-widest mb-1">{v.designation?.name ? 'Designation' : 'Occupation'}</p>
                        <p className="text-gray-700 font-bold uppercase" style={{ fontSize: '9px' }}>{v.designation?.name || v.occupation || 'Volunteer'}</p>
                    </div> */}
                    <div>
                        <p className="text-navy-900 font-black text-[8px] uppercase tracking-widest mb-1">Availability</p>
                        <p className="text-gray-700 font-bold uppercase" style={{ fontSize: '9px' }}>{v.availability || 'Weekends'}</p>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-end justify-between border-t border-gray-100 pt-3 mt-4">
                    {/* Social links */}
                    <div className="space-y-1.5 flex flex-col">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-50 rounded flex items-center justify-center">
                                <svg className="w-2 h-2 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                                </svg>
                            </div>
                            <span className="text-gray-500 font-bold tracking-tighter" style={{ fontSize: '7px' }}>ziddi_mumbaikar_ngo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-50 rounded flex items-center justify-center">
                                <svg className="w-2 h-2 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <span className="text-gray-500 font-bold tracking-tighter" style={{ fontSize: '7px' }}>ziddimumbaikarngo</span>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="relative text-center pb-2">
                        <div className="h-10 w-24 border-b border-navy-900/20 mb-1 flex items-center justify-center relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/sign.jpeg" alt="President Signature" className="h-10 w-auto object-contain mix-blend-multiply shadow-sm" />
                        </div>
                        <p className="text-navy-900 font-black uppercase tracking-widest" style={{ fontSize: '6px' }}>President Signature</p>
                    </div>
                </div>
            </div>
            {/* Bottom Accent */}
            <div className="absolute top-0 right-0 w-20 h-2 bg-orange-500 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-20 h-2 bg-navy-900 rounded-tr-full"></div>
        </div>
    )
}

// ─── Paired card (front + back for one volunteer) ─────────────────────────────
function VolunteerIDCardPair({ v, index, selected, onToggle, onPrintSingle }: {
    v: Volunteer
    index: number
    selected: boolean
    onToggle: () => void
    onPrintSingle: () => void
}) {
    const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ')
    return (
        <div className={`relative flex flex-col gap-0 transition-all rounded-2xl ${selected ? 'ring-4 ring-primary-500 ring-offset-2 shadow-lg shadow-primary-100' : 'shadow-sm hover:shadow-md'
            }`}>
            {/* ── Card header: checkbox + name + single-print button ── */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-t-2xl border border-b-0 ${selected ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'
                }`}>
                {/* Checkbox */}
                <label
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        onClick={onToggle}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all cursor-pointer ${selected
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white border-gray-300 hover:border-primary-400'
                            }`}
                    >
                        {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{fullName}</p>
                        <p className="text-[10px] text-gray-400">{formatIdNo(v.id)}</p>
                    </div>
                </label>

                {/* Single-print button */}
                <button
                    onClick={onPrintSingle}
                    title="Print this card only"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                </button>
            </div>

            {/* ── Card faces ── */}
            <div className={`flex flex-col lg:flex-row gap-0 border border-t-0 rounded-b-2xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-gray-100 ${selected ? 'border-primary-200' : 'border-gray-200'
                }`}>
                {/* Front Section */}
                <div className="flex-1 bg-gray-50 pb-4 overflow-x-auto custom-scrollbar">
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Front</p>
                    </div>
                    <div className="px-4 min-w-fit">
                        <IDCardFront v={v} index={index} />
                    </div>
                </div>

                {/* Back Section */}
                <div className="flex-1 bg-gray-50 pb-4 overflow-x-auto custom-scrollbar">
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Back</p>
                    </div>
                    <div className="px-4 min-w-fit">
                        <IDCardBack v={v} />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Volunteer Details Modal ──────────────────────────────────────────────────
function VolunteerDetailsModal({ volunteer, onClose, onUpdateStatus, loadingId }: {
    volunteer: Volunteer,
    onClose: () => void,
    onUpdateStatus: (id: string, status: string) => void,
    loadingId: string | null
}) {
    const isUpdating = loadingId === volunteer.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-navy-900">Volunteer Details</h2>
                            <p className="text-xs text-gray-500 font-medium">Application from {new Date(volunteer.created_at || '').toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Full Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.first_name} {volunteer.last_name}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Email</p>
                                    <p className="text-sm font-semibold text-gray-900 break-all">{volunteer.email}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Phone</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.phone}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">DOB & Gender</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDOB(volunteer.date_of_birth)} · {volunteer.gender || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location & Occupation */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Background</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl sm:col-span-2">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Address</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.address}, {volunteer.city}, {volunteer.state} {volunteer.zip_code}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Occupation</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.occupation || 'Not specified'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Designation</p>
                                    <p className="text-sm font-semibold text-primary-600 font-bold uppercase">{volunteer.designation?.name || 'Volunteer'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Availability</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.availability || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills & Motivation */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Interests & Motivation</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {volunteer.skills?.length ? (
                                            volunteer.skills.map(s => (
                                                <span key={s} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-md text-[11px] font-bold shadow-sm">{s}</span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No specific skills listed</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Role Interest</p>
                                    <p className="text-sm font-semibold text-gray-900">{volunteer.role_interest || 'General Volunteer'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Motivation / Why join us?</p>
                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{volunteer.motivation || 'No motivation statement provided.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Declarations</h3>
                            <div className="bg-gray-50 p-3 rounded-xl flex items-start gap-3">
                                <div className={`mt-0.5 p-1 rounded-full ${volunteer.background_check_consent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {volunteer.background_check_consent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Background Check Consent</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {volunteer.background_check_consent
                                            ? "The applicant has consented to a background check."
                                            : "The applicant did NOT consent to a background check."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Documents & ID Proof</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* ID Proof */}
                                {volunteer.id_proof_url && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">ID Proof</p>
                                                <p className="text-xs font-bold text-navy-900">Aadhar/PAN/etc.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <a
                                                href={fixImageUrl(volunteer.id_proof_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View
                                            </a>
                                            <a
                                                href={fixImageUrl(volunteer.id_proof_url)}
                                                download
                                                className="w-9 h-9 flex items-center justify-center bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Photo */}
                                {volunteer.photo_url && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={fixImageUrl(volunteer.photo_url)} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Photo</p>
                                                <p className="text-xs font-bold text-navy-900">Passport Size</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <a
                                                href={fixImageUrl(volunteer.photo_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View
                                            </a>
                                            <a
                                                href={fixImageUrl(volunteer.photo_url)}
                                                download
                                                className="w-9 h-9 flex items-center justify-center bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Documents */}
                                {volunteer.documents && volunteer.documents.map((doc, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 group relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-navy-600 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Document</p>
                                                <p className="text-xs font-bold text-navy-900 truncate" title={doc.name}>{doc.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto">
                                            <a
                                                href={fixImageUrl(doc.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View
                                            </a>
                                            <a
                                                href={fixImageUrl(doc.url)}
                                                download={doc.name}
                                                className="w-9 h-9 flex items-center justify-center bg-navy-50 rounded-lg text-navy-600 hover:bg-navy-100 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status:</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${STATUS_CONFIG[volunteer.status]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[volunteer.status]?.text || 'text-gray-700'}`}>
                            {STATUS_CONFIG[volunteer.status]?.label || volunteer.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                            Close
                        </button>
                        {volunteer.status === 'applied' && (
                            <>
                                <button
                                    onClick={() => { onUpdateStatus(volunteer.id, 'rejected'); onClose(); }}
                                    disabled={isUpdating}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => { onUpdateStatus(volunteer.id, 'approved'); onClose(); }}
                                    disabled={isUpdating}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                            </>
                        )}
                        {(volunteer.status === 'approved' || volunteer.status === 'inactive') && (
                            <button
                                onClick={() => { onUpdateStatus(volunteer.id, 'active'); onClose(); }}
                                disabled={isUpdating}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" /> Mark Active
                            </button>
                        )}
                        {volunteer.status === 'active' && (
                            <button
                                onClick={() => { onUpdateStatus(volunteer.id, 'inactive'); onClose(); }}
                                disabled={isUpdating}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Mark Inactive
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


// ─── Edit Volunteer Modal ───────────────────────────────────────────────────
function EditVolunteerModal({
    volunteer,
    onClose,
    onSave
}: {
    volunteer: Volunteer
    onClose: () => void
    onSave: (id: string, data: any) => Promise<void>
}) {
    const [formData, setFormData] = useState({
        first_name: volunteer.first_name || '',
        last_name: volunteer.last_name || '',
        email: volunteer.email || '',
        phone: volunteer.phone || '',
        date_of_birth: volunteer.date_of_birth ? new Date(volunteer.date_of_birth).toISOString().split('T')[0] : '',
        gender: volunteer.gender || '',
        occupation: volunteer.occupation || '',
        availability: volunteer.availability || '',
        address: volunteer.address || '',
        city: volunteer.city || '',
        state: volunteer.state || 'Maharashtra',
        zip_code: volunteer.zip_code || '',
        role_interest: volunteer.role_interest || '',
        motivation: volunteer.motivation || '',
        photo_url: volunteer.photo_url || '',
        id_proof_url: volunteer.id_proof_url || '',
        designation_id: volunteer.designation_id || '',
    })
    const [designations, setDesignations] = useState<Designation[]>([])
    const [loadingDesignations, setLoadingDesignations] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchDesignations = async () => {
            setLoadingDesignations(true)
            try {
                const res = await payrollService.getDesignations()
                if (res.success) {
                    setDesignations(res.data)
                }
            } catch (error) {
                console.error('Failed to fetch designations:', error)
            } finally {
                setLoadingDesignations(false)
            }
        }
        fetchDesignations()
    }, [])
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [idProofFile, setIdProofFile] = useState<File | null>(null)
    const [editingFile, setEditingFile] = useState<{ file: File, type: 'id' | 'photo' } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            let photo_url = formData.photo_url
            let id_proof_url = formData.id_proof_url

            // Upload Photo if new file is selected
            if (photoFile) {
                const photoRes = await fundraiserService.uploadMedia(photoFile, 'volunteers', volunteer.id)
                if (photoRes.success && photoRes.data?.url) {
                    photo_url = photoRes.data.url
                }
            }

            // Upload ID Proof if new file is selected
            if (idProofFile) {
                const idRes = await fundraiserService.uploadMedia(idProofFile, 'volunteers', volunteer.id)
                if (idRes.success && idRes.data?.url) {
                    id_proof_url = idRes.data.url
                }
            }

            await onSave(volunteer.id, { ...formData, photo_url, id_proof_url })
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                            <Edit className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-navy-900">Edit Volunteer</h2>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">ID: {formatIdNo(volunteer.id)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">First Name</label>
                            <input
                                required
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Last Name</label>
                            <input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Email Address</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Phone Number</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Occupation</label>
                            <input
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Designation</label>
                            <select
                                name="designation_id"
                                value={formData.designation_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            >
                                <option value="">Select Designation</option>
                                {designations.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Availability</label>
                            <input
                                name="availability"
                                value={formData.availability}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Address</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Zip Code</label>
                            <input
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Role Interest</label>
                            <input
                                name="role_interest"
                                value={formData.role_interest}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Motivation</label>
                            <textarea
                                name="motivation"
                                rows={3}
                                value={formData.motivation}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-semibold text-navy-900 resize-none"
                            />
                        </div>
                    </div>

                    {/* Documents Upload */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Media & Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Passport Size Photo</label>
                                <div className="relative group">
                                    <div className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl group-hover:border-primary-300 transition-all flex items-center gap-3 relative min-h-[70px]">
                                        <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                            {photoFile ? (
                                                <img src={URL.createObjectURL(photoFile)} alt="New Photo" className="w-full h-full object-cover" />
                                            ) : formData.photo_url ? (
                                                <img src={fixImageUrl(formData.photo_url)} alt="Current Photo" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-navy-900 truncate">
                                                {photoFile ? photoFile.name : formData.photo_url ? 'Current Photo (Click to update)' : 'Upload Photo'}
                                            </p>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">2MB Limit · JPG/PNG</p>
                                        </div>
                                        <Upload className="w-4 h-4 text-gray-300" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) setEditingFile({ file, type: 'photo' })
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {(photoFile || formData.photo_url) && (
                                        <a
                                            href={photoFile ? URL.createObjectURL(photoFile) : fixImageUrl(formData.photo_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-navy-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                            title="View Original"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* ID Proof Upload */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">ID Proof (Aadhar/PAN)</label>
                                <div className="relative group">
                                    <div className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl group-hover:border-primary-300 transition-all flex items-center gap-3 relative min-h-[70px]">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-500 shadow-sm border border-gray-100">
                                            {idProofFile || formData.id_proof_url ? (
                                                <FileText className="w-5 h-5" />
                                            ) : (
                                                <Scan className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-navy-900 truncate">
                                                {idProofFile ? idProofFile.name : formData.id_proof_url ? 'Current ID Proof (Click to update)' : 'Upload ID Proof'}
                                            </p>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">5MB Limit · PDF/JPG/PNG</p>
                                        </div>
                                        <Upload className="w-4 h-4 text-gray-300" />
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    if (file.type.startsWith('image/')) {
                                                        setEditingFile({ file, type: 'id' })
                                                    } else {
                                                        setIdProofFile(file)
                                                    }
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {(idProofFile || formData.id_proof_url) && (
                                        <a
                                            href={idProofFile ? URL.createObjectURL(idProofFile) : fixImageUrl(formData.id_proof_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-navy-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                            title="View Original"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Image Editor Modal */}
                {editingFile && (
                    <ImageEditor
                        file={editingFile.file}
                        aspectRatio={editingFile.type === 'id' ? undefined : 1}
                        onSave={(editedFile) => {
                            if (editingFile.type === 'id') {
                                setIdProofFile(editedFile)
                            } else {
                                setPhotoFile(editedFile)
                            }
                            setEditingFile(null)
                        }}
                        onCancel={() => setEditingFile(null)}
                    />
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-400 hover:text-gray-600 font-black text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function VolunteersPageContent() {
    const { user, isLoggedIn } = useAuth()
    const router = useRouter()

    const [volunteers, setVolunteers] = useState<Volunteer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [printMode, setPrintMode] = useState(false)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [viewingVolunteer, setViewingVolunteer] = useState<Volunteer | null>(null)
    const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
    // printSingleId: when set, only this volunteer's card is printed
    const [printSingleId, setPrintSingleId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin') router.push('/')
    }, [isLoggedIn, user, router])

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') return
        const fetchAll = async () => {
            try {
                setLoading(true)
                const res = await volunteerService.getVolunteers()
                if (res.success) setVolunteers(fixObjectUrls(res.data) || [])
                else setError('Failed to load volunteers')
            } catch {
                setError('Failed to load volunteers. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [isLoggedIn, user])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [search, statusFilter])

    const filtered = volunteers.filter((v) => {
        const matchSearch =
            !search ||
            `${v.first_name} ${v.last_name} ${v.email} ${v.phone}`.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || v.status === statusFilter
        return matchSearch && matchStatus
    })

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginatedVolunteers = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const allSelected = filtered.length > 0 && filtered.every((v) => selected.has(v.id))
    const someSelected = filtered.some((v) => selected.has(v.id))

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelected(new Set())
        } else {
            setSelected(new Set(filtered.map((v) => v.id)))
        }
    }

    const handlePrintSingle = (v: Volunteer) => {
        setPrintSingleId(v.id)
        // Let React render first, then print
        setTimeout(() => {
            window.print()
            // After print dialog closes, clear single-print mode
            setTimeout(() => setPrintSingleId(null), 500)
        }, 150)
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            setUpdatingId(id)
            const res = await volunteerService.updateVolunteerStatus(id, status)
            if (res.success) {
                setVolunteers((prev) =>
                    prev.map((v) => (v.id === id ? { ...v, status: status as Volunteer['status'] } : v))
                )
                toast.success(`Status updated to ${status}`)
            }
        } catch {
            toast.error('Failed to update status')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleUpdateVolunteer = async (id: string, data: any) => {
        try {
            const res = await volunteerService.updateVolunteer(id, data)
            if (res.success) {
                setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...res.data } : v))
                toast.success('Volunteer details updated successfully')
            } else {
                toast.error(res.message || 'Failed to update volunteer')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred while updating')
        }
    }

    // What to actually print: single-card mode beats multi-select
    const printTargets = printSingleId
        ? volunteers.filter((v) => v.id === printSingleId)
        : filtered.filter((v) => selected.size === 0 || selected.has(v.id))

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Print-only layout ─────────────────────────────────────────────── */}
            <div className="hidden print:block">
                <style>{`
          @page { size: A4; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          .print-container { width: 100%; display: flex; flex-direction: column; gap: 10mm; align-items: center; padding: 5mm 0; }
          .card-pair { display: flex; gap: 5mm; break-inside: avoid; justify-content: center; width: 100%; }
        `}</style>
                <div className="print-container">
                    {printTargets.map((v) => (
                        <div key={v.id} className="card-pair">
                            <IDCardFront v={v} index={volunteers.indexOf(v)} />
                            <IDCardBack v={v} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Screen layout ─────────────────────────────────────────────────── */}
            <div className="print:hidden">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200 pt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/profile" className="hover:text-primary-500 transition-colors">Profile</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Volunteers</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Page title + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-navy-900">Volunteer Management</h1>
                            <p className="text-gray-500 text-sm mt-1">{volunteers.length} total volunteers registered</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {printMode ? (
                                <>
                                    <button
                                        onClick={() => { setPrintMode(false); setSelected(new Set()) }}
                                        className="px-5 py-2.5 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors"
                                    >
                                        ✕ Exit Print Mode
                                    </button>
                                    {someSelected && (
                                        <button
                                            onClick={() => setSelected(new Set())}
                                            className="px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-xl font-semibold text-sm hover:border-gray-300 transition-colors"
                                        >
                                            Clear ({selected.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.print()}
                                        className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        {someSelected ? `Print ${selected.size} Selected` : 'Print All Visible'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setPrintMode(true)}
                                    className="px-5 py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print ID Cards
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Print mode banner */}
                    {printMode && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-start gap-3 flex-1">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    <strong>Tip:</strong> Use the <strong>checkbox</strong> on each card to select for bulk print,
                                    or click the <strong>Print</strong> button on any card to print that one card immediately.
                                    {someSelected
                                        ? <> <span className="text-primary-700 font-black">{selected.size} card{selected.size !== 1 ? 's' : ''} selected.</span></>
                                        : ' No cards selected — will print all visible.'}
                                </span>
                            </div>
                            {/* Select-all toggle */}
                            <button
                                onClick={toggleSelectAll}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${allSelected
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white border-2 border-primary-300 text-primary-600 hover:bg-primary-50'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-white border-white' : 'border-current'
                                    }`}>
                                    {allSelected && <svg className="w-2.5 h-2.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email or phone…"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="approved">Approved</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 font-medium">No volunteers found</p>
                        </div>
                    ) : printMode ? (
                        /* ── Print mode: ID card pairs ─────────────────────────────────── */
                        <div className="grid grid-cols-1 gap-8">
                            {paginatedVolunteers.map((v) => (
                                <VolunteerIDCardPair
                                    key={v.id}
                                    v={v}
                                    index={volunteers.indexOf(v)}
                                    selected={selected.has(v.id)}
                                    onToggle={() => toggleSelect(v.id)}
                                    onPrintSingle={() => handlePrintSingle(v)}
                                />
                            ))}
                        </div>
                    ) : (
                        /* ── Normal mode: table ────────────────────────────────────────── */
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Volunteer</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:table-cell">Designation</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:table-cell">Contact</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden sm:table-cell">Joined</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">ID Card</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedVolunteers.map((v, i) => {
                                            const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG['applied']
                                            const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ')
                                            const initials = [v.first_name?.[0], v.last_name?.[0]].filter(Boolean).join('').toUpperCase()
                                            return (
                                                <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {v.photo_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={fixImageUrl(v.photo_url)} alt={fullName} className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-xs font-black text-primary-600">{initials}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{fullName}</p>
                                                                <p className="text-[11px] text-gray-400">
                                                                    {formatIdNo(v.id)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                                            {v.designation?.name || v.occupation || 'Volunteer'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        <p className="text-gray-700">{v.email}</p>
                                                        <p className="text-[11px] text-gray-400">{v.phone}</p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                                                            {cfg.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 hidden sm:table-cell text-[11px] text-gray-400">
                                                        {v.created_at
                                                            ? new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setViewingVolunteer(v)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingVolunteer(v)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" /> Edit
                                                            </button>
                                                            {(v.status === 'approved' || v.status === 'inactive') && (
                                                                <button
                                                                    onClick={() => handleStatusChange(v.id, 'active')}
                                                                    disabled={updatingId === v.id}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Mark Active
                                                                </button>
                                                            )}
                                                            {v.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(v.id, 'inactive')}
                                                                    disabled={updatingId === v.id}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Mark Inactive
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <button
                                                            onClick={() => handlePrintSingle(v)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors whitespace-nowrap"
                                                        >
                                                            <Download className="w-3 h-3" /> Print ID
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

                    {/* Pagination UI */}
                    {!loading && !error && filtered.length > 0 && totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200 gap-4">
                            <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
                                Showing <span className="text-gray-900 font-black">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-gray-900 font-black">{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)}</span> of <span className="text-gray-900 font-black">{filtered.length}</span> volunteers
                            </div>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors group"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        // Simple logic to show current, first, last, and neighbours if too many pages
                                        // For simplicity here, showing all if totalPages <= 7
                                        if (totalPages > 7) {
                                            if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                                                if (pageNum === 2 || pageNum === totalPages - 1) return <span key={i} className="px-1 text-gray-300">...</span>;
                                                return null;
                                            }
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-black transition-all ${currentPage === pageNum
                                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors group"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {viewingVolunteer && (
                    <VolunteerDetailsModal
                        volunteer={viewingVolunteer}
                        onClose={() => setViewingVolunteer(null)}
                        onUpdateStatus={handleStatusChange}
                        loadingId={updatingId}
                    />
                )}

                {editingVolunteer && (
                    <EditVolunteerModal
                        volunteer={editingVolunteer}
                        onClose={() => setEditingVolunteer(null)}
                        onSave={handleUpdateVolunteer}
                    />
                )}

                <Footer />
            </div>
        </div>
    )
}

export default function VolunteersAdminPage() {
    return (
        <ProtectedRoute>
            <VolunteersPageContent />
        </ProtectedRoute>
    )
}
