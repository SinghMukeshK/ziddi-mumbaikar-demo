'use client'

import React, { useState, useEffect } from 'react'
import { groupMarriageService, GroupMarriageCouple } from '@/services/group-marriage.service'
import { fixImageUrl } from '@/lib/image-utils'
import { Loader2, Printer } from 'lucide-react'

function formatDate(dt?: string) {
    if (!dt) return ''
    return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const S = {
    label:   { fontSize: 10, fontWeight: 700 as const, whiteSpace: 'nowrap' as const },
    value:   { fontSize: 10, fontWeight: 600 as const, borderBottom: '1px solid #000', minWidth: 40, paddingLeft: 2, paddingRight: 2, display: 'inline-block' as const },
    row:     { display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 9 },
    inlFlex: { display: 'inline-flex', alignItems: 'flex-end', gap: 3 },
}

function PL({ label, value, flex }: { label: string; value?: string | number | null; flex?: string | number }) {
    return (
        <span style={{ ...S.inlFlex, flex: flex ?? undefined }}>
            <span style={S.label}>{label}</span>
            <span style={{ ...S.value, flex: 1 }}>{value ?? ''}</span>
        </span>
    )
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div style={S.row}>
            <span style={S.label}>{label}</span>
            <span style={{ ...S.value, flex: 1 }}>{value ?? ''}</span>
        </div>
    )
}

function InlineRow({ items }: { items: { label: string; value?: string | number | null; flex?: number }[] }) {
    return (
        <div style={{ ...S.row, flexWrap: 'nowrap' }}>
            {items.map((it, i) => (
                <span key={i} style={{ ...S.inlFlex, flex: it.flex ?? 1 }}>
                    <span style={S.label}>{it.label}</span>
                    <span style={{ ...S.value, flex: 1 }}>{it.value ?? ''}</span>
                </span>
            ))}
        </div>
    )
}

function PersonSection({ title, data, prefix }: {
    title: string; data: GroupMarriageCouple; prefix: 'groom' | 'bride'
}) {
    const p = (k: string): any => (data as any)[`${prefix}_${k}`] ?? ''
    const lbl = prefix === 'bride' ? "Bride's" : "Groom's"
    const who = prefix === 'bride' ? 'Bride' : 'Groom'

    return (
        <div style={{ marginTop: 6 }}>
            {/* Section chip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{
                    background: '#003580', color: '#fff', fontSize: 11, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 20px', borderRadius: 2,
                }}>
                    {title}
                </div>
            </div>

            {/* Fields | Photo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>

                <div style={{ minWidth: 0 }}>
                    <Row label={`Name of the ${who}:`} value={`${p('first_name')} ${p('last_name')}`.trim()} />
                    <InlineRow items={[
                        { label: 'Date of Birth:', value: formatDate(p('dob')), flex: 1.2 },
                        { label: 'Age:', value: p('age'), flex: 0.5 },
                        { label: 'Qualification:', value: p('education'), flex: 1 },
                        { label: 'Religion:', value: p('religion'), flex: 0.9 },
                        { label: 'Cast:', value: p('caste'), flex: 0.8 },
                    ]} />
                    <Row label={`Name of the ${lbl} Father:`} value={p('father_name')} />
                    <Row label={`Name of the ${lbl} Mother:`} value={p('mother_name')} />
                    <Row label={`Name of the ${lbl} Guardian:`} value={p('guardian_name')} />
                    <Row label="Residential Address:" value={p('address')} />
                    <div style={{ borderBottom: '1px solid #000', marginBottom: 6 }} />
                    <InlineRow items={[
                        { label: 'Ration Card No:', value: p('ration_card'), flex: 1 },
                        { label: 'Tel:', value: p('alternate_phone'), flex: 1 },
                        { label: 'Mobile:', value: p('phone'), flex: 1 },
                    ]} />
                    <Row label="Native Place Address:" value={p('native_address')} />
                    <InlineRow items={[
                        { label: `Professional the ${lbl} Father/Guardian:`, value: p('father_guardian_occupation'), flex: 1.4 },
                        { label: 'Yearly Income:', value: p('family_income') ? `₹${Number(p('family_income')).toLocaleString('en-IN')}` : '', flex: 1 },
                    ]} />
                    <InlineRow items={[
                        { label: 'Introduced By:', value: p('introduced_by'), flex: 1.5 },
                        { label: 'Mobile No:', value: p('introduced_by_phone'), flex: 1 },
                    ]} />
                </div>

                {/* Photo box */}
                <div style={{ width: 100, flexShrink: 0 }}>
                    <div style={{
                        width: 100, height: 124, border: '1.5px solid #9ca3af',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', background: '#f9fafb',
                    }}>
                        {p('photo_url') ? (
                            <img src={fixImageUrl(p('photo_url'))} alt={`${prefix} photo`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', padding: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                                Photo
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Signature row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 4, borderTop: '0.75px solid #d1d5db' }}>
                <div>
                    <div style={{ width: 130, borderBottom: '1px solid #000', marginBottom: 2 }} />
                    <span style={{ fontSize: 9, fontStyle: 'italic' }}>Sign. of {lbl} Parent / Guardian</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ width: 100, borderBottom: '1px solid #000', marginBottom: 2, marginLeft: 'auto' }} />
                    <span style={{ fontSize: 9, fontStyle: 'italic' }}>Sign. of {who}</span>
                </div>
            </div>
        </div>
    )
}

