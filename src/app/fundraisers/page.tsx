'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/Footer'
import { fundraiserService, Fundraiser } from '@/services/fundraiser.service'
import { useAuth } from '@/contexts/AuthContext'
import { Info, ArrowRight, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FundraiserCard from '@/components/FundraiserCard'

const PAGE_LIMIT = 9

function FundraisersList() {
  const searchParams = useSearchParams()
  const showCreatedMessage = searchParams.get('created') === 'true'

  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCancelling, setIsCancelling] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState<string | null>(null)
  const { user } = useAuth()

  // Mutable pagination refs — always up-to-date inside the scroll handler
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const currentPageRef = useRef(1)

  // Stable fetch function — reads from refs so it never goes stale
  const fetchNextPage = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const nextPage = currentPageRef.current + 1
      const response = await fundraiserService.getFundraisers({
        limit: PAGE_LIMIT,
        page: nextPage,
      }) as any
      const newRecords = response.data || []
      setFundraisers(prev => [...prev, ...newRecords])
      currentPageRef.current = nextPage
      setCurrentPage(nextPage)
      const more = response.pagination?.has_more ?? newRecords.length === PAGE_LIMIT
      hasMoreRef.current = more
      setHasMore(more)
    } catch (err: any) {
      console.error('Failed to load more fundraisers:', err)
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [])

  // Scroll-based infinite load — fires when user is within 400px of the page bottom
  useEffect(() => {
    const handleScroll = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      if (distanceFromBottom < 400) {
        fetchNextPage()
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fetchNextPage])

  const [categories, setCategories] = useState<string[]>(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>([])
  const [showSuccessfulOnly, setShowSuccessfulOnly] = useState(false)
  const [showSuccess, setShowSuccess] = useState(showCreatedMessage)

  // Pagination display state (refs above drive the logic; these drive the UI)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const eligibilityOptions = ['Urgent', 'Featured', 'Sadaqah', 'Zakat', 'Lillah', 'Bank Interest']

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fundraiserService.getCategories();
        if (response.success && response.data) {
          const names = response.data.map(c => c.name);
          setCategories(['All', ...names]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Initial load
  useEffect(() => {
    const fetchFundraisers = async () => {
      try {
        setLoading(true)
        currentPageRef.current = 1
        setCurrentPage(1)
        const response = await fundraiserService.getFundraisers({ limit: PAGE_LIMIT, page: 1 }) as any
        const records = response.data || []
        setFundraisers(records)
        const more = response.pagination?.has_more ?? records.length === PAGE_LIMIT
        hasMoreRef.current = more
        setHasMore(more)
      } catch (err: any) {
        console.error('Failed to fetch fundraisers:', err)
        setError('Failed to load fundraisers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchFundraisers()
  }, [])

  useEffect(() => {
    if (showCreatedMessage) {
      const timer = setTimeout(() => setShowSuccess(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [showCreatedMessage])


  // Filter fundraisers
  const filteredFundraisers = fundraisers.filter((fundraiser) => {
    const matchesSearch = fundraiser.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fundraiser.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'All' || fundraiser.category?.name === selectedCategory

    const matchesEligibility = selectedEligibility.length === 0 ||
      (selectedEligibility.includes('Urgent') && fundraiser.is_urgent) ||
      (selectedEligibility.includes('Featured') && fundraiser.is_featured) ||
      (selectedEligibility.includes('Zakat') && fundraiser.is_zakat_eligible) ||
      (selectedEligibility.includes('Sadaqah') && fundraiser.is_sadaqah_eligible) ||
      (selectedEligibility.includes('Lillah') && fundraiser.is_lillah_eligible) ||
      (selectedEligibility.includes('Bank Interest') && fundraiser.is_interest_eligible)

    const matchesStatus = !showSuccessfulOnly ||
      (fundraiser.status === 'completed' || fundraiser.raised_amount >= fundraiser.goal_amount)

    return matchesSearch && matchesCategory && matchesEligibility && matchesStatus
  })

  const handleCancelFundraiser = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this fundraiser? This action cannot be undone.')) return;

    setIsCancelling(id);
    try {
      const response = await fundraiserService.cancelFundraiser(id);
      if (response.success) {
        setFundraisers(prev => prev.map(f => f.id === id ? { ...f, ...response.data } : f));
        alert('Fundraiser has been cancelled.');
      }
    } catch (err: any) {
      console.error('Failed to cancel fundraiser:', err);
      alert(err.response?.data?.message || 'Failed to cancel fundraiser.');
    } finally {
      setIsCancelling(null);
    }
  }

  const handleCompleteFundraiser = async (id: string) => {
    if (!window.confirm('Mark this fundraiser as completed? This will update the status and notify donors.')) return;

    setIsCompleting(id);
    try {
      const response = await fundraiserService.updateFundraiser(id, { status: 'completed' });
      if (response.success) {
        setFundraisers(prev => prev.map(f => f.id === id ? { ...f, ...response.data } : f));
        alert('Fundraiser has been marked as completed.');
      }
    } catch (err: any) {
      console.error('Failed to complete fundraiser:', err);
      alert(err.response?.data?.message || 'Failed to mark fundraiser as completed.');
    } finally {
      setIsCompleting(null);
    }
  }

  const toggleEligibility = (option: string) => {
    setSelectedEligibility(prev =>
      prev.includes(option)
        ? prev.filter(e => e !== option)
        : [...prev, option]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-500">
              Home
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Fundraisers</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900">Fundraiser Created Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your fundraiser has been submitted and is under review. You&apos;ll receive an email once it&apos;s approved and live.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 sticky top-24 border border-gray-100">
              <div className="flex items-center gap-3 mb-4 lg:mb-8">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-navy-900 tracking-widest uppercase">Categories</h2>
              </div>

              {/* Mobile Category Dropdown */}
              <div className="lg:hidden relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-primary-500 transition-all font-bold text-navy-900 appearance-none shadow-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>

              {/* Desktop Category List */}
              <ul className="hidden lg:block space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${selectedCategory === category
                        ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                    >
                      <span className="text-sm font-bold">{category}</span>
                      {selectedCategory === category && (
                        <motion.div layoutId="category-arrow">
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Quick Support Card */}
              <div className="hidden lg:block mt-10 p-6 bg-primary-500 rounded-[1.5rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="font-black text-lg mb-2 relative z-10">Need Help?</h4>
                <p className="text-primary-100 text-xs mb-4 relative z-10 leading-relaxed">
                  Start your own fundraiser and help your community.
                </p>
                <Link
                  href="/fundraisers/create"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-navy-900 hover:text-white transition-all relative z-10 shadow-sm"
                >
                  Start Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8 group">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for fundraisers (e.g. medical, education, food)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white px-6 py-5 pr-16 border-2 border-gray-100 rounded-[1.5rem] focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 text-navy-900 font-medium transition-all shadow-xl shadow-gray-200/30 placeholder:text-gray-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-focus-within:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Premium Filters Section */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 mb-8 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>
                    <button
                      onClick={() => setShowSuccessfulOnly(!showSuccessfulOnly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showSuccessfulOnly
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Funded Only
                    </button>
                  </div>

                  {/* Eligibility Filter */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Eligibility</span>
                    <div className="flex flex-wrap gap-2">
                      {eligibilityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleEligibility(option)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedEligibility.includes(option)
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredFundraisers.length}</span> fundraiser{filteredFundraisers.length !== 1 ? 's' : ''}
                {hasMore && <span className="text-gray-400 text-sm"> — more available</span>}
              </p>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-2 bg-gray-100 rounded-full w-full mt-4" />
                      <div className="h-9 bg-gray-200 rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredFundraisers.map((fundraiser, index) => (
                      <motion.div
                        key={fundraiser.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index < PAGE_LIMIT ? 0 : (index % PAGE_LIMIT) * 0.05 }}
                      >
                        <FundraiserCard
                          fundraiser={fundraiser}
                          index={index}
                          onCancel={handleCancelFundraiser}
                          isCancelling={isCancelling === fundraiser.id}
                          onComplete={handleCompleteFundraiser}
                          isCompleting={isCompleting === fundraiser.id}
                          isAdmin={user?.role === 'admin' || user?.role === 'super_admin'}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* No Results */}
                {filteredFundraisers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No fundraisers found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}

                {/* Scroll-based loading indicator */}
                <div className="mt-8">
                  {loadingMore && (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                      <p className="text-sm text-gray-400 font-medium">Loading more fundraisers...</p>
                    </div>
                  )}

                  {/* All Loaded Indicator */}
                  {!hasMore && fundraisers.length >= PAGE_LIMIT && (
                    <div className="flex items-center gap-4 py-6">
                      <div className="flex-1 h-px bg-gray-200" />
                      <p className="text-sm text-gray-400 font-medium whitespace-nowrap">
                        All {fundraisers.length} fundraisers loaded
                      </p>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function FundraisersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>}>
      <FundraisersList />
    </Suspense>
  )
}
