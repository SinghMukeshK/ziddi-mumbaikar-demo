'use client'

import VolunteerHelp from './VolunteerHelp'

interface VolunteerModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function VolunteerModal({ isOpen, onClose }: VolunteerModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md transition-colors text-gray-500 hover:text-gray-900"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-0">
                    <VolunteerHelp isModal={true} />
                </div>
            </div>
        </div>
    )
}
