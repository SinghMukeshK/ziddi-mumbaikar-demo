'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            // API call would go here
            // await apiV1.post('/auth/forgot-password', { email })

            // Mocking success
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-20">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="font-display text-3xl font-bold text-gray-900">
                        <span className="text-primary-500">Ziddi</span> Mumbaikar
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Password Recovery System
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100"
                >
                    {!isSubmitted ? (
                        <>
                            <div className="mb-8 text-center">
                                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-500">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-navy-900">Forgot Password?</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    No worries! Enter your email address and we&apos;ll send you a link to reset your password.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 font-display">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-black text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all uppercase tracking-widest"
                                    >
                                        {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <Link href="/signin" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-navy-900 mb-2 uppercase tracking-tight">Check Your Email</h3>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                We&apos;ve sent a password recovery link to <br /><span className="font-bold text-navy-900">{email}</span>.
                            </p>
                            <Link
                                href="/signin"
                                className="inline-block w-full py-4 bg-navy-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-500 transition-all shadow-xl shadow-navy-900/10"
                            >
                                Return to Login
                            </Link>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="mt-6 text-sm font-semibold text-gray-400 hover:text-primary-500 transition-colors"
                            >
                                Didn&apos;t receive email? Try again
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
