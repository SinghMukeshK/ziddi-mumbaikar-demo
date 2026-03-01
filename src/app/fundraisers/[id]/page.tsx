'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { fundraiserService, Fundraiser, FundraiserUpdate } from '@/services/fundraiser.service'
import { donationService } from '@/services/donation.service'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate, parseDatabaseDate } from '@/lib/date-utils'
import { useRazorpay } from '@/hooks/useRazorpay'
import {
  Heart,
  Share2,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  Calendar,
  Info,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Target,
  FileText,
  AlertCircle,
  PlusCircle,
  X,
  Ban,
  Edit,
  Star,
  Image as ImageIcon,
  Download
} from 'lucide-react'

// Fallback image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80'

export default function FundraiserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null)
  const [readMore, setReadMore] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'images' | 'documents' | 'updates'>('about')
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Donation Form State
  const [donationAmount, setDonationAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [donorPan, setDonorPan] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isMonthly, setIsMonthly] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { openRazorpay } = useRazorpay()

  // Update Form State
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateContent, setUpdateContent] = useState('')
  const [submittingUpdate, setSubmittingUpdate] = useState(false)

  const [loading, setLoading] = useState(true)
  const [extensions, setExtensions] = useState<any>({ images: [], updates: [], documents: [] })
  const [stats, setStats] = useState<any>(null)
  const [submittingDonation, setSubmittingDonation] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchFundraiser = async () => {
      if (!params || !params.id) return;

      try {
        setLoading(true);
        const [fundResponse, extResponse, statsResponse] = await Promise.all([
          fundraiserService.getFundraiserById(params.id as string),
          fundraiserService.getFundraiserExtensions(params.id as string),
          fundraiserService.getFundraiserStats(params.id as string)
        ]);
        setFundraiser(fundResponse.data);
        setExtensions(extResponse.data);
        setStats(statsResponse.data);
      } catch (err: any) {
        console.error('Failed to fetch fundraiser:', err);
        setError('Fundraiser not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchFundraiser();
  }, [params]);

  const canAddUpdate = user && fundraiser && (user.id === fundraiser.created_by || user.role === 'admin' || user.role === 'super_admin');

  const progress = fundraiser ? (Number(fundraiser.raised_amount) / Number(fundraiser.goal_amount)) * 100 : 0
  const predefinedAmounts = [500, 1000, 2000, 5000]

  const handleDonateClick = () => {
    setShowDonationModal(true)
    setError('')
    setFormErrors({})
    setPaymentStep('form')
  }

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString())
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value)
    setDonationAmount('')
  }

  const getFinalAmount = () => {
    return customAmount ? parseInt(customAmount) : parseInt(donationAmount)
  }

  const [lastDonationId, setLastDonationId] = useState<string | null>(null)
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null)

  const handleDonationSubmit = async () => {
    setError('')
    const finalAmount = getFinalAmount()
    const errors: Record<string, string> = {}

    // Amount validation
    if (!finalAmount || isNaN(finalAmount)) {
      errors.amount = 'Please select or enter a donation amount'
    } else if (finalAmount < 100) {
      errors.amount = 'Minimum donation amount is ₹100'
    } else if (finalAmount > 1000000) {
      errors.amount = 'Maximum donation amount is ₹10,00,000'
    }

    if (!isAnonymous) {
      // Name
      if (!donorName.trim()) {
        errors.name = 'Full name is required'
      } else if (donorName.trim().length < 2) {
        errors.name = 'Please enter your full name'
      }

      // Email
      if (!donorEmail.trim()) {
        errors.email = 'Email address is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
        errors.email = 'Please enter a valid email address'
      }

      // Phone
      if (!donorPhone.trim()) {
        errors.phone = 'Phone number is required'
      } else if (!/^[6-9]\d{9}$/.test(donorPhone.replace(/\s/g, ''))) {
        errors.phone = 'Enter a valid 10-digit Indian mobile number'
      }

      // PAN (optional but validate format if entered)
      if (donorPan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(donorPan.trim())) {
        errors.pan = 'Invalid PAN format (e.g. ABCDE1234F)'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    setSubmittingDonation(true)
    setPaymentStep('processing')

    let finalDonationId = ''

    try {
      if (isMonthly) {
        // Step 1: Create Razorpay subscription on backend
        const orderResponse = await donationService.createRazorpaySubscription({
          fundraiser_id: fundraiser!.id,
          amount: finalAmount,
          currency: 'INR',
          frequency: 'monthly',
          donor_name: isAnonymous ? 'Anonymous' : donorName,
          donor_email: isAnonymous ? '' : donorEmail,
          donor_phone: isAnonymous ? '' : donorPhone,
          donor_pan: isAnonymous ? '' : donorPan,
          is_anonymous: isAnonymous,
          donation_type: 'general',
        })

        if (!orderResponse.success || !orderResponse.data) {
          throw new Error('Failed to create subscription order. Please try again.')
        }

        const { subscription_id, internal_subscription_id, key_id } = orderResponse.data as any
        finalDonationId = internal_subscription_id

        // Step 2: Open Razorpay checkout popup
        const paymentResponse = await openRazorpay({
          key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          name: 'Ziddi Mumbaikar',
          description: fundraiser!.title,
          image: fundraiser!.cover_image_url || undefined,
          subscription_id: subscription_id,
          prefill: {
            name: isAnonymous ? '' : donorName,
            email: isAnonymous ? '' : donorEmail,
            contact: isAnonymous ? '' : donorPhone,
          },
          theme: { color: '#f0750a' },
          modal: { confirm_close: true },
        })

        // Step 3: Verify payment signature on backend
        await donationService.verifyPayment(internal_subscription_id, {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id || '',
          razorpay_subscription_id: subscription_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        } as any)

        setPaymentStep('success')
        setLastDonationId(internal_subscription_id)
      } else {
        // Step 1: Create Razorpay order on backend
        const orderResponse = await donationService.createRazorpayOrder({
          fundraiser_id: fundraiser!.id,
          amount: finalAmount,
          currency: 'INR',
          donor_name: isAnonymous ? 'Anonymous' : donorName,
          donor_email: isAnonymous ? '' : donorEmail,
          donor_phone: isAnonymous ? '' : donorPhone,
          donor_pan: isAnonymous ? '' : donorPan,
          is_anonymous: isAnonymous,
          donation_type: 'general',
        })

        if (!orderResponse.success || !orderResponse.data) {
          throw new Error('Failed to create payment order. Please try again.')
        }

        const { donation_id, razorpay_order_id, amount: orderAmount, currency, key_id } = orderResponse.data
        finalDonationId = donation_id

        // Step 2: Open Razorpay checkout popup
        const paymentResponse = await openRazorpay({
          key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: orderAmount,
          currency,
          name: 'Ziddi Mumbaikar',
          description: fundraiser!.title,
          image: fundraiser!.cover_image_url || undefined,
          order_id: razorpay_order_id,
          prefill: {
            name: isAnonymous ? '' : donorName,
            email: isAnonymous ? '' : donorEmail,
            contact: isAnonymous ? '' : donorPhone,
          },
          theme: { color: '#f0750a' },
          modal: { confirm_close: true },
        })

        // Step 3: Verify payment signature on backend
        await donationService.verifyPayment(donation_id, {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        })

        setPaymentStep('success')
        setLastDonationId(donation_id)
      }

      // Fetch the donation to get the official receipt number (donation_number)
      try {
        const donationDetails = await donationService.getDonationById(finalDonationId);
        if (donationDetails.data && donationDetails.data.donation_number) {
          setReceiptNumber(donationDetails.data.donation_number);
        }
      } catch (err) {
        console.error('Could not fetch donation details for receipt number', err);
      }

      // Refresh fundraiser data
      const updatedResponse = await fundraiserService.getFundraiserById(params.id as string)
      setFundraiser(updatedResponse.data)

    } catch (err: any) {
      console.error('Donation error:', err)
      setPaymentStep('form')
      // Don't show error if user simply closed the popup
      if (err.message !== 'Payment cancelled by user') {
        setError(err.message || 'Failed to process donation. Please try again.')
      }
    } finally {
      setSubmittingDonation(false)
    }
  }

  const handleDownloadSlip = () => {
    // For now, we'll open the browser print dialog or a dedicated receipt page
    // In a real app, this might fetch a generated PDF from the backend
    window.print();
  }

  const handleCancelFundraiser = async () => {
    if (!fundraiser || !window.confirm('Are you sure you want to cancel this fundraiser? This action cannot be undone.')) return;

    setIsCancelling(true);
    try {
      const response = await fundraiserService.cancelFundraiser(fundraiser.id);
      if (response.success) {
        setFundraiser(response.data);
        alert('Fundraiser has been cancelled.');
      }
    } catch (err: any) {
      console.error('Failed to cancel fundraiser:', err);
      alert(err.response?.data?.message || 'Failed to cancel fundraiser.');
    } finally {
      setIsCancelling(false);
    }
  }

  const handleShare = async () => {
    if (!fundraiser) return;

    const shareData = {
      title: fundraiser.title,
      text: fundraiser.short_description || `Help us support ${fundraiser.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const shareOnPlatform = (platform: string) => {
    if (!fundraiser) return;
    const url = window.location.href;
    const text = fundraiser.short_description || `Help us support ${fundraiser.title}`;
    let shareUrl = '';

    switch (platform) {
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'WhatsApp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleUpdateSubmit = async () => {
    if (!updateTitle || !updateContent) {
      alert('Please fill in both title and content for the update.')
      return
    }

    setSubmittingUpdate(true)
    try {
      await fundraiserService.addFundraiserUpdate(fundraiser!.id, {
        title: updateTitle,
        content: updateContent
      })

      const extResponse = await fundraiserService.getFundraiserExtensions(fundraiser!.id)
      setExtensions(extResponse.data)

      setShowUpdateModal(false)
      setUpdateTitle('')
      setUpdateContent('')
      setActiveTab('updates')
    } catch (err: any) {
      console.error('Failed to post update:', err)
      alert(err.response?.data?.message || 'Failed to post update.')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Details</p>
        </div>
      </div>
    )
  }

  if (error || !fundraiser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-10 py-16 bg-white rounded-[3rem] shadow-2xl border border-gray-100 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Case Not Found</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">{error || 'The fundraiser you are looking for does not exist or has been removed.'}</p>
          <Link
            href="/fundraisers"
            className="inline-flex items-center gap-3 px-10 py-4 bg-navy-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary-500 transition-all shadow-xl shadow-navy-900/20"
          >
            Go Back <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white print:hidden">
        {/* Immersive Header / Breadcrumb */}
        <div className="bg-gray-50/50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/fundraisers" className="hover:text-primary-500 transition-colors">Fundraisers</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-navy-900 truncate max-w-[200px]">{fundraiser.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Premium Hero Section */}
              <div className="space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-bold text-navy-900 leading-[1.2] tracking-tight"
                >
                  {fundraiser.title}
                </motion.h1>

                {/* Image Carousel */}
                {(() => {
                  // Build ordered image list: cover first, then gallery extras
                  const galleryUrls: string[] = (extensions.images || [])
                    .map((img: any) => img.image_url)
                    .filter(Boolean)
                  const coverUrl = fundraiser.cover_image_url || DEFAULT_IMAGE
                  // Deduplicate: if cover is already in gallery, don't show it twice
                  const allImages = [
                    coverUrl,
                    ...galleryUrls.filter(u => u !== coverUrl)
                  ]
                  const total = allImages.length
                  const goPrev = () => setCurrentImageIndex(i => (i - 1 + total) % total)
                  const goNext = () => setCurrentImageIndex(i => (i + 1) % total)
                  const safeIndex = Math.min(currentImageIndex, total - 1)

                  return (
                    <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 group">
                      {/* Images */}
                      {allImages.map((url, idx) => (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-opacity duration-500 ${idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                          <Image
                            src={url}
                            alt={`${fundraiser.title} - image ${idx + 1}`}
                            fill
                            className={`object-cover transition-transform duration-[2000ms] ${idx === safeIndex ? 'scale-105' : 'scale-100'
                              }`}
                            priority={idx === 0}
                          />
                        </div>
                      ))}

                      {/* Visual Badges on Image */}
                      <div className="absolute top-4 left-4 md:top-6 md:left-6 right-16 md:right-auto flex flex-wrap md:flex-col items-start gap-2 md:gap-3 z-20">
                        {fundraiser.is_urgent && (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg"
                          >
                            <Clock className="w-3.5 h-3.5" /> Urgent Case
                          </motion.div>
                        )}
                        {fundraiser.is_featured && (
                          <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-current" /> Featured Case
                          </div>
                        )}
                        {fundraiser.is_zakat_eligible && (
                          <div className="bg-white/90 backdrop-blur-md text-navy-900 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary-500" /> Zakat Eligible
                          </div>
                        )}
                        {fundraiser.status === 'cancelled' && (
                          <div className="bg-navy-900 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                            <Ban className="w-3.5 h-3.5 text-red-500" /> Cancelled
                          </div>
                        )}
                      </div>

                      {/* Share button */}
                      <div className="absolute bottom-6 right-6 z-20">
                        <button
                          onClick={handleShare}
                          className="bg-white/90 backdrop-blur-md text-navy-900 p-4 rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-all transform hover:rotate-12"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Prev / Next arrows — only when multiple images */}
                      {total > 1 && (
                        <>
                          <button
                            onClick={goPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-md text-navy-900 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:text-white hover:scale-110"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-md text-navy-900 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:text-white hover:scale-110"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Dot indicators */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                            {allImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`rounded-full transition-all ${idx === safeIndex
                                  ? 'w-6 h-2.5 bg-white shadow-md'
                                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                                  }`}
                                aria-label={`Go to image ${idx + 1}`}
                              />
                            ))}
                          </div>

                          {/* Image counter */}
                          <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                            {safeIndex + 1} / {total}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()}

              </div>

              {/* Premium Tabs Section */}
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 px-8 bg-gray-50/30 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'about', label: 'Our Story', icon: Info },
                    { id: 'images', label: 'Gallery', icon: Edit },
                    { id: 'documents', label: 'Verification', icon: ShieldCheck },
                    { id: 'updates', label: 'Updates', icon: Clock }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative px-4 sm:px-8 py-4 sm:py-6 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 hover:text-navy-900'
                        }`}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-300'}`} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-10">
                  <AnimatePresence mode="wait">
                    {activeTab === 'about' && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium italic border-l-4 border-primary-500 pl-6 mb-10">
                            {fundraiser.short_description}
                          </p>
                          <div className="text-navy-900 leading-relaxed space-y-6">
                            {fundraiser.description.split('\n').map((para: string, i: number) => (
                              para.trim() && <p key={i} className="text-lg leading-[1.8]">{para}</p>
                            ))}
                          </div>
                        </div>

                        {fundraiser.beneficiary_story && (
                          <div className="pt-8 border-t border-gray-100">
                            <div className={`overflow-hidden transition-all duration-700 ${readMore ? 'max-h-[5000px]' : 'max-h-[300px] relative'}`}>
                              <div className="text-gray-700 space-y-6 leading-[1.8]">
                                {fundraiser.beneficiary_story.split('\n').map((para: string, i: number) => (
                                  para.trim() && <p key={i}>{para}</p>
                                ))}
                              </div>
                              {!readMore && (
                                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
                              )}
                            </div>

                            <div className="text-center mt-8">
                              <button
                                onClick={() => setReadMore(!readMore)}
                                className="group inline-flex items-center gap-3 px-8 py-3 bg-navy-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-navy-900/20"
                              >
                                {readMore ? 'Show Less' : 'Full Impact Story'}
                                <ArrowRight className={`w-4 h-4 transition-transform ${readMore ? '-rotate-90' : 'group-hover:translate-x-1'}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'images' && (
                      <motion.div
                        key="images"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {extensions.images && extensions.images.length > 0 ? (
                            extensions.images.map((img: any, index: number) => (
                              <motion.div
                                key={img.id || index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-gray-100 group"
                              >
                                <Image
                                  src={img.image_url}
                                  alt={img.alt_text || `Gallery Image ${index + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                  <p className="text-white text-xs font-bold uppercase tracking-widest">{img.alt_text || 'View Image'}</p>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                              <h4 className="text-xl font-bold text-navy-900 mb-2">No Gallery Images</h4>
                              <p className="text-gray-500 max-w-xs mx-auto">The organizer hasn&apos;t uploaded any gallery images for this case yet.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'documents' && (
                      <motion.div
                        key="documents"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-10"
                      >
                        <div className="bg-primary-50 rounded-3xl p-8 flex items-start gap-6 border border-primary-100">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-500 shadow-sm flex-shrink-0">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-navy-900 mb-2">Verified Fundraiser</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                              This fundraiser has been manually verified by our team. All documents provided are thoroughly checked to ensure transparency and trust.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {extensions.documents && extensions.documents.length > 0 ? (
                            extensions.documents.map((doc: any) => (
                              <a
                                key={doc.id}
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-primary-500 hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-primary-500/10"
                              >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary-500 shadow-inner">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-navy-900 truncate uppercase tracking-tight">{doc.file_name || doc.document_type}</p>
                                  <p className="text-[10px] font-bold text-primary-500 uppercase">View Document</p>
                                </div>
                                <motion.div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                  <ArrowRight className="w-5 h-5 text-primary-500" />
                                </motion.div>
                              </a>
                            ))
                          ) : (
                            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                              <p className="font-bold text-sm">No verification documents uploaded yet.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'updates' && (
                      <motion.div
                        key="updates"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-12"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-navy-900 uppercase tracking-widest">Campaign Timeline</h4>
                          {canAddUpdate && (
                            <div className="flex items-center gap-3">
                              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <Link
                                  href={`/fundraisers/${fundraiser.id}/edit`}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-200"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit Case
                                </Link>
                              )}
                              {(user?.role === 'admin' || user?.role === 'super_admin') && fundraiser.status !== 'cancelled' && (
                                <button
                                  onClick={handleCancelFundraiser}
                                  disabled={isCancelling}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                                >
                                  <Ban className="w-3.5 h-3.5" /> {isCancelling ? 'Cancelling...' : 'Cancel Case'}
                                </button>
                              )}
                              <button
                                onClick={() => setShowUpdateModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-navy-900/10"
                              >
                                <PlusCircle className="w-3.5 h-3.5" /> Post Update
                              </button>
                            </div>
                          )}
                        </div>

                        {extensions.updates && extensions.updates.length > 0 ? (
                          <div className="space-y-12 relative">
                            <div className="absolute left-6 top-8 bottom-8 w-px bg-gray-100" />
                            {extensions.updates.map((update: any) => (
                              <div key={update.id} className="relative pl-16">
                                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-primary-500 ring-8 ring-primary-50" />
                                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2 text-primary-500 font-bold text-[10px] uppercase tracking-widest mb-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(update.created_at, {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <h4 className="text-xl font-black text-navy-900 mb-4">{update.title}</h4>
                                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                    {update.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="max-w-xl mx-auto text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                              <Clock className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-bold text-navy-900">Campaign Launched</h4>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              The fundraiser was successfully launched on
                              <span className="text-primary-600"> {formatDate(fundraiser.start_date)}.</span>
                              Currently, we are collecting donations to reach our goal. Stay tuned for further updates!
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Column - Premium Sticky Side Panel */}
            <div className="lg:col-span-4">
              <div className="sticky top-12 space-y-8">
                {/* Premium Donation Progress Card */}
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                  <button
                    onClick={handleDonateClick}
                    disabled={fundraiser.status === 'completed' || fundraiser.status === 'cancelled'}
                    className={`group relative w-full ${fundraiser.status === 'completed' ? 'bg-green-600 shadow-green-600/20' : fundraiser.status === 'cancelled' ? 'bg-gray-400' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1'
                      } text-white font-bold py-6 rounded-[1.5rem] mb-10 flex items-center justify-center gap-3 text-xl transition-all shadow-xl disabled:opacity-80 disabled:cursor-not-allowed`}
                  >
                    <Heart className={`w-6 h-6 ${fundraiser.status === 'completed' ? 'fill-white' : 'fill-white group-hover:scale-125'} transition-transform`} />
                    {fundraiser.status === 'completed' ? 'Successfully Done' : fundraiser.status === 'cancelled' ? 'Campaign Cancelled' : 'Donate Now'}
                  </button>

                  {/* Big Progress Stats */}
                  <div className="space-y-8 mb-10">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Raised</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-navy-900 tracking-tight">₹{Number(fundraiser.raised_amount).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-primary-500">{progress.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* High Definition Progress Bar */}
                    <div className="space-y-3">
                      <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-orange-400 rounded-full shadow-[0_0_15px_rgba(240,117,10,0.3)]"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-primary-500">{fundraiser.donor_count || 0} Supporters</span>
                        <span className="text-gray-500 text-[10px] font-bold uppercase">Goal: ₹{Number(fundraiser.goal_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Signal / Organizer */}
                  <div className="flex items-center gap-4 p-5 bg-navy-50 rounded-2xl border border-navy-100">
                    <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <span className="text-xs font-bold">
                        ZM
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Organizer</p>
                      <p className="text-sm font-bold text-navy-900 truncate">
                        Ziddi Mumbaikar
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Share Strip */}
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Spread the Word</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {['Facebook', 'Twitter', 'WhatsApp'].map(plat => (
                        <button
                          key={plat}
                          onClick={() => shareOnPlatform(plat)}
                          className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Supporters Card */}
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-100/30 p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-500" />
                      Supporters ({fundraiser.donor_count || 0})
                    </h3>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {fundraiser.donations && fundraiser.donations.length > 0 ? (
                      fundraiser.donations.map((donation: any) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          key={donation.id}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-navy-900 font-bold text-xs ring-4 ring-gray-50 group-hover:ring-primary-100 transition-all">
                              {donation.donor_name ? donation.donor_name[0] : 'A'}
                            </div>
                            <div>
                              <p className="font-bold text-navy-900 text-sm tracking-normal capitalize">
                                {donation.donor_name || 'Anonymous'}
                              </p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {formatDate(donation.created_at, {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100">
                            <span className="font-bold text-primary-600 text-sm">₹{donation.amount.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Target className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">No supporters yet.</p>
                        <button
                          onClick={handleDonateClick}
                          className="text-primary-500 text-[10px] font-black uppercase mt-2 hover:underline"
                        >
                          Be the first!
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Donation Modal */}
        <AnimatePresence>
          {showDonationModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDonationModal(false)}
                className="absolute inset-0 bg-white/60 backdrop-blur-xl"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
              >
                {/* Modal Header - Lightweight Version */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 relative flex-shrink-0">
                  <button
                    onClick={() => setShowDonationModal(false)}
                    className="absolute top-4 sm:top-8 right-4 sm:right-8 w-8 sm:w-10 h-8 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-navy-900 hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-[1.5rem] flex items-center justify-center mb-4 ring-8 ring-primary-50/50">
                      <Heart className="w-8 h-8 text-primary-600 fill-primary-600" />
                    </div>
                    <h3 className="text-2xl font-black text-navy-900 tracking-tight">Support this cause</h3>
                    <p className="text-gray-600 text-[11px] font-bold uppercase tracking-[0.15em] mt-1">Your contribution changes lives</p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 sm:px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
                  {paymentStep === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-4 sm:py-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 mb-4 sm:mb-6"
                      >
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </motion.div>
                      <div className="text-center w-full px-2 sm:px-4">
                        <h4 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight mb-2">Thank You!</h4>
                        <div className="bg-green-100 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full inline-block mb-4 sm:mb-6 border border-green-200">
                          <p className="text-[10px] sm:text-[12px] font-black text-green-900 uppercase tracking-widest">Donation Successful</p>
                        </div>
                        <p className="text-sm sm:text-base text-navy-900 font-bold leading-relaxed">
                          Your contribution of <br className="sm:hidden" /><span className="text-primary-600 font-black text-xl sm:text-2xl inline-block mt-1 sm:mt-0">₹{getFinalAmount()?.toLocaleString()}</span> has been received.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 sm:mt-10 w-full px-2 sm:px-4">
                        <button
                          onClick={() => window.print()}
                          className="w-full sm:w-auto px-8 py-4 bg-primary-500 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-[12px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download Receipt
                        </button>
                        <button
                          onClick={() => setShowDonationModal(false)}
                          className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-navy-900 rounded-xl sm:rounded-2xl text-[11px] sm:text-[12px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                          Close Window
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-700 text-[12px] font-bold uppercase tracking-wider"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      {/* Amount Selection */}
                      <div className="space-y-6 mb-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <label className="text-[12px] font-black uppercase tracking-wider text-navy-900">Select Amount</label>
                          <span className="text-[11px] font-black text-primary-600">Min. ₹100</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {predefinedAmounts.map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => { handleAmountSelect(amount); setFormErrors(e => ({ ...e, amount: '' })) }}
                              className={`py-4 rounded-xl font-black text-sm transition-all border-2 ${donationAmount === amount.toString()
                                ? 'bg-navy-900 border-navy-900 text-white shadow-lg shadow-navy-900/40'
                                : formErrors.amount
                                  ? 'bg-white border-red-300 text-navy-900 hover:border-red-400'
                                  : 'bg-white border-gray-200 text-navy-900 hover:border-primary-500/50 hover:bg-primary-50/10'
                                }`}
                            >
                              ₹{amount.toLocaleString()}
                            </button>
                          ))}
                        </div>

                        {/* Custom Amount Field */}
                        <div className="space-y-1">
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-navy-900 group-focus-within:text-primary-600 transition-colors font-black text-base">₹</div>
                            <input
                              type="number"
                              value={customAmount}
                              onChange={(e) => { handleCustomAmountChange(e); setFormErrors(f => ({ ...f, amount: '' })) }}
                              placeholder="Enter custom amount..."
                              className={`w-full bg-gray-50 border-2 rounded-2xl py-5 pl-12 pr-6 focus:outline-none focus:bg-white transition-all font-black text-navy-900 placeholder:text-gray-400 text-base ${formErrors.amount
                                ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                                : 'border-gray-100 focus:border-primary-500'
                                }`}
                            />
                          </div>
                          {formErrors.amount && (
                            <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                              <AlertCircle className="w-3 h-3" />{formErrors.amount}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Donor Information */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <label className="text-[12px] font-black uppercase tracking-wider text-navy-900">Your Details</label>
                          <button
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isAnonymous ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {isAnonymous ? <CheckCircle2 className="w-3 h-3" /> : null}
                            Anonymous
                          </button>
                        </div>

                        {!isAnonymous && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black uppercase tracking-widest text-navy-900 ml-1">
                                Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={donorName}
                                onChange={(e) => { setDonorName(e.target.value); setFormErrors(f => ({ ...f, name: '' })) }}
                                placeholder="Your Name"
                                className={`w-full bg-gray-50 border-2 rounded-xl py-4 px-5 focus:outline-none focus:bg-white transition-all font-bold text-navy-900 text-sm placeholder:text-gray-400 ${formErrors.name ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-primary-500'
                                  }`}
                              />
                              {formErrors.name && (
                                <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                                  <AlertCircle className="w-3 h-3" />{formErrors.name}
                                </p>
                              )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black uppercase tracking-widest text-navy-900 ml-1">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={donorEmail}
                                onChange={(e) => { setDonorEmail(e.target.value); setFormErrors(f => ({ ...f, email: '' })) }}
                                placeholder="email@example.com"
                                className={`w-full bg-gray-50 border-2 rounded-xl py-4 px-5 focus:outline-none focus:bg-white transition-all font-bold text-navy-900 text-sm placeholder:text-gray-400 ${formErrors.email ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-primary-500'
                                  }`}
                              />
                              {formErrors.email && (
                                <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                                  <AlertCircle className="w-3 h-3" />{formErrors.email}
                                </p>
                              )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black uppercase tracking-widest text-navy-900 ml-1">
                                Phone <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                value={donorPhone}
                                onChange={(e) => { setDonorPhone(e.target.value); setFormErrors(f => ({ ...f, phone: '' })) }}
                                placeholder="Phone Number"
                                className={`w-full bg-gray-50 border-2 rounded-xl py-4 px-5 focus:outline-none focus:bg-white transition-all font-bold text-navy-900 text-sm placeholder:text-gray-400 ${formErrors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-primary-500'
                                  }`}
                              />
                              {formErrors.phone && (
                                <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                                  <AlertCircle className="w-3 h-3" />{formErrors.phone}
                                </p>
                              )}
                            </div>

                            {/* PAN */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black uppercase tracking-widest text-navy-900 ml-1">PAN (Optional)</label>
                              <input
                                type="text"
                                value={donorPan}
                                onChange={(e) => { setDonorPan(e.target.value.toUpperCase()); setFormErrors(f => ({ ...f, pan: '' })) }}
                                placeholder="PAN Number"
                                maxLength={10}
                                className={`w-full bg-gray-50 border-2 rounded-xl py-4 px-5 focus:outline-none focus:bg-white transition-all font-bold text-navy-900 uppercase text-sm placeholder:text-gray-400 ${formErrors.pan ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-primary-500'
                                  }`}
                              />
                              {formErrors.pan && (
                                <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                                  <AlertCircle className="w-3 h-3" />{formErrors.pan}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Subscription Option */}
                      <div className="mt-6 flex flex-col p-5 bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl border border-primary-100/50 cursor-pointer overflow-hidden relative group"
                        onClick={() => setIsMonthly(!isMonthly)}>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${isMonthly ? 'border-primary-600 bg-primary-600' : 'border-primary-300 bg-white'}`}>
                            {isMonthly && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-navy-900 group-hover:text-primary-700 transition-colors">Make this a monthly donation</p>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Support this cause consistently</p>
                          </div>
                        </div>
                        {isMonthly && (
                          <div className="mt-3 pt-3 border-t border-primary-100/50 text-[11px] font-bold text-primary-700 w-full relative z-10 flex items-center gap-2">
                            <Heart className="w-3 h-3 fill-primary-600" />
                            Your card will be charged monthly. You can cancel anytime.
                          </div>
                        )}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Heart className="w-24 h-24 text-primary-500" />
                        </div>
                      </div>

                      {/* Tax Benefits Info */}
                      {fundraiser.is_zakat_eligible && (
                        <div className="mt-8 p-6 bg-navy-900 rounded-[2rem] shadow-xl shadow-navy-100/50 flex items-start gap-4">
                          <ShieldCheck className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[12px] font-black text-white uppercase tracking-widest">Tax Exemption Available</p>
                            <p className="text-[11px] text-white/80 font-bold leading-relaxed mt-1">80G certificate will be issued for this donation.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                {paymentStep !== 'success' && (
                  <div className="px-6 sm:px-10 py-6 sm:py-10 bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-200 gap-4 sm:gap-8 text-center sm:text-left flex-shrink-0">
                    <div className="flex-shrink-0">
                      <p className="text-[11px] font-black uppercase tracking-widest text-navy-900/60 mb-1 leading-none">{isMonthly ? 'Monthly' : 'Confirming'}</p>
                      <p className="text-3xl font-black text-navy-900 leading-none">
                        ₹{getFinalAmount() ? getFinalAmount().toLocaleString() : '0'}
                        {isMonthly && <span className="text-base font-bold text-gray-400 ml-1 tracking-normal">/mo</span>}
                      </p>
                    </div>
                    <button
                      onClick={handleDonationSubmit}
                      disabled={submittingDonation || !getFinalAmount()}
                      className="flex-1 py-5 bg-primary-500 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/40 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 group"
                    >
                      {submittingDonation ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          {paymentStep === 'processing' ? 'Opening...' : 'Wait...'}
                        </>
                      ) : (
                        <>Proceed to Pay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Campaign Update Modal */}
        <AnimatePresence>
          {showUpdateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUpdateModal(false)}
                className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-navy-900 px-10 py-8 text-white relative">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <PlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Post Campaign Update</h3>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Share the progress with supporters</p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 sm:px-10 py-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900 ml-1">Update Title</label>
                    <input
                      type="text"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="e.g., Surgery Successful / Reached 50% Goal"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900 ml-1">Success Story / Progress Content</label>
                    <textarea
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      rows={6}
                      placeholder="Share detailed information about the progress..."
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary-500 transition-all font-medium text-navy-900 resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 sm:p-10 bg-gray-50 flex items-center justify-end border-t border-gray-100">
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={submittingUpdate || !updateTitle || !updateContent}
                    className="px-10 py-5 bg-navy-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-primary-500 transition-all shadow-xl shadow-navy-900/20 disabled:opacity-50 flex items-center gap-3"
                  >
                    {submittingUpdate ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Publish Update <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>

      {/* Hidden Print Receipt - Only shows when window.print() is called */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
        }
      `}</style>
      <div className="hidden print:block fixed inset-0 z-[1000] p-8 -m-8" style={{ background: '#f9f6e5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', minHeight: '100vh', width: '100vw' }}>
        <div className="max-w-4xl mx-auto border-4 border-[#367d4f] p-1.5 bg-[#f9f6e5] relative">
          <div className="border-[12px] border-[#e86a33] p-1.5">
            <div className="border-[2px] border-[#367d4f] p-8 relative min-h-[600px] flex flex-col justify-between">

              {/* Header Section */}
              <div className="flex items-start gap-4 border-b-2 border-transparent pb-4">
                <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                  {/* Provide a fallback logo text if image fails to load, but ideally logo.webp is present */}
                  <img src="/logo.webp" alt="Ziddi Mumbaikar Logo" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div className="absolute inset-0 flex items-center justify-center uppercase font-black text-[#e86a33] text-center leading-none text-xl z-[-1]">
                    ZM<br />LOGO
                  </div>
                </div>

                <div className="flex-1 text-center pr-10">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f1c40f] drop-shadow-sm tracking-wider font-serif mb-2 whitespace-nowrap" style={{ WebkitTextStroke: "1px #d35400", textShadow: "2px 2px 0px #fff, 3px 3px 0px rgba(0,0,0,0.2)" }}>
                    ZIDDI MUMBAIKAR (NGO)
                  </h1>

                  <div className="bg-[#1f3a93] text-white text-[12px] sm:text-sm py-1.5 px-4 mb-2 inline-block font-bold w-full mx-auto shadow-sm">
                    Registration No. : Maharashtra State, Mumbai 2018 / GBBSD / 1566 / 2018
                  </div>

                  <p className="text-[11px] font-bold text-gray-800 uppercase px-4 sm:px-8 text-center leading-tight">
                    Shop No. 09, Bldg. No. R-5, Gulshan Nagar, Raghvendra Mandir Road, Oshiwara, Jogeshwari (W), Mumbai 400102. Maharashtra. INDIA.
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mt-2 mb-6">
                <h2 className="inline-block text-2xl font-bold text-[#e74c3c] border-b-[3px] border-[#e74c3c] pb-1 tracking-wider uppercase">
                  DONATION RECEIPT
                </h2>
              </div>

              {/* Receipt Details */}
              <div className="flex justify-between items-end mb-8 font-serif">
                <div className="text-[#1f3a93] text-xl font-bold">
                  <span className="italic">No.</span> <span className="text-black ml-2 font-sans font-bold">{receiptNumber || lastDonationId?.substring(0, 8).toUpperCase() || 'REF-PENDING'}</span>
                </div>
                <div className="text-[#1f3a93] text-xl font-bold flex items-end">
                  <span className="italic mr-2">Date :</span>
                  <span className="text-black border-b border-black px-8 font-sans font-bold text-lg pb-1">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              <div className="flex items-end mb-8 font-serif text-xl font-bold w-full">
                <span className="text-[#1f3a93] italic mr-4 whitespace-nowrap">Received with thanks from</span>
                <div className="flex-1 border-b border-black text-black pb-1 uppercase font-sans tracking-wide">
                  {isAnonymous ? 'Anonymous Supporter' : donorName || 'Valued Supporter'}
                </div>
              </div>

              {/* Empty Lines with Dynamic Content */}
              <div className="space-y-8 mb-10 w-full mt-4">
                <div className="w-full border-b border-black text-black pb-1 font-sans text-lg md:text-xl font-bold uppercase tracking-wide flex items-end">
                  <span className="text-[#1f3a93] italic mr-4 normal-case font-serif shrink-0 font-bold">the sum of Rupees</span>
                  <span className="flex-1 truncate">
                    {getFinalAmount().toFixed(2)?.toLocaleString()} via Online Payment (UPI / Card / Netbanking)
                  </span>
                </div>
                {/* <div className="w-full border-b border-black text-black pb-1 font-sans text-lg md:text-xl font-bold uppercase tracking-wide flex items-end">
                  <span className="text-[#1f3a93] italic mr-4 normal-case font-serif shrink-0 font-bold">towards</span>
                  <span className="flex-1 truncate">
                    {fundraiser?.title || 'General Donation'}
                  </span>
                </div> */}
              </div>

              {/* Bottom Section */}
              <div className="flex justify-between items-end mt-4 relative">

                {/* Amount Box */}
                <div className="flex flex-col relative z-10 w-[280px]">
                  <div className="border-[3px] border-[#e74c3c] bg-white flex shadow-[2px_2px_0px_rgba(0,0,0,0.1)] relative">
                    <div className="w-16 flex items-center justify-center border-r-[3px] border-[#e74c3c] bg-blue-50/50">
                      <span className="text-[#1f3a93] text-4xl font-black font-sans -mt-1">₹.</span>
                    </div>
                    <div className="flex-1 px-4 py-3 flex items-center justify-start gap-4 bg-[#f9f6e5]">
                      {/* Checkbox */}
                      <div className="w-5 h-5 border border-black flex items-center justify-center bg-white flex-shrink-0">
                        <div className="w-3 h-3 bg-[#1f3a93] rounded-[1px] opacity-80" />
                      </div>
                      <span className="text-black text-3xl font-black font-sans tracking-tight">
                        {getFinalAmount()?.toLocaleString() || '0'}.00
                      </span>
                    </div>
                    {/* Shadow Decorator to match the slanting shape from the image, using pure CSS borders */}
                  </div>

                  <div className="text-[#1f3a93] text-[11px] font-black mt-2 text-center tracking-wider w-full">
                    SUBJECT TO REALISTION OF CHEQUE
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right pr-4 float-right">
                  <div className="h-16 w-full"></div> {/* Placeholder for Signature image if any */}
                  <div className="text-[#1f3a93] font-black text-xl leading-none mb-1 tracking-wide">PRAKASH M. KHOT</div>
                  <div className="text-[#e74c3c] font-bold text-sm">Founder of the Trust</div>
                </div>

              </div>

              {/* Background Watermark/Pattern (Subtle border pattern from the image) */}
              <div className="absolute top-0 right-0 w-64 h-64 -mr-10 -mt-10 bg-orange-500/5 rounded-full blur-[50px] pointer-events-none z-[-1]" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
