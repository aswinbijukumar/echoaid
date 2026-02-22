import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CpuChipIcon, ShieldCheckIcon, BoltIcon, CodeBracketIcon, ServerIcon, EyeIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TechShowcase = () => {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Code snippet for the "Engine" section
    const codeSnippet = `const analyzeSign = (landmarks) => {
  // Vector Analysis
  const thumbAngle = calculateAngle(
    landmarks[2], landmarks[3], landmarks[4]
  );
  
  // Real-time Inference < 16ms
  if (thumbAngle < 30 && palmOpen) {
    return { sign: 'A', confidence: 0.98 };
  }
}`;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00CC00] selection:text-black overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Abstract Background Grid */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#00CC00]/10 to-transparent blur-[120px]" />
                </div>

                <motion.div
                    style={{ scale, opacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00CC00]/10 border border-[#00CC00]/20 text-[#00CC00] mb-8 font-mono text-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#00CC00] animate-pulse" />
                        GEOMETRIC ENGINE V2.0 ACTIVE
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
                    >
                        Powered by <br />
                        <span className="text-white">Edge AI</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience lightning-fast sign language recognition.
                        Running entirely in your browser with <span className="text-white font-bold">zero latency</span> and <span className="text-white font-bold">100% privacy</span>.
                    </motion.p>
                </motion.div>
            </section>

            {/* The Engine Section */}
            <section className="py-32 relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Text */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Geometric Core</h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Unlike traditional black-box neural networks, EchoAid uses a hybrid approach.
                                We combine <span className="text-[#00CC00]">MediaPipe's</span> skeletal tracking with a
                                custom <span className="text-[#00CC00]">Geometric Rules Engine</span>.
                            </p>

                            <div className="space-y-6">
                                <FeatureItem
                                    icon={<BoltIcon className="w-6 h-6 text-[#00CC00]" />}
                                    title="Sub-16ms Inference"
                                    desc="Processes frames faster than a standard 60Hz screen refresh rate."
                                />
                                <FeatureItem
                                    icon={<CodeBracketIcon className="w-6 h-6 text-[#00CC00]" />}
                                    title="Deterministic Accuracy"
                                    desc="Rule-based logic prevents common AI 'hallucinations' in gesture recognition."
                                />
                                <FeatureItem
                                    icon={<CpuChipIcon className="w-6 h-6 text-[#00CC00]" />}
                                    title="Client-Side Compute"
                                    desc="No GPU servers required. Runs smoothly on any modern laptop or tablet."
                                />
                            </div>
                        </div>

                        {/* Right: Code/Visual */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#00CC00]/20 blur-3xl rounded-full" />
                            <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 font-mono text-sm shadow-2xl overflow-hidden group hover:border-[#00CC00]/50 transition-colors duration-500">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <pre className="text-gray-300 overflow-x-auto">
                                    <code>
                                        {codeSnippet.split('\n').map((line, i) => (
                                            <div key={i} className="flex">
                                                <span className="text-gray-700 w-8 select-none">{i + 1}</span>
                                                <span dangerouslySetInnerHTML={{
                                                    __html: line
                                                        .replace('const', '<span class="text-[#f92672]">const</span>')
                                                        .replace('return', '<span class="text-[#f92672]">return</span>')
                                                        .replace('if', '<span class="text-[#f92672]">if</span>')
                                                        .replace('calculateAngle', '<span class="text-[#66d9ef]">calculateAngle</span>')
                                                }} />
                                            </div>
                                        ))}
                                    </code>
                                </pre>

                                {/* Floating Badge */}
                                <div className="absolute bottom-4 right-4 bg-[#00CC00]/10 text-[#00CC00] text-xs px-3 py-1 rounded-full border border-[#00CC00]/20 backdrop-blur-md">
                                    ● Live Compilation
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section className="py-32 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-[#00CC00]/5 rounded-full mb-8">
                        <ShieldCheckIcon className="w-12 h-12 text-[#00CC00]" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Privacy by Design</h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16">
                        Your camera feed never leaves your device. Not frame by frame. Not ever.
                        EchoAid treats privacy as a fundamental human right, not a feature.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PrivacyCard
                            title="Zero Data Egress"
                            value="0 KB"
                            desc="Video data transmitted to servers."
                        />
                        <PrivacyCard
                            title="Processing Time"
                            value="< 30ms"
                            desc="Average time to analyze a gesture locally."
                        />
                        <PrivacyCard
                            title="Encryption"
                            value="AES-256"
                            desc="User profile data stored securely."
                        />
                    </div>
                </div>
            </section>

            {/* Architecture Diagram (Simplified) */}
            <section className="py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">System Architecture</h2>

                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl mx-auto">
                        {/* Node 1 */}
                        <ArchNode icon={<EyeIcon className="w-8 h-8" />} title="Input" desc="Webcam Feed" />

                        <Arrow />

                        {/* Node 2 */}
                        <ArchNode icon={<ServerIcon className="w-8 h-8" />} title="MediaPipe" desc="Landmark Extraction" active />

                        <Arrow />

                        {/* Node 3 */}
                        <ArchNode icon={<CpuChipIcon className="w-8 h-8" />} title="Geo Engine" desc="Vector Analysis" active />

                        <Arrow />

                        {/* Node 4 */}
                        <ArchNode icon={<BoltIcon className="w-8 h-8" />} title="React UI" desc="Real-time Feedback" />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center border border-white/5">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-gray-400">{desc}</p>
        </div>
    </div>
);

const PrivacyCard = ({ title, value, desc }) => (
    <div className="p-8 rounded-3xl bg-[#111] border border-white/5 hover:border-[#00CC00]/30 transition-colors duration-300">
        <h3 className="text-gray-400 mb-2">{title}</h3>
        <div className="text-4xl font-bold text-white mb-4">{value}</div>
        <p className="text-sm text-gray-500">{desc}</p>
    </div>
);

const ArchNode = ({ icon, title, desc, active }) => (
    <div className={`
    relative w-48 p-6 rounded-2xl border text-center z-10 bg-[#050505]
    ${active ? 'border-[#00CC00] shadow-[0_0_30px_rgba(0,204,0,0.2)]' : 'border-white/10'}
  `}>
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${active ? 'bg-[#00CC00] text-black' : 'bg-[#111] text-gray-400'}`}>
            {icon}
        </div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-xs text-gray-400">{desc}</p>
    </div>
);

const Arrow = () => (
    <div className="hidden md:block flex-1 h-[2px] bg-white/10 relative">
        <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-white/10 rotate-45" />
        <motion.div
            className="absolute top-0 left-0 w-1/3 h-full bg-[#00CC00]"
            animate={{ x: ['0%', '200%'], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

export default TechShowcase;
