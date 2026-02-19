'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Footer from '@/components/Footer'
import { volunteerService, Volunteer } from '@/services/volunteer.service'

// ─── Constants ───────────────────────────────────────────────────────────────
const NGO_REG = 'Maharashtra State, Mumbai 2018 / GBBSD / 1566 / 2018'
const NGO_ADDRESS = 'Shop No. 09, Bldg. No. R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara, Jogeshwari (W), Mumbai 400102. Maharashtra. INDIA.'
const NGO_ADDRESS_FULL = 'Shop No. 09, Bldg. No. R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara, Jogeshwari (W), Mumbai – 400 102.'

// Watermark SVG pattern as data URI
const WATERMARK_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='90'%3E%3Ctext transform='rotate(-28 140 45)' x='-30' y='52' font-size='11' fill='%231a4fa0' opacity='0.07' font-family='Arial' font-weight='bold' letter-spacing='1'%3EZIDDI MUMBAIKAR (NGO)%3C/text%3E%3C/svg%3E")`

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

function formatIdNo(index: number) {
    return `ZM-${String(index + 1).padStart(4, '0')}`
}

// ─── Front face of the ID card ────────────────────────────────────────────────
function IDCardFront({ v, index }: { v: Volunteer; index: number }) {
    const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ').toUpperCase()
    const initials = [v.first_name?.[0], v.last_name?.[0]].filter(Boolean).join('').toUpperCase()

    return (
        <div
            className="id-card-front relative overflow-hidden rounded-lg border border-gray-300 select-none"
            style={{
                width: '340px',
                height: '214px',
                backgroundColor: '#ffffff',
                backgroundImage: WATERMARK_BG,
                fontFamily: 'Arial, sans-serif',
                flexShrink: 0,
            }}
        >
            {/* ── Header: NGO Name + Logo ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-2 pt-1.5 pb-1" style={{ background: 'transparent' }}>
                {/* Logo circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 shadow-md bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.webp" alt="Logo" className="w-full h-full object-cover" />
                </div>
                {/* Title */}
                <div className="flex-1 text-center leading-tight" style={{ marginRight: '8px' }}>
                    <p
                        className="font-black leading-none"
                        style={{
                            fontSize: '18px',
                            color: '#FFD700',
                            WebkitTextStroke: '0.8px #1a4fa0',
                            textShadow: '1px 1px 0 #1a4fa0, -0.5px -0.5px 0 #1a4fa0',
                            letterSpacing: '0.5px',
                        }}
                    >
                        ZIDDI MUMBAIKAR
                    </p>
                    <p
                        className="font-black"
                        style={{
                            fontSize: '13px',
                            color: '#FFD700',
                            WebkitTextStroke: '0.5px #1a4fa0',
                            textShadow: '1px 1px 0 #1a4fa0',
                            letterSpacing: '1px',
                        }}
                    >
                        (NGO)
                    </p>
                </div>
            </div>

            {/* ── Registration bar ────────────────────────────────────────────── */}
            <div
                className="text-center py-0.5 px-2"
                style={{ backgroundColor: '#1a4fa0' }}
            >
                <p className="text-white font-bold" style={{ fontSize: '7px', letterSpacing: '0.2px' }}>
                    Registration No. : {NGO_REG}
                </p>
            </div>

            {/* ── Office address strip ─────────────────────────────────────────── */}
            <div className="text-center px-2 py-0.5">
                <p className="text-gray-700" style={{ fontSize: '6.5px', lineHeight: '1.3' }}>
                    {NGO_ADDRESS}
                </p>
            </div>

            {/* ── Main body: Photo + Fields ─────────────────────────────────────── */}
            <div className="flex gap-3 px-2 pt-1" style={{ height: '112px' }}>
                {/* Photo */}
                <div
                    className="flex-shrink-0 border border-gray-400 overflow-hidden bg-gray-100 flex items-center justify-center"
                    style={{ width: '78px', height: '100px', borderRadius: '2px' }}
                >
                    {v.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.photo_url} alt={fullName} className="w-full h-full object-cover object-top" />
                    ) : (
                        <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-blue-300">{initials}</span>
                            <span className="text-[7px] text-blue-200 mt-1">PHOTO</span>
                        </div>
                    )}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2 pt-0.5">
                    {/* Name */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-700 font-semibold" style={{ fontSize: '8.5px', minWidth: '38px' }}>Name :</span>
                        <span className="font-black text-gray-900 leading-tight" style={{ fontSize: '9.5px', letterSpacing: '0.3px' }}>{fullName}</span>
                    </div>

                    {/* DOB + ID */}
                    <div className="flex items-baseline gap-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-gray-700 font-semibold" style={{ fontSize: '8.5px', minWidth: '22px' }}>DOB :</span>
                            <span className="font-bold text-gray-900" style={{ fontSize: '9px' }}>{formatDOB(v.date_of_birth)}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-gray-700 font-semibold" style={{ fontSize: '8.5px' }}>ID No. :</span>
                            <span className="font-black text-blue-800" style={{ fontSize: '9px' }}>{formatIdNo(index)}</span>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-700 font-semibold" style={{ fontSize: '8.5px', minWidth: '38px' }}>Gender :</span>
                        <span className="font-bold text-gray-900 uppercase" style={{ fontSize: '9.5px' }}>{v.gender || '—'}</span>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-700 font-semibold" style={{ fontSize: '8.5px', minWidth: '38px' }}>Mobile :</span>
                        <span className="font-black text-gray-900" style={{ fontSize: '9.5px', letterSpacing: '0.5px' }}>{v.phone}</span>
                    </div>

                    {/* Skills (small, if available) */}
                    {v.skills && v.skills.length > 0 && (
                        <div className="flex items-baseline gap-1">
                            <span className="text-gray-700 font-semibold" style={{ fontSize: '7.5px', minWidth: '38px' }}>Skills :</span>
                            <span className="text-gray-700" style={{ fontSize: '7.5px' }}>{v.skills.slice(0, 3).join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Back face of the ID card ─────────────────────────────────────────────────
function IDCardBack({ v }: { v: Volunteer }) {
    const fullAddress = [v.address, v.city].filter(Boolean).join(', ')

    return (
        <div
            className="id-card-back relative overflow-hidden rounded-lg border border-gray-300 select-none"
            style={{
                width: '340px',
                height: '214px',
                backgroundColor: '#ffffff',
                backgroundImage: WATERMARK_BG,
                fontFamily: 'Arial, sans-serif',
                flexShrink: 0,
            }}
        >
            {/* ── Watermark logo in center ──────────────────────────────────────── */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: 0.08 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.webp" alt="" className="w-28 h-28 object-contain" style={{ filter: 'grayscale(100%)' }} />
            </div>

            {/* ── Content ───────────────────────────────────────────────────────── */}
            <div className="relative z-10 h-full flex flex-col justify-between px-4 py-3">

                {/* Address block */}
                <div>
                    <p className="text-gray-900 font-bold" style={{ fontSize: '8px', letterSpacing: '0.3px' }}>
                        <span className="font-black" style={{ fontSize: '8.5px' }}>ADDRESS : </span>
                        {fullAddress || NGO_ADDRESS_FULL}
                    </p>
                </div>

                {/* Occupation / Role */}
                {(v.occupation || v.availability) && (
                    <div className="space-y-0.5">
                        {v.occupation && (
                            <p className="text-gray-800 font-semibold" style={{ fontSize: '8px' }}>
                                <span className="font-black">Occupation : </span>{v.occupation}
                            </p>
                        )}
                        {v.availability && (
                            <p className="text-gray-800 font-semibold" style={{ fontSize: '8px' }}>
                                <span className="font-black">Availability : </span>{v.availability}
                            </p>
                        )}
                    </div>
                )}

                {/* Bottom row: Social handles + Signature */}
                <div className="flex items-end justify-between">
                    {/* Social handles */}
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                            <svg className="w-2.5 h-2.5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                            <span className="text-gray-700 font-medium" style={{ fontSize: '7px' }}>ziddi_mumbaikar_ngo</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-2.5 h-2.5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-gray-700 font-medium" style={{ fontSize: '7px' }}>ziddimumbaikarngo</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-2.5 h-2.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 16.518l-4.5-4.319 1.396-1.435 3.078 2.937 6.105-6.218 1.421 1.408-7.5 7.627z" />
                            </svg>
                            <span className="text-gray-700 font-medium" style={{ fontSize: '7px' }}>www.ziddimumbaikarngo.com</span>
                        </div>
                    </div>

                    {/* Signature box */}
                    <div className="text-center" style={{ minWidth: '110px' }}>
                        <div
                            className="border-b border-gray-400 mb-1"
                            style={{ height: '36px', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
                        >
                            {/* Signature placeholder – italic stylised text */}
                            <p className="text-gray-400 italic" style={{ fontSize: '7.5px', paddingTop: '20px', fontFamily: 'Georgia, serif' }}>
                                _____________________
                            </p>
                        </div>
                        <p className="font-black text-gray-700 uppercase tracking-wider" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>
                            PRESIDENT SIGNATURE
                        </p>
                    </div>
                </div>
            </div>
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
                        <p className="text-[10px] text-gray-400">{formatIdNo(index)}</p>
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
            <div className={`flex flex-col gap-0 border border-t-0 rounded-b-2xl overflow-hidden ${selected ? 'border-primary-200' : 'border-gray-200'
                }`}>
                <div className="px-4 pt-3 pb-1 bg-gray-50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Front</p>
                </div>
                <div className="px-4 pb-3 bg-gray-50">
                    <IDCardFront v={v} index={index} />
                </div>
                <div className="px-4 pt-3 pb-1 bg-gray-50 border-t border-gray-200">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Back</p>
                </div>
                <div className="px-4 pb-4 bg-gray-50">
                    <IDCardBack v={v} />
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
    // printSingleId: when set, only this volunteer's card is printed
    const [printSingleId, setPrintSingleId] = useState<string | null>(null)

    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin') router.push('/')
    }, [isLoggedIn, user, router])

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') return
        const fetchAll = async () => {
            try {
                setLoading(true)
                const res = await volunteerService.getVolunteers()
                if (res.success) setVolunteers(res.data || [])
                else setError('Failed to load volunteers')
            } catch {
                setError('Failed to load volunteers. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [isLoggedIn, user])

    const filtered = volunteers.filter((v) => {
        const matchSearch =
            !search ||
            `${v.first_name} ${v.last_name} ${v.email} ${v.phone}`.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || v.status === statusFilter
        return matchSearch && matchStatus
    })

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
            }
        } catch {
            alert('Failed to update status')
        } finally {
            setUpdatingId(null)
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
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { display: flex; flex-direction: column; gap: 15mm; align-items: center; }
          .card-pair { display: flex; gap: 5mm; break-inside: avoid; }
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filtered.map((v) => (
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
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:table-cell">Contact</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden lg:table-cell">Skills</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden sm:table-cell">Joined</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">ID Card</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filtered.map((v, i) => {
                                            const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG['applied']
                                            const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ')
                                            const initials = [v.first_name?.[0], v.last_name?.[0]].filter(Boolean).join('').toUpperCase()
                                            return (
                                                <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {v.photo_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={v.photo_url} alt={fullName} className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-xs font-black text-primary-600">{initials}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{fullName}</p>
                                                                <p className="text-[11px] text-gray-400">
                                                                    {formatIdNo(volunteers.indexOf(v))} · {v.occupation || '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        <p className="text-gray-700">{v.email}</p>
                                                        <p className="text-[11px] text-gray-400">{v.phone}</p>
                                                    </td>
                                                    <td className="px-5 py-4 hidden lg:table-cell">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(v.skills ?? []).slice(0, 3).map((s) => (
                                                                <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-semibold">{s}</span>
                                                            ))}
                                                            {(v.skills?.length ?? 0) > 3 && (
                                                                <span className="text-[10px] text-gray-400">+{(v.skills?.length ?? 0) - 3}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <select
                                                            value={v.status}
                                                            disabled={updatingId === v.id}
                                                            onChange={(e) => handleStatusChange(v.id, e.target.value)}
                                                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50 ${cfg.bg} ${cfg.text}`}
                                                        >
                                                            {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                                                                <option key={key} value={key}>{c.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-5 py-4 hidden sm:table-cell text-[11px] text-gray-400">
                                                        {v.created_at
                                                            ? new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : '—'}
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
