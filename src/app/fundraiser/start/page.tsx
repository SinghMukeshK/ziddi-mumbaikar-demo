'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { fundraiserService, FundraiserCategory } from '@/services/fundraiser.service'
import { beneficiaryService } from '@/services/beneficiary.service'
import Footer from '@/components/Footer';
import { formatDate, parseDatabaseDate } from '@/lib/date-utils'
import ImageEditor from '@/components/ImageEditor'
import { Pencil, X as XIcon, Star, AlertTriangle, Sparkles } from 'lucide-react'

function StartFundraiserContent() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Category, 2: Details, 3: Story, 4: Documents, 5: Review
  const [formData, setFormData] = useState({
    // Step 1: Category & Type
    category: '',
    fundType: '', // medical, education, disaster, community, etc.

    // Step 2: Basic Details
    title: '',
    targetAmount: '',
    requiredBy: '',
    beneficiaryName: '',
    beneficiaryRelation: '',
    beneficiaryAge: '',
    beneficiaryPhone: '',

    // Step 3: Story & Description
    shortDescription: '',
    fullStory: '',
    currentSituation: '',
    howFundsWillHelp: '',

    // Step 4: Location & Contact
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: '',
    pincode: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',

    // Step 5: Additional Info
    isSadaqahEligible: false,
    isZakatEligible: false,
    isLillahEligible: false,
    isInterestEligible: false,
    taxBenefits: true,
    agreeTerms: false,
    isUrgent: false,
    isFeatured: false,
  })

  const [images, setImages] = useState<File[]>([])
  const [documents, setDocuments] = useState<File[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiCategories, setApiCategories] = useState<FundraiserCategory[]>([])
  // Image editor state
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]) // queue of new files to edit
  const [pendingIndex, setPendingIndex] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fundraiserService.getCategories();
        if (response.success && response.data) {
          setApiCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('medical')) return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m3-3H9" />
      </svg>
    );
    if (normalized.includes('education')) return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
    if (normalized.includes('disaster')) return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
    if (normalized.includes('community')) return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  };

  const eligibilityOptions = ['Sadaqah', 'Zakat', 'Lillah', 'Bank Interest']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const target = e.target as HTMLInputElement

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }))
  }

  const handleEligibilityToggle = (option: string) => {
    const fieldMap: Record<string, string> = {
      'Sadaqah': 'isSadaqahEligible',
      'Zakat': 'isZakatEligible',
      'Lillah': 'isLillahEligible',
      'Bank Interest': 'isInterestEligible'
    };
    const field = fieldMap[option];
    if (field) {
      setFormData(prev => ({
        ...prev,
        [field]: !prev[field as keyof typeof prev]
      }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const slots = 5 - images.length
      const toAdd = newFiles.slice(0, slots)
      if (toAdd.length === 0) return
      // Queue files for editing one by one
      setPendingFiles(toAdd)
      setPendingIndex(0)
      setEditingImageIndex(-1) // -1 = editing from pending queue
      // Reset file input so same file can be re-selected
      e.target.value = ''
    }
  }

  const handleImageEdited = (editedFile: File) => {
    if (editingImageIndex === -1) {
      // Adding new image from pending queue
      setImages(prev => [...prev, editedFile].slice(0, 5))
      const nextIndex = pendingIndex + 1
      if (nextIndex < pendingFiles.length && images.length + nextIndex < 5) {
        setPendingIndex(nextIndex)
        // Stay in pending queue mode, next file will auto-open
      } else {
        setEditingImageIndex(null)
        setPendingFiles([])
        setPendingIndex(0)
      }
    } else if (editingImageIndex !== null && editingImageIndex >= 0) {
      // Editing existing image
      setImages(prev => prev.map((f, i) => i === editingImageIndex ? editedFile : f))
      setEditingImageIndex(null)
    }
  }

  const handleEditorCancel = () => {
    const nextIndex = pendingIndex + 1
    if (editingImageIndex === -1 && nextIndex < pendingFiles.length && images.length + nextIndex < 5) {
      // Skip this file, try next pending
      setPendingIndex(nextIndex)
    } else {
      setEditingImageIndex(null)
      setPendingFiles([])
      setPendingIndex(0)
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files)
      setDocuments(prev => [...prev, ...newDocs].slice(0, 10)) // Max 10 documents
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep1 = () => {
    if (!formData.category) {
      setError('Please select a category')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.title || formData.title.length < 10) {
      setError('Title must be at least 10 characters long')
      return false
    }
    if (!formData.targetAmount || parseInt(formData.targetAmount) < 1000) {
      setError('Target amount must be at least ₹1,000')
      return false
    }
    if (!formData.beneficiaryName) {
      setError('Beneficiary name is required')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!formData.shortDescription || formData.shortDescription.length < 50) {
      setError('Short description must be at least 50 characters')
      return false
    }
    if (!formData.fullStory || formData.fullStory.length < 200) {
      setError('Full story must be at least 200 characters')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    let isValid = false

    switch (step) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      default:
        isValid = true
    }

    if (isValid) {
      setStep(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setError('')

    if (!formData.agreeTerms) {
      setError('Please agree to terms and conditions')
      return
    }

    setLoading(true)

    try {
      // 1. Create unique slug from title
      const baseSlug = formData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
      const uniqueId = Math.random().toString(36).substring(2, 7);
      const uniqueSlug = `${baseSlug}-${uniqueId}`;

      // 1.5 Create Beneficiary first
      let beneficiaryId = undefined;
      try {
        const beneficiaryData = {
          full_name: formData.beneficiaryName,
          phone: formData.beneficiaryPhone,
          aid_type: formData.fundType || 'other',
          case_description: formData.fullStory,
          city: formData.city,
          state: formData.state,
          address: `${formData.locality || ''} ${formData.city || 'Mumbai'} ${formData.state || 'Maharashtra'}`.trim()
        };
        console.log('Attempting to create beneficiary:', beneficiaryData);
        const beneficiaryResult = await beneficiaryService.createBeneficiary(beneficiaryData);
        if (beneficiaryResult.success && beneficiaryResult.data) {
          beneficiaryId = beneficiaryResult.data.id;
          console.log('Beneficiary created successfully:', beneficiaryId);
        }
      } catch (err: any) {
        if (err.status === 409 && err.data?.id) {
          beneficiaryId = err.data.id;
          console.log('Using existing beneficiary profile:', beneficiaryId);
        } else {
          console.error('Failed to create beneficiary profile:', err.message || err);
        }
        // We continue anyway, as beneficiary is optional in some contexts or we can fallback
      }

      // 2. Create the fundraiser FIRST (without image) to get the ID
      const createData: any = {
        title: formData.title,
        slug: uniqueSlug,
        short_description: formData.shortDescription,
        description: formData.fullStory,
        goal_amount: parseFloat(formData.targetAmount),
        beneficiary_id: beneficiaryId,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_story: `${formData.currentSituation}\n\n${formData.howFundsWillHelp}`.trim(),
        start_date: new Date().toISOString().split('T')[0],
        end_date: formData.requiredBy ? parseDatabaseDate(formData.requiredBy).toISOString().split('T')[0] : undefined,
        category_id: formData.category,
        is_zakat_eligible: formData.isZakatEligible,
        is_sadaqah_eligible: formData.isSadaqahEligible,
        is_lillah_eligible: formData.isLillahEligible,
        is_interest_eligible: formData.isInterestEligible,
        is_urgent: formData.isUrgent,
        is_featured: formData.isFeatured,
      };

      console.log('Creating fundraiser with data:', createData);
      const result = await fundraiserService.createFundraiser(createData);
      console.log('Fundraiser creation response:', result);

      const createdFundraiser = result.data || result;
      if (!createdFundraiser?.id) {
        throw new Error('Fundraiser was created but no ID was returned.');
      }

      const fundraiserId = createdFundraiser.id;

      // 3. Now upload the cover image using the real fundraiser ID
      if (images.length > 0) {
        try {
          console.log('Uploading cover image for fundraiser:', fundraiserId);
          const uploadRes = await fundraiserService.uploadMedia(images[0], 'fundraisers', fundraiserId);
          console.log('Cover image upload response:', uploadRes);

          if (uploadRes.success && uploadRes.data?.url) {
            const coverImageUrl = uploadRes.data.url;
            console.log('Cover image URL:', coverImageUrl);

            // 4. Update the fundraiser with the cover image URL
            await fundraiserService.updateFundraiser(fundraiserId, {
              cover_image_url: coverImageUrl
            });
            console.log('Fundraiser updated with cover_image_url');

            // 5. Also add it to the gallery
            await fundraiserService.addFundraiserImages(fundraiserId, {
              image_url: coverImageUrl,
              alt_text: 'Cover Image',
              display_order: 0
            });
          } else {
            console.warn('Cover image upload did not return a URL:', uploadRes);
          }
        } catch (e) {
          console.error('Failed to upload cover image:', e);
          // Non-fatal: fundraiser is created, image just didn't upload
        }

        // 6. Upload additional gallery images (index 1+)
        for (let i = 1; i < images.length; i++) {
          try {
            const uploadRes = await fundraiserService.uploadMedia(images[i], 'fundraisers', fundraiserId);
            if (uploadRes.success && uploadRes.data?.url) {
              await fundraiserService.addFundraiserImages(fundraiserId, {
                image_url: uploadRes.data.url,
                alt_text: `Gallery Image ${i + 1}`,
                display_order: i
              });
            }
          } catch (e) {
            console.error(`Failed to upload gallery image ${i + 1}:`, e);
          }
        }
      }

      // 7. Upload supporting documents
      for (const doc of documents) {
        try {
          const uploadRes = await fundraiserService.uploadMedia(doc, 'fundraisers', fundraiserId);
          if (uploadRes.success && uploadRes.data?.url) {
            await fundraiserService.addFundraiserDocuments(fundraiserId, {
              document_type: 'evidence',
              file_url: uploadRes.data.url,
              file_name: doc.name
            });
          }
        } catch (e) {
          console.error(`Failed to upload document ${doc.name}:`, e);
        }
      }

      // Redirect to success page
      router.push('/fundraisers?created=true')

    } catch (err: any) {
      console.error('Failed to create fundraiser:', err);
      setError(err.message || 'Failed to create fundraiser. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  // Determine which file to edit
  const fileBeingEdited =
    editingImageIndex === -1
      ? pendingFiles[pendingIndex]
      : (editingImageIndex !== null && editingImageIndex >= 0)
        ? images[editingImageIndex]
        : null

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
              Start a <span className="text-primary-500">Fundraiser</span>
            </h1>
            <p className="text-gray-600">
              Create your fundraising campaign and make a difference
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {['Category', 'Details', 'Story', 'Documents', 'Review'].map((label, index) => {
                const stepNumber = index + 1
                const isActive = step === stepNumber
                const isCompleted = step > stepNumber

                return (
                  <div key={label} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isActive ? 'bg-primary-500 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-primary-500 font-semibold' : 'text-gray-600'
                      }`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
            {/* Step 1: Select Category */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Fundraiser Category</h2>
                {apiCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading categories...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.category === cat.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 ${formData.category === cat.id ? 'text-primary-600' : 'text-gray-400'
                            }`}>
                            {getCategoryIcon(cat.name)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{cat.description || 'Campaign for ' + cat.name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Basic Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Fundraiser Details</h2>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fundraiser Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Help 8-Year-Old Hassan Fight Cancer"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Target Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="100000"
                      min="1000"
                    />
                  </div>

                  {/* Required By Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Required By Date
                    </label>
                    <input
                      type="date"
                      name="requiredBy"
                      value={formData.requiredBy}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Beneficiary Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      name="beneficiaryName"
                      value={formData.beneficiaryName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Person/Organization benefiting"
                    />
                  </div>

                  {/* Relation to Beneficiary */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Your Relation to Beneficiary
                    </label>
                    <select
                      name="beneficiaryRelation"
                      value={formData.beneficiaryRelation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select relation</option>
                      <option value="self">Self</option>
                      <option value="parent">Parent/Child</option>
                      <option value="spouse">Spouse</option>
                      <option value="sibling">Sibling</option>
                      <option value="relative">Other Relative</option>
                      <option value="friend">Friend</option>
                      <option value="organization">Organization/NGO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Beneficiary Age */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Beneficiary Age
                    </label>
                    <input
                      type="number"
                      name="beneficiaryAge"
                      value={formData.beneficiaryAge}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Age"
                      min="1"
                    />
                  </div>

                  {/* Beneficiary Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Beneficiary Phone
                    </label>
                    <input
                      type="tel"
                      name="beneficiaryPhone"
                      value={formData.beneficiaryPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Story & Description */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Your Story</h2>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Short Description * (Appears in listing)
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="A brief overview of your fundraiser..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200 characters</p>
                </div>

                {/* Full Story */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Story *
                  </label>
                  <textarea
                    name="fullStory"
                    value={formData.fullStory}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell the complete story - who is the beneficiary, what happened, why help is needed..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.fullStory.length} characters</p>
                </div>

                {/* Current Situation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Current Situation
                  </label>
                  <textarea
                    name="currentSituation"
                    value={formData.currentSituation}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe the current medical condition, financial situation, or circumstances..."
                  />
                </div>

                {/* How Funds Will Help */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    How Will The Funds Help?
                  </label>
                  <textarea
                    name="howFundsWillHelp"
                    value={formData.howFundsWillHelp}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Explain how the raised funds will be used - treatment costs, surgery, medicines, etc..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents & Images */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Images & Documents</h2>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Upload Images
                      <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{images.length}/5</span>
                    </label>
                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">First image = Cover Photo</span>
                  </div>

                  {/* Upload Drop Zone */}
                  {images.length < 5 && (
                    <div className="border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-2xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                          <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="font-bold text-navy-900 text-sm">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB · Each image opens in editor</p>
                      </label>
                    </div>
                  )}

                  {/* Image Previews Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group rounded-2xl overflow-hidden shadow-md border border-gray-100">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-36 object-cover"
                          />
                          {/* Cover badge */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow">
                              <Star className="w-2.5 h-2.5 fill-white" /> Cover
                            </div>
                          )}
                          {/* Hover overlay with actions */}
                          <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingImageIndex(index)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-white text-navy-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-lg"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                            >
                              <XIcon className="w-3 h-3" /> Remove
                            </button>
                          </div>
                          {/* Always visible edit icon */}
                          <button
                            type="button"
                            onClick={() => setEditingImageIndex(index)}
                            className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-navy-900 rounded-full flex items-center justify-center shadow-md hover:bg-primary-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {/* Add more slot */}
                      {images.length < 5 && (
                        <label htmlFor="image-upload" className="cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl h-36 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all">
                          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Add More</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Supporting Documents (Max 10)
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Medical reports, bills, prescriptions, ID proof, etc.</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <div className="text-gray-600">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-1">Click to upload documents</p>
                        <p className="text-xs text-gray-500">PDF, DOC, Images up to 10MB each</p>
                      </div>
                    </label>
                  </div>

                  {/* Document List */}
                  {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Locality</label>
                      <input
                        type="text"
                        name="locality"
                        value={formData.locality}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Andheri, Bandra, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="400001"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Name</label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Fundraiser</h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    <p className="text-gray-700">{apiCategories.find(c => c.id === formData.category)?.name}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Title</h3>
                    <p className="text-gray-700">{formData.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Target Amount</h3>
                      <p className="text-gray-700">₹{parseInt(formData.targetAmount || '0').toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Beneficiary</h3>
                      <p className="text-gray-700">{formData.beneficiaryName}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Story</h3>
                    <p className="text-gray-700 line-clamp-3">{formData.fullStory}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Images & Documents</h3>
                    <p className="text-gray-700">{images.length} images, {documents.length} documents uploaded</p>
                  </div>
                </div>

                {/* Flags — Urgent & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Urgent toggle */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isUrgent: !prev.isUrgent }))}
                    className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${formData.isUrgent
                      ? 'border-red-500 bg-red-50 shadow-md shadow-red-100'
                      : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40'
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.isUrgent ? 'bg-red-500' : 'bg-gray-100'
                      }`}>
                      <AlertTriangle className={`w-5 h-5 ${formData.isUrgent ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-black text-sm uppercase tracking-widest ${formData.isUrgent ? 'text-red-600' : 'text-gray-700'
                          }`}>Urgent Case</span>
                        {/* Toggle pill */}
                        <div className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${formData.isUrgent ? 'bg-red-500' : 'bg-gray-200'
                          }`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isUrgent ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Marks this fundraiser as time-sensitive. Shows a pulsing red badge on the listing.
                      </p>
                    </div>
                  </button>

                  {/* Featured toggle */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${formData.isFeatured
                      ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                      : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.isFeatured ? 'bg-amber-500' : 'bg-gray-100'
                      }`}>
                      <Sparkles className={`w-5 h-5 ${formData.isFeatured ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-black text-sm uppercase tracking-widest ${formData.isFeatured ? 'text-amber-600' : 'text-gray-700'
                          }`}>Featured</span>
                        {/* Toggle pill */}
                        <div className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${formData.isFeatured ? 'bg-amber-500' : 'bg-gray-200'
                          }`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isFeatured ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Highlights this fundraiser on the homepage and listings with a gold Featured badge.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Eligibility */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Eligibility for Donations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eligibilityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleEligibilityToggle(option)}
                        className={`px-4 py-2 rounded-full border-2 transition-colors ${formData[
                          (option === 'Sadaqah' ? 'isSadaqahEligible' :
                            option === 'Zakat' ? 'isZakatEligible' :
                              option === 'Lillah' ? 'isLillahEligible' :
                                'isInterestEligible') as keyof typeof formData
                        ]
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t font-semibold">
                  By clicking Submit, you agree to our Terms and Conditions and verify that all information provided is true and accurate.
                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">I agree to the Terms and Conditions</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Fundraiser'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {fileBeingEdited && (
        <ImageEditor
          file={fileBeingEdited}
          onSave={handleImageEdited}
          onCancel={handleEditorCancel}
          aspectRatio={16 / 9}
        />
      )}
    </>
  )
}

export default function StartFundraiserPage() {
  return (
    <ProtectedRoute>
      <StartFundraiserContent />
      <Footer />
    </ProtectedRoute>
  )
}
