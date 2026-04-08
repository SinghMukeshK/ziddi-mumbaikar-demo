'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Wrench,
    Clock,
    MapPin,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    Heart,
    ChevronRight,
    Target,
    Users,
    Star,
    Info,
    FileText,
    Image as ImageIcon,
    Upload,
    PlusCircle,
    X as XIcon,
    Paperclip
} from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ImageEditor from '@/components/ImageEditor'
import { volunteerService, VolunteerCreateRequest } from '@/services/volunteer.service'
import { fundraiserService } from '@/services/fundraiser.service'
import { useRouter } from 'next/navigation'

export default function VolunteerPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<VolunteerCreateRequest>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        occupation: '',
        skills: [],
        availability: '',
        address: '',
        city: 'Mumbai',
        ward: '',
        motivation: ''
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [skillInput, setSkillInput] = useState('')
    const [idProofFile, setIdProofFile] = useState<File | null>(null)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [editingFile, setEditingFile] = useState<{ file: File, type: 'id' | 'photo' } | null>(null)
    const [extraDocuments, setExtraDocuments] = useState<File[]>([])
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault()
            if (!formData.skills?.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...(prev.skills || []), skillInput.trim()]
                }))
            }
            setSkillInput('')
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills?.filter(skill => skill !== skillToRemove)
        }))
    }

    const validateForm = () => {
        const errors: { [key: string]: string } = {}

        if (!formData.first_name.trim()) errors.first_name = 'First name is required'
        else if (formData.first_name.length < 2) errors.first_name = 'First name must be at least 2 characters'

        if (!formData.email.trim()) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address'

        if (!formData.phone.trim()) errors.phone = 'Phone number is required'
        else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'Invalid phone number'

        if (!idProofFile) errors.id_proof = 'ID Proof is required'
        if (!photoFile) errors.photo = 'Passport photo is required'

        if (!(formData.motivation || '').trim()) errors.motivation = 'Motivation is required'
        else if ((formData.motivation || '').length < 20) errors.motivation = 'Please tell us a bit more (min 20 characters)'

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            setError('Please fix the errors in the form before submitting.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const volunteerId = crypto.randomUUID()
            let finalFormData: VolunteerCreateRequest = {
                ...formData,
                id: volunteerId
            }

            // 1. Upload ID Proof if available
            if (idProofFile) {
                const uploadRes = await fundraiserService.uploadMedia(idProofFile, 'volunteers', volunteerId)
                if (uploadRes.success && uploadRes.data?.url) {
                    finalFormData.id_proof_url = uploadRes.data.url
                } else {
                    throw new Error('Failed to upload ID proof. Please try again.')
                }
            }

            // 2. Upload Photo if available
            if (photoFile) {
                const uploadRes = await fundraiserService.uploadMedia(photoFile, 'volunteers', volunteerId)
                if (uploadRes.success && uploadRes.data?.url) {
                    finalFormData.photo_url = uploadRes.data.url
                } else {
                    throw new Error('Failed to upload passport photo. Please try again.')
                }
            }

            // 3. Upload Extra Documents if available
            if (extraDocuments.length > 0) {
                const uploadedDocs: { name: string, url: string, type: string }[] = []
                for (const file of extraDocuments) {
                    const uploadRes = await fundraiserService.uploadMedia(file, 'volunteers', volunteerId)
                    if (uploadRes.success && uploadRes.data?.url) {
                        uploadedDocs.push({
                            name: file.name,
                            url: uploadRes.data.url,
                            type: file.type
                        })
                    }
                }
                if (uploadedDocs.length > 0) {
                    finalFormData.documents = uploadedDocs
                }
            }

            console.log('Final Volunteer Data:', finalFormData);

            const response = await volunteerService.applyAsVolunteer(finalFormData)
            if (response.success) {
                setSuccess(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                setError(response.message || 'Failed to submit application. Please try again.')
            }
        } catch (err: any) {
            console.error('Volunteer application error:', err)
            setError(err.message || 'An unexpected error occurred. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
                <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-primary-500/10 border border-gray-100"
                    >
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-navy-900 mb-6 leading-tight">Application Submitted!</h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Thank you for your interest in volunteering with Ziddi Mumbaikar. Our team will review your application and get back to you shortly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/"
                                className="px-8 py-4 bg-navy-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg"
                            >
                                Go to Home
                            </Link>
                            <Link
                                href="/fundraisers"
                                className="px-8 py-4 bg-primary-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                            >
                                Explore Causes
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
            {/* Hero Header */}
            <div className="bg-navy-900 text-white pt-20 pb-28 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/40 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-primary-500/30 mb-4 inline-block">
                            Be a Change Maker
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                            Join the <span className="text-primary-500 underline decoration-primary-500/30">Force</span> for Good.
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed font-medium">
                            Your time and skills can transform lives. Become a volunteer today and help us serve those who need it most.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Volunteer Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-8 bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-gray-200 border border-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-navy-900 uppercase tracking-tight">Registration Form</h2>
                                <p className="text-gray-500 text-xs">Please provide your details to apply</p>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3"
                            >
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold">!</div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => {
                                                handleInputChange(e)
                                                if (validationErrors.first_name) {
                                                    setValidationErrors(prev => ({ ...prev, first_name: '' }))
                                                }
                                            }}
                                            placeholder="First Name"
                                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none transition-all font-medium text-navy-900 text-sm ${validationErrors.first_name ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-primary-500'
                                                }`}
                                        />
                                        {validationErrors.first_name && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.first_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Last Name"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                handleInputChange(e)
                                                if (validationErrors.email) {
                                                    setValidationErrors(prev => ({ ...prev, email: '' }))
                                                }
                                            }}
                                            placeholder="Email Address"
                                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none transition-all font-medium text-navy-900 text-sm ${validationErrors.email ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-primary-500'
                                                }`}
                                        />
                                        {validationErrors.email && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                handleInputChange(e)
                                                if (validationErrors.phone) {
                                                    setValidationErrors(prev => ({ ...prev, phone: '' }))
                                                }
                                            }}
                                            placeholder="+91 XXXXX XXXXX"
                                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none transition-all font-medium text-navy-900 text-sm ${validationErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-primary-500'
                                                }`}
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Gender</label>
                                    <div className="relative">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none appearance-none transition-all font-medium text-navy-900 text-sm"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Occupation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <select
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none appearance-none transition-all font-medium text-navy-900 text-sm"
                                        >
                                            <option value="">Select Occupation</option> 
                                            <option value="Student">Student</option>
                                            <option value="Working Professional">Working Professional</option>
                                            <option value="Business / Self-Employed">Business / Self-Employed</option>
                                            <option value="Retired">Retired</option>
                                            <option value="Homemaker">Homemaker</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Availability</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <select
                                            name="availability"
                                            value={formData.availability}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none appearance-none transition-all font-medium text-navy-900 text-sm"
                                        >
                                            <option value="">Select Availability</option>
                                            <option value="Weekends Only">Weekends Only</option>
                                            <option value="Weekdays Only">Weekdays Only</option>
                                            <option value="Evenings (After 6 PM)">Evenings (After 6 PM)</option>
                                            <option value="Flexible / Full-time">Flexible / Full-time</option>
                                            <option value="Specific Days">Specific Days</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-3 pt-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Skills & Interests (Press Enter to add)</label>
                                <div className="relative">
                                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        placeholder="e.g. First Aid, Teaching, Driving..."
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills?.map((skill) => (
                                        <motion.button
                                            key={skill}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            onClick={() => removeSkill(skill)}
                                            type="button"
                                            className="group flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[11px] font-bold border border-primary-100 hover:bg-primary-500 hover:text-white transition-all"
                                        >
                                            {skill}
                                        <span className="text-primary-300 group-hover:text-white">×</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Mumbai"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Ward</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input
                                            type="text"
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Ward A, Ward K-West"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street, Building, Flat No."
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:outline-none transition-all font-medium text-navy-900 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Documents Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">ID Proof (Aadhar/PAN) *</label>
                                    <div className="relative group">
                                        <div className={`w-full px-3 py-3 bg-gray-50 border-2 border-dashed rounded-2xl group-hover:border-primary-300 transition-all flex items-center gap-3 relative ${validationErrors.id_proof ? 'border-red-400' : 'border-gray-200'
                                            }`}>
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-bold text-navy-900 truncate">
                                                    {idProofFile ? idProofFile.name : 'Upload ID Proof'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        if (validationErrors.id_proof) setValidationErrors(prev => ({ ...prev, id_proof: '' }))
                                                        if (file.type.startsWith('image/')) {
                                                            setEditingFile({ file, type: 'id' })
                                                        } else {
                                                            setIdProofFile(file)
                                                        }
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        {validationErrors.id_proof && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.id_proof}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Passport Photo *</label>
                                    <div className="relative group">
                                        <div className={`w-full px-3 py-3 bg-gray-50 border-2 border-dashed rounded-2xl group-hover:border-primary-300 transition-all flex items-center gap-3 relative ${validationErrors.photo ? 'border-red-400' : 'border-gray-200'
                                            }`}>
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-bold text-navy-900 truncate">
                                                    {photoFile ? photoFile.name : 'Upload Photo'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        if (validationErrors.photo) setValidationErrors(prev => ({ ...prev, photo: '' }))
                                                        setEditingFile({ file, type: 'photo' })
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        {validationErrors.photo && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.photo}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Motivation & Extra Docs */}
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Why do you want to volunteer? *</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                                        <textarea
                                            name="motivation"
                                            value={formData.motivation}
                                            onChange={(e) => {
                                                handleInputChange(e)
                                                if (validationErrors.motivation) {
                                                    setValidationErrors(prev => ({ ...prev, motivation: '' }))
                                                }
                                            }}
                                            placeholder="Tell us about your motivation..."
                                            rows={2}
                                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none transition-all font-medium text-navy-900 text-sm resize-none ${validationErrors.motivation ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-primary-500'
                                                }`}
                                        ></textarea>
                                        {validationErrors.motivation && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 ml-4 uppercase tracking-wider">{validationErrors.motivation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Extra Documents */}
                            <div className="space-y-3 pt-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Additional Documents (Certificates/Experience)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <AnimatePresence>
                                        {extraDocuments.map((file, idx) => (
                                            <motion.div
                                                key={`${file.name}-${idx}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-100 rounded-xl group relative"
                                            >
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                                                    <Paperclip className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-navy-900 truncate">{file.name}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setExtraDocuments(prev => prev.filter((_, i) => i !== idx))}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <div className="relative group min-h-[44px]">
                                        <div className="w-full h-full px-4 py-2 bg-primary-50 border-2 border-dashed border-primary-100 rounded-xl group-hover:border-primary-300 transition-all flex items-center justify-center gap-3 relative cursor-pointer">
                                            <PlusCircle className="w-4 h-4 text-primary-500" />
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Add Document</span>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || [])
                                                    setExtraDocuments(prev => [...prev, ...files])
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group mt-4"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Sidebar - Info Cards */}
                    <aside className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-navy-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <Heart className="w-6 h-6 text-primary-500 fill-current" />
                                Our Impact
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 flex-shrink-0">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Certified Program</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">Join a verified organization and get certified for your community service.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 flex-shrink-0">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Skill Development</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">Enhance your leadership, management, and field-work skills.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 flex-shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Network</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">Connect with like-minded individuals and make a collective difference.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-6 font-black text-navy-900 uppercase tracking-widest text-xs">
                                <Info className="w-5 h-5 text-primary-500" />
                                F.A.Q
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-black text-navy-900 text-[10px] uppercase tracking-[0.2em] mb-2 text-primary-500">How long does it take?</h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">Applications are typically reviewed within 3-5 working days. You&apos;ll receive a phone call or email.</p>
                                </div>
                                <div>
                                    <h4 className="font-black text-navy-900 text-[10px] uppercase tracking-[0.2em] mb-2 text-primary-500">Any age limit?</h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">We welcome everyone! Volunteers below 18 years will need parental consent.</p>
                                </div>
                                <div>
                                    <h4 className="font-black text-navy-900 text-[10px] uppercase tracking-[0.2em] mb-2 text-primary-500">Is it paid?</h4>
                                    <p className="text-gray-600 text-xs leading-relaxed">Volunteering is a voluntary service and is not monetarily compensated.</p>
                                </div>
                            </div>
                        </motion.div>
                    </aside>
                </div>
            </div>

            <Footer />

            {/* Image Editor Modal */}
            {editingFile && (
                <ImageEditor
                    file={editingFile.file}
                    aspectRatio={editingFile.type === 'id' ? undefined : 1} // Free aspect for ID, 1:1 for photo
                    onSave={(editedFile) => {
                        if (editingFile.type === 'id') {
                            setIdProofFile(editedFile)
                        } else {
                            setPhotoFile(editedFile)
                        }
                        setEditingFile(null)
                    }}
                    onCancel={() => setEditingFile(null)}
                />
            )}
        </div>
    )
}
