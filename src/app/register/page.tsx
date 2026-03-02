'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Additional Info
  const [formData, setFormData] = useState({
    // Step 1
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Step 2
    dateOfBirth: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    locality: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',

    // Terms
    agreeTerms: false,
    subscribeNewsletter: true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    const checked = type === 'checkbox' ? target.checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call signup with basic info only. 
      // Do not pass a hardcoded role UUID, let the backend/context use undefined to trigger default role assignment.
      await signup(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password,
        formData.phone
      )

      // Redirect to dashboard or home after successful registration
      router.push('/dashboard?registered=true')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Join <span className="text-primary-500">Ziddi</span> Mumbaikar
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Be part of the movement for a better Mumbai
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-700">Basic Info</span>
            </div>
            <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-700">Address</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeTerms" className="text-gray-700">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-semibold">
                          Terms and Conditions
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-semibold">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="subscribeNewsletter"
                        name="subscribeNewsletter"
                        type="checkbox"
                        checked={formData.subscribeNewsletter}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="subscribeNewsletter" className="text-gray-700">
                        Subscribe to newsletter for updates and impact stories
                      </label>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Optional Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Address information helps us coordinate local events and volunteer activities in your area. You can skip this and add it later.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-semibold text-gray-700">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="House/Flat No., Building Name"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-semibold text-gray-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Street, Area"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Locality */}
                  <div>
                    <label htmlFor="locality" className="block text-sm font-semibold text-gray-700">
                      Locality
                    </label>
                    <input
                      type="text"
                      id="locality"
                      name="locality"
                      value={formData.locality}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Andheri, Bandra, etc."
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
