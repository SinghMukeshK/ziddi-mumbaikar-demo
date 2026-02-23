'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SignInModal from './SignInModal'
import VolunteerModal from './VolunteerModal'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
                        <Link href="/contact" className="text-gray-700 hover:text-primary-500 font-medium transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Contact Us
                        </Link>
                        <Link
                            href="/volunteer"
                            className="bg-primary-500 hover:bg-primary-600 text-white px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0"
                        >
                            Become A Volunteer
                        </Link>
                        <Link href="/fundraiser/start" className="bg-navy-900 hover:bg-navy-800 text-white px-3 xl:px-5 py-2 xl:py-2.5 rounded-lg font-semibold transition-colors text-[13px] xl:text-base whitespace-nowrap shrink-0">
                            Start a Fundraiser
                        </Link>

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
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 overflow-hidden"
                                            >
                                                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Signed in as</p>
                                                    <p className="font-bold text-navy-900 truncate">{user?.email}</p>
                                                </div>

                                                <div className="px-2 space-y-1">
                                                    {[
                                                        // { label: 'Dashboard', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                                                        { label: 'My Profile', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-all group"
                                                            onClick={() => setShowUserMenu(false)}
                                                        >
                                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                            </svg>
                                                            {item.label}
                                                        </Link>
                                                    ))}

                                                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                                        <>
                                                            <div className="h-px bg-gray-50 my-2 mx-3" />
                                                            <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-500">Administration</p>
                                                            <Link
                                                                href="/admin/approvals"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Review Approvals
                                                            </Link>
                                                            <Link
                                                                href="/admin/bookings"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Manage Bookings
                                                            </Link>
                                                            <Link
                                                                href="/admin/volunteers"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Volunteers
                                                            </Link>
                                                            <Link
                                                                href="/admin/tenant"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                Organization Settings
                                                            </Link>
                                                            <Link
                                                                href="/donations"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                View All Donations
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-50 bg-gray-50/50">
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false)
                                                            logout()
                                                        }}
                                                        className="flex items-center gap-3 w-full px-6 py-4 text-sm font-black text-red-600 hover:bg-red-50 transition-all uppercase tracking-widest"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Sign Out
                                                    </button>
                                                </div>
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
                                href="/contact"
                                className="text-gray-700 hover:text-primary-500 font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>

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
                                            <p className="px-3 py-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-primary-500">Administration</p>
                                            <Link
                                                href="/admin/approvals"
                                                className="text-primary-600 hover:text-primary-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Review Approvals
                                            </Link>
                                            <Link
                                                href="/admin/bookings"
                                                className="text-primary-600 hover:text-primary-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Manage Bookings
                                            </Link>
                                            <Link
                                                href="/admin/volunteers"
                                                className="text-primary-600 hover:text-primary-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Volunteers
                                            </Link>
                                            <Link
                                                href="/admin/tenant"
                                                className="text-primary-600 hover:text-primary-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Organization Settings
                                            </Link>
                                            <Link
                                                href="/donations"
                                                className="text-primary-600 hover:text-primary-700 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                View All Donations
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
