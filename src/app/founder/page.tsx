'use client'

import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Award, BookOpen, Heart, Globe, MessageSquare, Quote } from 'lucide-react'

export default function FounderPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-900 font-medium">Our Founder</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-navy-900 text-white py-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-primary-400 font-bold tracking-widest uppercase text-sm mb-4 block">Meet The Visionary</span>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                Prakash <span className="text-primary-500">Khote</span>
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                                Founder & President of Ziddi Mumbaikar NGO. A dedicated social reformer committed to the upliftment of Mumbai&apos;s underserved communities through collective action and determination.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                                <Image
                                    src="/MrPrakashMKhote.webp"
                                    alt="Prakash Khote"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-primary-500 p-8 rounded-3xl shadow-xl hidden md:block">
                                <p className="text-4xl font-black mb-1">2018</p>
                                <p className="text-sm font-bold uppercase tracking-wider text-primary-100">Year Founded</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Biography & Journey */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-navy-900">Background & Early Life</h2>
                            </div>
                            <div className="prose prose-lg text-gray-600 space-y-6">
                                <p>
                                    Born and raised in the heart of Mumbai, Prakash Khote witnessed firsthand the stark disparities that define the maximum city. His early exposure to the struggles of everyday Mumbaikars sowed the seeds of social consciousness that would eventually blossom into one of Mumbai&apos;s most active citizen-led NGOs.
                                </p>
                                <p>
                                    With a background in community development and a deep-rooted passion for public service, Prakash spent his formative years volunteering with various local initiatives before deciding to build a platform that could channel the unique &quot;Zidd&quot; (determination) of Mumbaikars toward productive social change.
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-navy-100 rounded-2xl flex items-center justify-center text-navy-600">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-navy-900">Social Activities & Impact</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <Award className="w-10 h-10 text-primary-500 mb-6" />
                                    <h3 className="text-xl font-bold text-navy-900 mb-3">Community Upliftment</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Pioneered multiple programs focusing on education for underprivileged children and health awareness in Mumbai&apos;s suburban clusters.
                                    </p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <Globe className="w-10 h-10 text-primary-500 mb-6" />
                                    <h3 className="text-xl font-bold text-navy-900 mb-3">Environmental Advocacy</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Successfully led various cleanup drives and sustainable waste management initiatives across Mumbai&apos;s beaches and public parks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Specialty Box */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Specialties</h3>
                            <ul className="space-y-4">
                                {['Social Reform', 'Crisis Management', 'Community Building', 'Public Policy Advocacy', 'Sustainable Development'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 font-bold text-gray-700">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Message Box */}
                        <div className="bg-primary-500 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                            <Quote className="absolute top-4 right-4 w-24 h-24 text-white/10" />
                            <h3 className="text-xl font-black mb-4 relative z-10">Founder&apos;s Message</h3>
                            <p className="italic text-primary-50 font-medium leading-relaxed relative z-10">
                                &quot;Ziddi Mumbaikar is not just an organization; it is the spirit of every citizen who believes that we can fix what is broken. Our determination is our greatest asset in building a compassionate and resilient Mumbai.&quot;
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-white py-24 mb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
                <div className="max-w-2xl mx-auto relative z-10">
                    <MessageSquare className="w-16 h-16 text-primary-500 mx-auto mb-8" />
                    <h2 className="text-4xl font-black text-navy-900 mb-6">Connect with Prakash Khote</h2>
                    <p className="text-xl text-gray-500 mb-10">
                        Interested in collaborating on a social project or seeking mentorship in community service?
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-3 bg-navy-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20"
                    >
                        Send a Message
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}
