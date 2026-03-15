
'use client'

import { useState, useEffect } from 'react'
import { volunteerService } from '@/services/volunteer.service'
import { fundraiserService } from '@/services/fundraiser.service'
import { eventService } from '@/services/event.service'

interface ApprovalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    entityType: string;
    entityId: string;
    title: string;
}

export default function ApprovalDetailModal({ isOpen, onClose, entityType, entityId, title }: ApprovalDetailModalProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen || !entityId) return

        const fetchData = async () => {
            setLoading(true)
            setError('')
            try {
                let response: any
                switch (entityType) {
                    case 'volunteer':
                        response = await volunteerService.getVolunteer(entityId)
                        break
                    case 'campaign':
                    case 'fundraiser':
                        response = await fundraiserService.getFundraiserById(entityId)
                        break
                    case 'event':
                        response = await eventService.getEventById(entityId)
                        break
                    default:
                        throw new Error(`Detail view not implemented for ${entityType}`)
                }

                if (response.success) {
                    setData(response.data)
                } else {
                    setError('Failed to load details')
                }
            } catch (err: any) {
                console.error('Error fetching details:', err)
                setError(err.message || 'Error loading details')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [isOpen, entityId, entityType])

    if (!isOpen) return null

    const renderVolunteerDetails = (v: any) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">First Name</span>
                    <span className="text-gray-900">{v.first_name}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Last Name</span>
                    <span className="text-gray-900">{v.last_name || '-'}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Email</span>
                    <span className="text-gray-900">{v.email}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Phone</span>
                    <span className="text-gray-900">{v.phone}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Gender</span>
                    <span className="text-gray-900 capitalize">{v.gender || '-'}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Occupation</span>
                    <span className="text-gray-900">{v.occupation || '-'}</span>
                </div>
            </div>
            {v.skills && v.skills.length > 0 && (
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Skills</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {v.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {v.motivation && (
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Motivation</span>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        &quot;{v.motivation}&quot;
                    </p>
                </div>
            )}
            {v.addresses && v.addresses.length > 0 && (
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Address</span>
                    <p className="text-sm text-gray-700">
                        {v.addresses[0].address_line1}, {v.addresses[0].city}, {v.addresses[0].state} - {v.addresses[0].postal_code}
                    </p>
                </div>
            )}
        </div>
    )

    const renderFundraiserDetails = (f: any) => (
        <div className="space-y-4">
            <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Goal Amount</span>
                <span className="text-xl font-bold text-navy-900">{f.currency} {f.goal_amount.toLocaleString()}</span>
            </div>
            <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Short Description</span>
                <p className="text-gray-700">{f.short_description || '-'}</p>
            </div>
            <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Category</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{f.category?.name || 'General'}</span>
            </div>
            {f.beneficiary_name && (
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Beneficiary</span>
                    <span className="text-gray-900">{f.beneficiary_name}</span>
                </div>
            )}
        </div>
    )

    const renderEventDetails = (e: any) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Location</span>
                    <span className="text-gray-900">{e.location || 'Online'}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Type</span>
                    <span className="text-gray-900 capitalize">{e.event_type}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Start</span>
                    <span className="text-gray-900">{new Date(e.start_datetime).toLocaleString()}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">End</span>
                    <span className="text-gray-900">{new Date(e.end_datetime).toLocaleString()}</span>
                </div>
            </div>
            <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Description</span>
                <p className="text-sm text-gray-700 line-clamp-3">{e.description}</p>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Review Request</h2>
                        <h3 className="text-xl font-bold text-navy-900 line-clamp-1">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center py-10">
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 text-sm">Fetching request details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-10 bg-red-50 rounded-xl border border-red-100">
                            <p className="font-bold mb-1">Load Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : data ? (
                        <>
                            {entityType === 'volunteer' && renderVolunteerDetails(data)}
                            {(entityType === 'campaign' || entityType === 'fundraiser') && renderFundraiserDetails(data)}
                            {entityType === 'event' && renderEventDetails(data)}
                            {!['volunteer', 'campaign', 'fundraiser', 'event'].includes(entityType) && (
                                <div className="text-center py-10 text-gray-500">
                                    No preview available for this entity type.
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    )
}
