'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!token) {
            setError('Invalid or expired reset token.')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setIsLoading(true)

        try {
            // API call would go here
            // await apiV1.post('/auth/reset-password', { token, password: formData.password })

            // Mocking success
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Verification failed. The link may be expired.')
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
                        Secure Password Reset
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white py-8 px-6 shadow-2xl rounded-[2.5rem] sm:px-10 border border-gray-100"
                >
                    {!isSuccess ? (
                        <>
                            <div className="mb-8 text-center uppercase">
                                <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-navy-900 tracking-tight">Set New Password</h3>
                                <p className="text-xs text-gray-400 mt-2 font-bold tracking-widest">
                                    Please enter your new secure password below
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="appearance-none block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-4 px-4 bg-navy-900 hover:bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-navy-900/10 disabled:opacity-50"
                                >
                                    {isLoading ? 'Resetting Password...' : 'Reset Password Now'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <h3 className="text-3xl font-black text-navy-900 mb-4 tracking-tight uppercase">Security Updated</h3>
                            <p className="text-gray-500 mb-10 font-bold text-sm uppercase tracking-wide">
                                Your account is now secure with your new password.
                            </p>
                            <Link
                                href="/signin"
                                className="inline-block w-full py-5 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-navy-900 transition-all shadow-xl shadow-primary-500/20"
                            >
                                Login with New Credentials
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