export default function PrintApplicationPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [couple, setCouple] = useState<GroupMarriageCouple | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        groupMarriageService.listAllCouples({ limit: 500 })
            .then(res => {
                if (res.data) {
                    const found = res.data.find((c: GroupMarriageCouple) => c.id === id)
                    if (found) setCouple(found)
                    else setError('Registration not found.')
                }
            })
            .catch(() => setError('Failed to load registration.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    )
    if (error || !couple) return (
        <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">
            {error ?? 'Not found'}
        </div>
    )

    const appDate = couple.application_date
        ? new Date(couple.application_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 print:hidden">
                <button onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-xl text-sm uppercase tracking-wider transition-all">
                    <Printer size={16} /> Print / Save PDF
                </button>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm 10mm; }
                    html, body { margin: 0; padding: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    .screen-wrapper { padding-top: 0 !important; }
                }
                body { font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; }
            `}</style>

            {/* Screen wrapper — clears site navbar; zeroed out during print */}
            <div style={{ paddingTop: 80 }} className="screen-wrapper">
            {/* Outer shell — fills full A4 */}
            <div style={{
                background: '#fff',
                width: '210mm',
                height: '277mm',          /* exact A4 minus 8mm top+bottom margins */
                margin: '0 auto',
                border: '3.5px solid #dc2626',
                overflow: 'hidden',
                fontFamily: 'Arial, Helvetica, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}>
                {/* ── Red header ── */}
                <div style={{ background: '#dc2626', textAlign: 'center', padding: '6px 0' }}>
                    <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                        {couple.event?.title ?? 'Mass Marriage Festival'}
                    </h1>
                </div>

                {/* ── Org row ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', borderBottom: '1px solid #e5e7eb' }}>
                    <img src="/logo.webp" alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4b5563' }}>Organisation</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#003580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Ziddi Mumbaikar (NGO)
                        </div>
                    </div>
                    <img src="/logo.webp" alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
                </div>

                {/* ── Address bar ── */}
                <div style={{ border: '1px solid #9ca3af', margin: '4px 12px', padding: '3px 8px', fontSize: 9.5, fontWeight: 600, textAlign: 'center' }}>
                    Office: Shop No. 09 Bldg., R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara Jogeshwari (W), Mumbai - 400 102.
                </div>

                {/* ── Form meta row ── */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '4px 14px 2px' }}>
                    <span style={S.inlFlex}>
                        <span style={{ ...S.label, fontSize: 11 }}>Date:</span>
                        <span style={{ ...S.value, fontSize: 11, minWidth: 100 }}>{appDate}</span>
                    </span>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#003580', textTransform: 'uppercase', margin: 0, letterSpacing: '0.06em' }}>
                        Application Form
                    </h2>
                    <span style={S.inlFlex}>
                        <span style={{ ...S.label, fontSize: 11 }}>Form No:</span>
                        <span style={{ ...S.value, fontSize: 11, minWidth: 80 }}>
                            {couple.form_number ?? couple.couple_number ?? ''}
                        </span>
                    </span>
                </div>

                {/* ── Bride section ── */}
                <div style={{ padding: '0 14px 12px', flex: 1 }}>
                    <PersonSection title="For Bride's Detail" data={couple} prefix="bride" />
                </div>

                {/* ── Dashed divider ── */}
                <div style={{ borderTop: '2px dashed #6b7280', margin: '0 12px' }} />

                {/* ── Groom section ── */}
                <div style={{ padding: '4px 14px 12px', flex: 1 }}>
                    <PersonSection title="For Groom's Detail" data={couple} prefix="groom" />
                </div>

                {/* ── Notes ── */}
                {couple.notes && (
                    <div style={{ padding: '0 14px 6px' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#6b7280' }}>Notes: </span>
                        <span style={{ fontSize: 9, color: '#374151' }}>{couple.notes}</span>
                    </div>
                )}

                {/* ── Footer ── */}
                <div style={{ borderTop: '2.5px dashed #6b7280', margin: '0 12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                    <img src="/logo.webp" alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>Organisation</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#003580', textTransform: 'uppercase' }}>Ziddi Mumbaikar (NGO)</div>
                        <div style={{ fontSize: 8, color: '#4b5563', fontWeight: 500, lineHeight: 1.4 }}>
                            Office: Shop No. 09 Bldg., R-5, Gulshan Nagar,<br />
                            Raghvendra Mandir Road, Oshiwara Jogeshwari (W), Mumbai - 400 102.
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626', marginTop: 2 }}>
                            Prakash M Khot
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151' }}>President</div>
                    </div>
                    <img src="/MrPrakashMKhote.webp" alt="Prakash M Khot"
                        style={{ width: 72, height: 88, objectFit: 'cover', objectPosition: 'top', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                </div>
            </div>
            </div>{/* end screen-wrapper */}
        </>
    )
}
