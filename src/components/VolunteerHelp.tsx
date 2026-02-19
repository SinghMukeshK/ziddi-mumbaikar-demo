"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, HandHelping, ShieldCheck, Zap, PhoneCall, ChevronRight, Users } from 'lucide-react'
import { volunteerService, VolunteerCreateRequest } from '@/services/volunteer.service'
import { beneficiaryService, BeneficiaryCreateRequest } from '@/services/beneficiary.service'

export interface VolunteerHelpProps {
  isModal?: boolean
}

export default function VolunteerHelp({ isModal = false }: VolunteerHelpProps) {
  const [activeTab, setActiveTab] = useState<'volunteer' | 'help'>('volunteer')

  // Form States
  const [formData, setFormData] = useState<Partial<VolunteerCreateRequest>>({ skills: [] })
  const [helpFormData, setHelpFormData] = useState<Partial<BeneficiaryCreateRequest>>({ aid_type: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const interests = [
    'Cleanliness Drives', 'Health Campaigns', 'Emergency Support',
    'Women Safety', 'Environmental Action', 'Youth Programs'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (activeTab === 'volunteer') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setHelpFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const skills = prev.skills || []
      return {
        ...prev,
        skills: skills.includes(interest) ? skills.filter(s => s !== interest) : [...skills, interest]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = activeTab === 'volunteer'
        ? await volunteerService.applyAsVolunteer(formData as VolunteerCreateRequest)
        : await beneficiaryService.createBeneficiary(helpFormData as BeneficiaryCreateRequest)

      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: activeTab === 'volunteer'
            ? 'Application submitted! Our team will contact you soon.'
            : 'Help request submitted. We will verify and reach out.'
        })
        activeTab === 'volunteer' ? setFormData({ skills: [] }) : setHelpFormData({ aid_type: '' })
      } else {
        setSubmitMessage({ type: 'error', text: response.message || 'Submission failed. Please try again.' })
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'An unexpected error occurred. Please try later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="get-involved" className={`relative overflow-hidden ${isModal ? 'py-10 bg-white' : 'py-24 bg-gray-50'}`}>
      {/* Decorative Elements */}
      {!isModal && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-100/40 rounded-full blur-3xl -ml-48 -mb-48"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary-500 font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Community Outreach
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-black text-navy-900 mb-6"
          >
            <span className="text-primary-500">Join Us</span> or Get Help
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Whether you want to volunteer your time or need community support,
            every Mumbai citizen matters to us.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-xl flex gap-1 border border-gray-100">
            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'volunteer' ? 'bg-navy-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <Heart className={`w-5 h-5 ${activeTab === 'volunteer' ? 'fill-primary-500 text-primary-500' : ''}`} />
              I Want to Volunteer
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'help' ? 'bg-navy-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <HandHelping className={`w-5 h-5 ${activeTab === 'help' ? 'text-primary-500' : ''}`} />
              I Need Help
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <motion.div
            layout
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-navy-900/5 border border-gray-100"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <h3 className="text-3xl font-black text-navy-900 mb-3">
                    {activeTab === 'volunteer' ? 'Global Change, Local Action' : 'We Are Here For You'}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'volunteer'
                      ? 'Fill out the form below and our team will get back to you within 24-48 hours.'
                      : 'Please provide accurate details so our verification team can process your request quickly.'}
                  </p>
                </div>

                {submitMessage && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`mb-8 p-6 rounded-2xl flex items-center gap-4 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${submitMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {submitMessage.type === 'success' ? '✓' : '!'}
                    </div>
                    <p className="font-bold">{submitMessage.text}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === 'volunteer' ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">First Name *</label>
                          <input type="text" name="first_name" required value={formData.first_name || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Last Name</label>
                          <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Email Address *</label>
                          <input type="email" name="email" required value={formData.email || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Phone Number *</label>
                          <input type="tel" name="phone" required value={formData.phone || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Areas of Interest</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {interests.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => handleInterestChange(interest)}
                              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.skills?.includes(interest)
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-primary-200'
                                }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Full Name *</label>
                          <input type="text" name="full_name" required value={helpFormData.full_name || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Contact Number *</label>
                          <input type="tel" name="phone" required value={helpFormData.phone || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">Help Type *</label>
                        <select name="aid_type" required value={helpFormData.aid_type || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium appearance-none">
                          <option value="">Select Category</option>
                          {['Medical Assistance', 'Education Support', 'Food/Ration', 'Financial Aid', 'Emergency/Ambulance'].map(opt => (
                            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-black text-navy-900 uppercase tracking-wider ml-1">
                      {activeTab === 'volunteer' ? 'Motivation' : 'Detailed Description'} *
                    </label>
                    <textarea
                      name={activeTab === 'volunteer' ? 'motivation' : 'case_description'}
                      required
                      value={activeTab === 'volunteer' ? formData.motivation : helpFormData.case_description}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium min-h-[120px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative bg-primary-500 hover:bg-primary-600 text-white font-black py-5 rounded-2xl overflow-hidden transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? 'Processing...' : activeTab === 'volunteer' ? 'Join The Movement' : 'Send Help Request'}
                      {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </span>
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-navy-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-colors"></div>

              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Zap className="text-primary-500 fill-primary-500" />
                Why It Matters
              </h3>

              <div className="space-y-8">
                {[
                  { title: "Real Impact", desc: "See immediate tangible changes in your community.", icon: <ShieldCheck className="w-6 h-6 text-primary-500" /> },
                  { title: "Network", desc: "Connect with like-minded change-makers.", icon: <Users className="w-6 h-6 text-primary-500" /> },
                  { title: "Transparency", desc: "Know exactly how your time is helping others.", icon: <Zap className="w-6 h-6 text-primary-500" /> }
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={i}
                    className="flex gap-5"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Emergency Box */}
              <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <PhoneCall className="w-8 h-8 text-primary-500/20" />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-primary-500 mb-4">Urgent Situation?</h4>
                <p className="text-gray-300 text-sm mb-6">Call our 24/7 dedicated community helpline for emergency assistance.</p>
                <a href="tel:9876543210" className="text-3xl font-black hover:text-primary-500 transition-colors">
                  +91 97733 44447
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
