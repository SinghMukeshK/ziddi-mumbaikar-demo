'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-900 font-medium">Terms of Service</span>
                    </nav>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-navy-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-navy-200 text-lg max-w-2xl">
                        Please read these terms and conditions carefully before using our platform. By accessing or using Ziddi Mumbaikar, you agree to be bound by these terms.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-12">

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">1. General Terms</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    Welcome to Ziddi Mumbaikar. These Terms of Service (&quot;Terms&quot;) govern your use of our website and services. Ziddi Mumbaikar is a registered Non-Governmental Organization (NGO) dedicated to community service, social welfare, and fundraising for those in need across Mumbai.
                                </p>
                                <p>
                                    By using our platform, you acknowledge that Ziddi Mumbaikar (Www.ziddimumbaikar.org) directly collects donations to fund its various social initiatives and verified community causes. We are committed to transparency in the collection and disbursement of all funds.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">2. Terms for Donors</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Donations are made voluntarily to support Ziddi Mumbaikar&apos;s social initiatives or specific listed causes. These are non-refundable contributions for charitable purposes.</li>
                                    <li>As a registered NGO, Ziddi Mumbaikar ensures that the maximum possible portion of your donation goes directly toward the intended cause, after minimal administrative and payment gateway processing fees.</li>
                                    <li>Donors will receive acknowledgement for their contributions. Where applicable under Indian law, tax benefit certificates (such as 80G) will be issued directly by Ziddi Mumbaikar or the registered beneficiary organization.</li>
                                    <li>You have the option to remain an &quot;Anonymous&quot; donor, in which case your name and details will not be displayed on our public donor walls.</li>
                                    <li>Ziddi Mumbaikar reserves the right to redirect funds to other similar urgent causes if a specific project&apos;s goal is met or if the project becomes unfeasible.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">3. Terms for Volunteers & Beneficiaries</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <ul className="list-decimal pl-5 space-y-2">
                                    <li>Volunteers agree to act in accordance with the NGO&apos;s code of conduct and represent the organization with integrity.</li>
                                    <li>Beneficiaries and cause creators must provide accurate documentation and information for verification. Ziddi Mumbaikar conducts due diligence before any funds are disbursed.</li>
                                    <li>The NGO has the sole discretion to approve, pause, or reject any request for assistance or fundraising based on internal verification and fund availability.</li>
                                    <li>Funds are disbursed based on project milestones or as deemed appropriate by the NGO&apos;s governing body to ensure effective utilization.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">4. Zakat & Ethical Funding</h2>
                            <div className="prose prose-navy max-w-none text-gray-600">
                                <p>
                                    Ziddi Mumbaikar manages Zakat-eligible funds with the utmost care, adhering to the underlying principles of Zakat collection and disbursement. These funds are tracked separately to ensure they are utilized strictly for eligible beneficiaries and causes.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">5. Privacy & Ethics</h2>
                            <div className="prose prose-navy max-w-none text-gray-600">
                                <p>
                                    We value your trust and privacy. Your data is used solely for the purpose of keeping you updated on our impact and for regulatory compliance. We do not sell or share donor data with third-party commercial entities.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">6. Limitation of Responsibility</h2>
                            <div className="prose prose-navy max-w-none text-gray-600">
                                <p>
                                    While Ziddi Mumbaikar strives for 100% accuracy and effectiveness, the organization is not liable for secondary outcomes or disputes arising from third-party services (like banks/payment gateways) beyond our direct control.
                                </p>
                            </div>
                        </section>

                        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500 font-medium italic">
                                Last updated: March 3, 2026
                            </p>
                            <Link
                                href="/contact"
                                className="text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
                            >
                                Contact our NGO Office
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
