'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-primary-500">Home</Link>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-900 font-medium">Privacy Policy</span>
                    </nav>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-navy-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-navy-200 text-lg max-w-2xl">
                        Your privacy is of utmost importance to us. This policy outlines how Ziddi Mumbaikar collects, uses, and protects your personal information.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-12">

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">1. Information We Collect</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    As a registered NGO, Ziddi Mumbaikar collects personal information that you voluntarily provide to us when you:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Make a donation through our platform.</li>
                                    <li>Register as a volunteer.</li>
                                    <li>Submit a request for assistance or a community cause.</li>
                                    <li>Sign up for our newsletter or contact us with enquiries.</li>
                                </ul>
                                <p>
                                    This information may include your name, email address, phone number, mailing address, and PAN card details (for tax-deductible donation receipts).
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">2. How We Use Your Information</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Process your donations and issue official tax-deductible receipts.</li>
                                    <li>Coordinate volunteer activities and community service projects.</li>
                                    <li>Verify beneficiaries and the legitimacy of funding requests.</li>
                                    <li>Send you updates about our social impact, newsletters, and upcoming campaigns.</li>
                                    <li>Respond to your queries and provide customer support.</li>
                                    <li>Comply with legal and regulatory requirements applicable to NGOs.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">3. Payment & Card Security</h2>
                            <div className="prose prose-navy max-w-none text-gray-600">
                                <p>
                                    For online donations, your credit/debit card details are processed through encrypted and secure transaction protocols provided by our trusted payment gateway partners.
                                    <strong> Ziddi Mumbaikar does not store your credit card numbers, passwords, or CVV details on our servers.</strong> All payment data is handled by certified payment processors to ensure maximum security.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">4. Information Sharing & Disclosure</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    We do not sell, trade, or rent your personal information to third parties for marketing purposes. We may share your data only in the following circumstances:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>With service providers who help us operate our platform (e.g., payment gateways).</li>
                                    <li>When required by law or to comply with a judicial proceeding or court order.</li>
                                    <li>To protect the rights, property, or safety of Ziddi Mumbaikar, our users, or the public.</li>
                                    <li>If you donate to a specific cause, your name (unless opted as "Anonymous") may be shared with the cause beneficiary for transparency.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">5. Data Retention & Your Rights</h2>
                            <div className="prose prose-navy max-w-none text-gray-600 space-y-4">
                                <p>
                                    We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, or as required by financial and legal regulations (such as keeping donation records for audit purposes).
                                </p>
                                <p>
                                    You have the right to request access to the personal data we hold about you, to request corrections to inaccurate data, or to opt-out of marketing communications at any time.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b pb-2">6. Changes to This Policy</h2>
                            <div className="prose prose-navy max-w-none text-gray-600">
                                <p>
                                    Ziddi Mumbaikar may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. We encourage you to review this page periodically. Your continued use of the platform after changes are posted constitutes your acceptance of the revised policy.
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
                                Contact our Data Privacy Officer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
