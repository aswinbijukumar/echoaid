import React from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, GlobeAltIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00CC00]/5 blur-3xl rounded-l-full pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-gray-900"
                    >
                        Breaking Barriers. <br />
                        <span className="text-[#00CC00]">Building Bridges.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        EchoAid is on a mission to democratize sign language education through
                        cutting-edge AI and accessible design.
                    </motion.p>
                </div>
            </section>

            {/* Mission Values */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <ValueCard
                        icon={<GlobeAltIcon className="w-8 h-8 text-[#00CC00]" />}
                        title="Accessibility First"
                        desc="We believe communication is a fundamental human right. Our platform is designed to be inclusive from day one."
                        delay={0.1}
                    />
                    <ValueCard
                        icon={<HeartIcon className="w-8 h-8 text-red-500" />}
                        title="Community Driven"
                        desc="Built with and for the Deaf community. We partner with educators and advocates to ensure cultural accuracy."
                        delay={0.2}
                    />
                    <ValueCard
                        icon={<SparklesIcon className="w-8 h-8 text-blue-500" />}
                        title="AI Innovation"
                        desc="Leveraging on-device machine learning to provide real-time, privacy-focused feedback for learners."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* The Story */}
            <section className="py-24 bg-black text-white px-4 relative overflow-hidden">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.div {...fadeIn} className="inline-block px-4 py-1 rounded-full border border-white/20 text-sm mb-6 bg-white/5">
                            OUR STORY
                        </motion.div>
                        <motion.h2 {...fadeIn} className="text-4xl md:text-5xl font-bold mb-6">
                            From a Hackathon to a Global Platform
                        </motion.h2>
                        <motion.p {...fadeIn} className="text-gray-400 text-lg leading-relaxed mb-6">
                            EchoAid began as a passionate project to solve a simple problem: learning sign language online was static and unengaging.
                        </motion.p>
                        <motion.p {...fadeIn} className="text-gray-400 text-lg leading-relaxed">
                            Today, we serve over 50,000 learners worldwide, processing millions of gestures daily—all without a single frame leaving the user's device.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative h-96 bg-gray-800 rounded-3xl overflow-hidden border border-gray-700"
                    >
                        {/* Abstract visual */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00CC00]/20 to-blue-600/20" />
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                            {[...Array(36)].map((_, i) => (
                                <div key={i} className="border border-white/10" />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl font-black text-white/10">2023</div>
                                <div className="text-sm tracking-widest text-gray-500 uppercase mt-2">Founded</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Team Section (Simplified) */}
            <section className="py-24 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-16">Meet the Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <TeamMember name="Alex Chen" role="Founder & CEO" color="bg-blue-500" />
                        <TeamMember name="Sam Rivera" role="Head of AI" color="bg-[#00CC00]" />
                        <TeamMember name="Jordan Lee" role="Lead Educator" color="bg-purple-500" />
                        <TeamMember name="Casey Taylor" role="Design Lead" color="bg-orange-500" />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const ValueCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="p-8 rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
    >
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
);

const TeamMember = ({ name, role, color }) => (
    <div className="group">
        <div className={`w-32 h-32 mx-auto rounded-full ${color} mb-4 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
            {name.charAt(0)}
        </div>
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-gray-500 text-sm">{role}</p>
    </div>
);

export default About;
