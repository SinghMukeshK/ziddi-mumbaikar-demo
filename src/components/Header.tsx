'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SignInModal from './SignInModal'
import VolunteerModal from './VolunteerModal'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationBell from './NotificationBell'

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, isLoggedIn, logout } = useAuth()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showSignInModal, setShowSignInModal] = useState(false)
    const [showVolunteerModal, setShowVolunteerModal] = useState(false)
    const searchParams = useSearchParams()

    // Check if sign in modal should be opened from URL
    useEffect(() => {
        if (searchParams?.get('signin') === 'true' && !isLoggedIn) {
            setShowSignInModal(true)
        }
    }, [searchParams, isLoggedIn])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md print:hidden">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Center - Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo.webp"
                                alt="Ziddi Mumbaikar Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                            <div className="font-display text-2xl font-bold hidden sm:block">
                                <span className="text-primary-500">Ziddi</span>{' '}
                                <span className="text-navy-900">Mumbaikar</span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Section - Desktop */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-4">
                        <Link href="/#services" className="bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 xl:px-4 py-2 rounded-full font-bold text-xs xl:text-sm transition-all border border-primary-200 flex items-center gap-1.5 shadow-sm hover:shadow-md animate-pulse whitespace-nowrap shrink-0">
                            <span className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            Free Services
                        </Link>
                        <Link href="/fundraisers" className="text-gray-700 hover:text-primary-500 font-medium transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Fundraisers
                        </Link>
                        <Link href="/#events" className="text-gray-700 hover:text-primary-500 font-medium transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Events
                        </Link>
                        {/* <Link href="/contact" className="text-gray-700 hover:text-primary-500 font-medium transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Contact Us
                        </Link> */}
                        <Link
                            href="/volunteer"
                            className="bg-primary-500 hover:bg-primary-600 text-white px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0"
                        >
                            Become A Volunteer
                        </Link>
                        <Link href="/fundraiser/start" className="bg-navy-900 hover:bg-navy-800 text-white px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Start a Fundraiser
                        </Link>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Authentication */}
                        {isLoggedIn ? (
                            <div className="relative user-menu-container">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${showUserMenu ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-500'
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                        <span className="font-bold text-xs">
                                            {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="font-bold text-sm hidden xl:block">
                                        {user?.first_name}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            {/* Invisible backdrop to capture clicks - or use more specific logic */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute right-0 mt-3 w-[720px] bg-white rounded-[32px] shadow-2xl py-0 z-50 border border-gray-100 overflow-hidden hidden lg:block"
                                            >
                                                {/* Profile Area */}
                                                <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                                            <span className="font-black text-lg">{user?.first_name?.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Administrator</p>
                                                            <p className="font-bold text-navy-900 text-sm">{user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href="/profile"
                                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-navy-900 hover:bg-slate-50 transition-all flex items-center gap-2"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        My Profile
                                                    </Link>
                                                </div>

                                                {(user?.role === 'admin' || user?.role === 'super_admin') ? (
                                                    <div className="p-8 grid grid-cols-3 gap-8">
                                                        {/* Operations Column */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                                </div>
                                                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">Operations</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Link href="/admin/events" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Events & Gallery</Link>
                                                                <Link href="/admin/volunteers" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Volunteers</Link>
                                                                <Link href="/admin/bookings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Service Bookings</Link>
                                                                <Link href="/donations" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Donations</Link>
                                                                <Link href="/admin/approvals" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Approval Queue</Link>
                                                                <Link href="/admin/contact-inquiries" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Contact Inquiries</Link>
                                                            </div>
                                                        </div>

                                                        {/* Insights Column */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                                </div>
                                                                <p className="text-[11px] font-black uppercase tracking-widest text-green-600">Analysis</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Link href="/admin/analytics" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Impact Data</Link>
                                                                <Link href="/admin/audit" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Activity Logs</Link>
                                                            </div>
                                                        </div>

                                                        {/* Settings Column */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                                                </div>
                                                                <p className="text-[11px] font-black uppercase tracking-widest text-purple-600">Platform</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Link href="/admin/billing" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Billing & Plan</Link>
                                                                <Link href="/admin/tenant" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-all">Organization</Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8">
                                                        <Link
                                                            href="/dashboard"
                                                            className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl hover:bg-primary-50 transition-all group"
                                                            onClick={() => setShowUserMenu(false)}
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary-500 shadow-sm transition-colors">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-navy-900">User Dashboard</p>
                                                                <p className="text-xs text-slate-500 font-medium">View your donations and volunteer history</p>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )}

                                                <div className="px-8 py-5 border-t border-gray-50 bg-slate-50/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online · v2.4.0</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false)
                                                            logout()
                                                        }}
                                                        className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>

                                            {/* Mobile Version Placeholder (Simple List) */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 overflow-hidden lg:hidden"
                                            >
                                                {/* (Existing mobile structure logic would go here if needed, but the lg:hidden on both takes care of it) */}
                                            </motion.div>

                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSignInModal(true)}
                                className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Toggle menu"
                    >
                        {!isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden pb-6 border-t border-gray-200 mt-2 max-h-[calc(100vh-80px)] overflow-y-auto">
                        <div className="flex flex-col space-y-3 pt-4 px-2">
                            {/* User Info - Mobile */}
                            {isLoggedIn && (
                                <div className="px-3 py-2 bg-primary-50 rounded-lg mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-bold">
                                                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-navy-900">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-gray-600">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/#services"
                                className="flex items-center justify-between bg-primary-50 text-primary-700 font-bold py-3 px-4 rounded-xl border border-primary-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                    </span>
                                    <span>Free Services</span>
                                </div>
                            </Link>

                            <Link
                                href="/fundraisers"
                                className="text-gray-700 hover:text-primary-500 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Fundraisers
                            </Link>
                            <Link
                                href="/#events"
                                className="text-gray-700 hover:text-primary-500 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Events
                            </Link>
                            {/* <Link
                                href="/contact"
                                className="text-gray-700 hover:text-primary-500 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link> */}

                            {/* Logged In User Links - Mobile */}
                            {isLoggedIn && (
                                <>
                                    <hr className="my-2" />
                                    <Link
                                        href="/profile"
                                        className="text-gray-700 hover:text-primary-500 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>

                                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                        <>
                                            <p className="px-3 py-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-primary-500">Operations</p>
                                            <Link
                                                href="/admin/events"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Manage Events
                                            </Link>
                                            <Link
                                                href="/admin/contact-inquiries"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Contact Inquiries
                                            </Link>
                                            <Link
                                                href="/admin/volunteers"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Manage Volunteers
                                            </Link>
                                            <Link
                                                href="/donations"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                View Donations
                                            </Link>

                                            <p className="px-3 py-1.5 mt-4 text-[10px] font-black uppercase tracking-widest text-primary-500">System & Administration</p>
                                            <Link
                                                href="/admin/analytics"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Impact Analytics
                                            </Link>
                                            <Link
                                                href="/admin/approvals"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Review Approvals
                                            </Link>
                                            <Link
                                                href="/admin/tenant"
                                                className="text-gray-700 hover:text-primary-600 font-bold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Organization Settings
                                            </Link>
                                        </>
                                    )}
                                    <hr className="my-2" />
                                </>
                            )}

                            <Link
                                href="/volunteer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-lg font-semibold text-center transition-colors"
                            >
                                Become A Volunteer
                            </Link>
                            <Link
                                href="/fundraiser/start"
                                className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-3 rounded-lg font-semibold text-center transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Start a Fundraiser
                            </Link>

                            {isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        logout()
                                    }}
                                    className="text-red-600 hover:text-red-700 font-semibold py-2 px-3 text-center transition-colors"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        setShowSignInModal(true)
                                    }}
                                    className="text-primary-500 hover:text-primary-600 font-semibold py-2 px-3 text-center transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Sign In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
            />

            {/* Volunteer Modal */}
            <VolunteerModal
                isOpen={showVolunteerModal}
                onClose={() => setShowVolunteerModal(false)}
            />
        </header>
    )
}
