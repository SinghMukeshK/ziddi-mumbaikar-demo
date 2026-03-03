'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TransparencyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-900 font-medium">Transparency</span>
                    </nav>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-navy-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-block bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        Accountability Matters
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Commitment to Transparency</h1>
                    <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
                        At Ziddi Mumbaikar, we believe trust is the foundation of community impact. We are committed to maintaining the highest standards of financial accountability and operational transparency.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-12">

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">01</span>
                                Organization Credentials
                            </h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    Ziddi Mumbaikar is a registered Non-Governmental Organization (NGO) under the laws of India. We operate with valid registrations that allow us to serve the community effectively.
                                </p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Registration No.</p>
                                        <p className="text-sm font-bold text-navy-900">Maharashtra State, Mumbai 2018 / GBBSD / 1566 / 2018</p>
                                    </div>
                                    {/* <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Compliance</p>
                                        <p className="text-sm font-bold text-navy-900 underline decoration-primary-500">80G & 12A Certified</p>
                                    </div> */}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-3">
                                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">02</span>
                                Financial Utilization
                            </h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    We strive to ensure that every rupee donated is used efficiently. Our financial model prioritizes direct impact on the ground.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                                    <div className="text-center p-4 bg-primary-50 rounded-xl">
                                        <p className="text-3xl font-black text-primary-600">92%</p>
                                        <p className="text-xs font-bold text-primary-800 uppercase mt-1">Direct Program Cost</p>
                                    </div>
                                    <div className="text-center p-4 bg-navy-50 rounded-xl">
                                        <p className="text-3xl font-black text-navy-600">5%</p>
                                        <p className="text-xs font-bold text-navy-800 uppercase mt-1">Admin & Operations</p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                                        <p className="text-3xl font-black text-gray-600">3%</p>
                                        <p className="text-xs font-bold text-gray-800 uppercase mt-1">Fundraising & Tech</p>
                                    </div>
                                </div>
                                <p className="text-sm italic">
                                    *Approximate breakdown based on our 2024-25 fiscal plan.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-3">
                                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">03</span>
                                Reporting & Audits
                            </h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    Transparency is maintained through regular internal and external audits. Our books of accounts are maintained with standard accounting practices and are filed periodically with the relevant authorities (Income Tax Department and Charity Commissioner).
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Annual Reports:</strong> We publish an annual impact report summarizing our achievements and financial standing.</li>
                                    <li><strong>Independent Audits:</strong> Our accounts are audited by qualified Chartered Accountants annually.</li>
                                    <li><strong>Real-time Tracking:</strong> For large projects, we provide updates to donors regarding the specific utilization of their funds via our dashboard.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-3">
                                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm">04</span>
                                Governance
                            </h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    Ziddi Mumbaikar is governed by a board of dedicated trustees and advisors who bring together decades of experience in social service, law, and administration. The board ensures that all activities align with our core mission of serving Mumbai&apos;s underserved populations.
                                </p>
                                <p>
                                    The governing body meets quarterly to review project progress, financial health, and community needs, ensuring that &quot;Zid&quot; (determination) is always translated into effective action.
                                </p>
                            </div>
                        </section>

                        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                            <div>
                                <p className="text-sm text-gray-500 font-medium italic">
                                    For detailed audit reports or specific queries, please write to us.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-navy-900 text-white hover:bg-navy-800 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                Request Data
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
