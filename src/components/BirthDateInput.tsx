'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface BirthDateInputProps {
    value: string | undefined // YYYY-MM-DD
    name: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    className?: string
}

const BirthDateInput: React.FC<BirthDateInputProps> = ({ value, name, onChange, className = "" }) => {
    const [year, setYear] = useState('')
    const [month, setMonth] = useState('')
    const [day, setDay] = useState('')

    // Initialize from value prop
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-')
            setYear(y || '')
            setMonth(m || '')
            setDay(d || '')
        }
    }, [value])

    // Generate years (e.g., from 1920 to current year)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 111 }, (_, i) => (currentYear - i).toString())
    
    const months = [
        { label: 'Jan', value: '01' },
        { label: 'Feb', value: '02' },
        { label: 'Mar', value: '03' },
        { label: 'Apr', value: '04' },
        { label: 'May', value: '05' },
        { label: 'Jun', value: '06' },
        { label: 'Jul', value: '07' },
        { label: 'Aug', value: '08' },
        { label: 'Sep', value: '09' },
        { label: 'Oct', value: '10' },
        { label: 'Nov', value: '11' },
        { label: 'Dec', value: '12' },
    ]

    // Get number of days in selected month/year
    const getDaysInMonth = (y: string, m: string) => {
        if (!y || !m) return 31
        return new Date(parseInt(y), parseInt(m), 0).getDate()
    }

    const daysCount = getDaysInMonth(year, month)
    const days = Array.from({ length: daysCount }, (_, i) => (i + 1).toString().padStart(2, '0'))

    const handlePartChange = (part: 'year' | 'month' | 'day', val: string) => {
        let newYear = year
        let newMonth = month
        let newDay = day

        if (part === 'year') {
            newYear = val
            // Reset day if it exceeds the new month's days
            const maxDays = getDaysInMonth(val, month)
            if (parseInt(day) > maxDays) newDay = maxDays.toString().padStart(2, '0')
        } else if (part === 'month') {
            newMonth = val
            // Reset day if it exceeds the new month's days
            const maxDays = getDaysInMonth(year, val)
            if (parseInt(day) > maxDays) newDay = maxDays.toString().padStart(2, '0')
        } else {
            newDay = val
        }

        const newValue = `${newYear}-${newMonth}-${newDay}`
        
        // Only trigger onChange if all parts are selected or if we want to allow partials (for DOB, usually we want all)
        if (newYear && newMonth && newDay) {
            // Create a synthetic event
            const syntheticEvent = {
                target: {
                    name,
                    value: newValue
                }
            } as React.ChangeEvent<HTMLSelectElement>
            onChange(syntheticEvent)
        }
        
        // Update local state
        setYear(newYear)
        setMonth(newMonth)
        setDay(newDay)
    }

    const selectClass = "w-full pl-2 sm:pl-3 pr-7 sm:pr-8 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none appearance-none transition-all font-medium text-navy-900 text-sm"

    return (
        <div className={`grid grid-cols-3 gap-2 ${className}`}>
            {/* Day */}
            <div className="relative">
                <select
                    value={day}
                    onChange={(e) => handlePartChange('day', e.target.value)}
                    className={selectClass}
                >
                    <option value="">Day</option>
                    {days.map(d => (
                        <option key={d} value={d}>{parseInt(d)}</option>
                    ))}
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
            </div>

            {/* Month */}
            <div className="relative">
                <select
                    value={month}
                    onChange={(e) => handlePartChange('month', e.target.value)}
                    className={selectClass}
                >
                    <option value="">Month</option>
                    {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
            </div>

            {/* Year */}
            <div className="relative">
                <select
                    value={year}
                    onChange={(e) => handlePartChange('year', e.target.value)}
                    className={selectClass}
                >
                    <option value="">Year</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
            </div>
        </div>
    )
}

export default BirthDateInput
