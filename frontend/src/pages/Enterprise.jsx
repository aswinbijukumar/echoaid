import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, BuildingOffice2Icon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Enterprise = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-[#00CC00] font-bold tracking-wider uppercase text-sm mb-4 block">EchoAid for Business & Education</span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
                            Inclusive Communication <br />
                            <span className="text-gray-400">at Scale.</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            Deploy EchoAid's AI-powered sign language training across your entire organization.
                            Track progress, ensure compliance, and build a more inclusive culture.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/signup" className="bg-[#00CC00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#00AA00] transition-colors text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200 block text-center">
                                Request Demo
                            </Link>
                            <Link to="/subscription" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-lg block text-center">
                                View Pricing
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* For Corporations */}
                        <div className="p-8 md:p-12 bg-gray-900 text-white rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BuildingOffice2Icon className="w-48 h-48" />
                            </div>
                            <h2 className="text-3xl font-bold mb-6">For Workplace</h2>
                            <ul className="space-y-4 mb-8">
                                <ListItem text="DEI Compliance Training" dark />
                                <ListItem text="Employee Progress Dashboards" dark />
                                <ListItem text="SSO Integration (Okta/Azure AD)" dark />
                                <ListItem text="Custom Vocabulary Modules" dark />
                            </ul>
                            <button className="text-[#00CC00] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                                Learn more <span>→</span>
                            </button>
                        </div>

                        {/* For Education */}
                        <div className="p-8 md:p-12 bg-[#F0FDF4] text-gray-900 rounded-3xl relative overflow-hidden group border border-[#00CC00]/20">
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-[#00CC00]">
                                <AcademicCapIcon className="w-48 h-48" />
                            </div>
                            <h2 className="text-3xl font-bold mb-6">For Schools</h2>
                            <ul className="space-y-4 mb-8">
                                <ListItem text="District-wide Licensing" />
                                <ListItem text="LMS Integration (Canvas/Blackboard)" />
                                <ListItem text="Student Performance Analytics" />
                                <ListItem text="COPPA & FERPA Compliant" />
                            </ul>
                            <button className="text-[#00CC00] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                                Contact Sales <span>→</span>
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <Stat number="98%" label="Satisfaction Rate" />
                        <Stat number="50k+" label="Active Learners" />
                        <Stat number="200+" label="Enterprise Clients" />
                        <Stat number="24/7" label="Support SLA" />
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-gray-500 font-medium mb-8">TRUSTED BY INNOVATIVE TEAMS</p>
                    <div className="flex flex-wrapjustify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos - in a real app these would be SVGs */}
                        <div className="text-3xl font-black text-gray-300 tracking-tighter">GOOGLE</div>
                        <div className="text-3xl font-black text-gray-300 tracking-tighter">MICROSOFT</div>
                        <div className="text-3xl font-black text-gray-300 tracking-tighter">AMAZON</div>
                        <div className="text-3xl font-black text-gray-300 tracking-tighter">STANFORD</div>
                        <div className="text-3xl font-black text-gray-300 tracking-tighter">MIT</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const ListItem = ({ text, dark }) => (
    <li className="flex items-center gap-3">
        <CheckCircleIcon className={`w-6 h-6 ${dark ? 'text-[#00CC00]' : 'text-[#00CC00]'}`} />
        <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{text}</span>
    </li>
);

const Stat = ({ number, label }) => (
    <div>
        <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{number}</div>
        <div className="text-gray-500 font-medium">{label}</div>
    </div>
);

export default Enterprise;
