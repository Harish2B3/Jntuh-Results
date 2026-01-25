
import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-3xl mx-auto glass-card p-8 sm:p-12 relative z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 border-b-2 border-rose-100 pb-4">
                    JNTUH Fast Track – Terms of Use
                </h1>

                <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                    <p className="font-semibold text-rose-600 mb-6">Last updated: January 01, 2026</p>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h3>
                        <p className="font-medium">
                            By accessing or using the <span className="text-rose-600 font-bold">Different JNTUH Results</span> app/website, you agree to follow and be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use the app.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">2. Accuracy of Information</h3>
                        <p className="font-medium mb-2">
                            We make our best effort to display JNTUH results correctly. However, we do not guarantee the accuracy, completeness, or reliability of the results shown in the app.
                        </p>
                        <p className="font-medium">
                            All results are retrieved directly from the official <span className="font-bold text-slate-800">JNTUH University results website</span>.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">3. Discrepancies and Inaccuracies</h3>
                        <p className="font-medium mb-2">
                            In case of any mismatch, error, or discrepancy in the displayed results, the official JNTUH website should be considered the final and correct source.
                        </p>
                        <p className="font-medium">
                            We encourage users to verify important academic information from official sources.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">4. Use of Information</h3>
                        <p className="font-medium mb-2">
                            The information provided through this app is for convenience and reference purposes only. Users are fully responsible for how they use the information obtained from the app.
                        </p>
                        <p className="font-medium">
                            We are not liable for any decisions or actions taken based on the displayed results.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">5. Intellectual Property</h3>
                        <p className="font-medium mb-2">
                            All trademarks, logos, and content displayed in the app belong to their respective owners.
                        </p>
                        <p className="font-medium">
                            Users may not copy, modify, reuse, or reproduce any part of the app’s content without proper permission.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">6. Privacy</h3>
                        <p className="font-medium">
                            Your use of the app is also governed by our Privacy Policy. By using the app, you agree to the collection and use of information as described in the Privacy Policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">7. Modifications to the App or Terms</h3>
                        <p className="font-medium mb-2">
                            We may update, modify, suspend, or discontinue any part of the app at any time without prior notice.
                        </p>
                        <p className="font-medium">
                            We may also revise these Terms of Use from time to time. Continued use of the app after updates means you accept the revised terms.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">8. Limitation of Liability</h3>
                        <p className="font-medium">
                            To the maximum extent permitted by law, <span className="text-rose-600 font-bold">Different JNTUH Results</span> will not be responsible for any direct, indirect, incidental, special, or consequential damages resulting from the use of this app or reliance on its information.
                        </p>
                    </section>

                    <div className="bg-rose-50 rounded-xl p-6 border border-rose-100 mb-8">
                        <h3 className="text-md font-bold text-slate-800 mb-2 uppercase tracking-wide">Website</h3>
                        <p className="font-medium text-slate-600 mb-4">
                            By visiting this page on our website:
                        </p>
                        <a href="https://jntuhfasttrack.netlify.app/" className="text-rose-600 hover:text-rose-700 font-bold break-all transition-colors underline">
                            https://jntuhfasttrack.netlify.app/
                        </a>
                    </div>

                    <div className="text-center pt-8 border-t border-slate-100">
                        <p className="font-bold text-slate-700 mb-2">Made with ❤ by Harish</p>
                        <p className="text-sm font-semibold text-slate-400">Copyright © 2024 – All rights reserved</p>
                    </div>

                </div>
            </div>
        </div>
    );
};
