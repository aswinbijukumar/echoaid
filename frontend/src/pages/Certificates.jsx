import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeftIcon,
    AcademicCapIcon,
    ArrowDownTrayIcon,
    CheckBadgeIcon,
    LockClosedIcon,
    SparklesIcon,
    DocumentCheckIcon,
    TrophyIcon,
    FireIcon,
    StarIcon,
    EyeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { useLearning } from '../context/LearningContext';
import { useUserStats } from '../hooks/useUserStats';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import { Link, useNavigate } from 'react-router-dom';
import CertificateTemplate from '../components/CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { getApiUrl } from '../config/prettyConfig';

export default function Certificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewCert, setPreviewCert] = useState(null); // State for modal
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Hidden ref for generating PDF without showing modal if needed
    const pdfRef = useRef();

    const { darkMode } = useTheme();
    const { logout, user } = useAuth();
    const { devMode } = useLearning();
    const { stats: userStats } = useUserStats();
    const navigate = useNavigate();

    // Potential certificates (hardcoded for "Available" view)
    const availableCertificates = [
        { id: 'level0', title: 'Level 0 Mastery', description: 'Master the fundamental signs, alphabet, and numbers.' },
        { id: 'level1', title: 'Level 1 Mastery', description: 'Complete all Level 1 modules and pass the mastery exam.' },
        { id: 'level2', title: 'Level 2 Intermediate', description: 'Available after Level 1. Master complex phrases and grammar.' },
        { id: 'level3', title: 'Level 3 Advanced', description: 'Fluent conversation and real-time interpretation skills.' },
        { id: 'arena', title: 'Arena Champion', description: 'Reach Rank 1 in the Global EchoArena Leaderboard.' },
    ];

    // Theme constants matching Dashboard
    const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
    const text = darkMode ? 'text-white' : 'text-[#23272F]';
    const cardBg = darkMode ? 'bg-[#23272F] border-gray-700' : 'bg-white border-gray-200';
    const border = darkMode ? 'border-gray-700' : 'border-gray-200';
    const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

    useEffect(() => {
        console.log('debugging certificates | devMode:', devMode);
        fetchCertificates();
    }, [devMode]);

    const fetchCertificates = async () => {
        // 1. Immediate Dev Mode Unlock
        if (devMode) {
            console.log('🔓 DEV MODE: Force unlocking certificates');
            const devCertificates = availableCertificates.map(ac => ({
                _id: ac.id,
                title: ac.title,
                certificateCode: `DEV-${ac.id.toUpperCase()}-000`,
                issueDate: new Date().toISOString(),
                isDevModeUnlocked: true
            }));

            // Try to fetch real ones to merge, but don't block
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(getApiUrl('/certificates/mine'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success && data.data) {
                    const realCerts = data.data;
                    setCertificates([
                        ...realCerts,
                        ...devCertificates.filter(dc => !realCerts.some(c => c.title === dc.title))
                    ]);
                } else {
                    setCertificates(devCertificates);
                }
            } catch (e) {
                console.warn('Dev Mode: API fetch failed, using mocks only', e);
                setCertificates(devCertificates);
            } finally {
                setLoading(false);
            }
            return;
        }

        // 2. Normal Mode Fetch
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('/certificates/mine'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setCertificates(data.data);
            } else {
                console.warn('API returned non-array data for certificates:', data);
                setCertificates([]);
            }
        } catch (error) {
            console.error('Failed to fetch certificates', error);
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    // State to hold data for the off-screen renderer
    const [pdfExportData, setPdfExportData] = useState(null);

    // Effect to trigger PDF generation only when export data is ready and rendered
    useEffect(() => {
        if (pdfExportData) {
            const generate = async () => {
                try {
                    setGeneratingPdf(true);
                    // Wait for render
                    await new Promise(resolve => setTimeout(resolve, 800));

                    const element = document.getElementById('certificate-export-container');
                    if (!element) throw new Error('Export container not found');

                    const canvas = await html2canvas(element, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('landscape', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`${pdfExportData.title.replace(/\s+/g, '_')}_Certificate.pdf`);
                } catch (error) {
                    console.error('PDF Generation failed:', error);
                    alert("PDF Generation failed. Please try again.");
                } finally {
                    setGeneratingPdf(false);
                    setPdfExportData(null); // Reset
                }
            };
            generate();
        }
    }, [pdfExportData]);

    const handleDownloadPdf = (cert) => {
        const certWithUser = {
            ...cert,
            // Prioritize the name ON the certificate object (which might be edited), then user.name
            recipientName: cert.recipientName || user?.name || user?.username || 'Valued Learner',
            courseName: cert.title,
            date: cert.issueDate || new Date().toISOString()
        };
        setPdfExportData(certWithUser);
    };

    const handleDownloadBadge = async (cert) => {
        // Create a temporary canvas to draw the badge
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Draw a simple circular badge
        ctx.beginPath();
        ctx.arc(256, 256, 240, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#f59e0b'; // Amber-500
        ctx.fill();
        ctx.lineWidth = 15;
        ctx.strokeStyle = '#b45309'; // Amber-700
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆', 256, 256); // Emoji fallback for now, simpler than rendering DOM icon

        // Trigger download
        const link = document.createElement('a');
        link.download = `${cert.title.replace(/\s+/g, '_')}_Badge.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const handlePreview = (certOrTemplate) => {
        const previewData = {
            ...certOrTemplate,
            recipientName: user?.name || user?.username || 'Valued Learner',
            courseName: certOrTemplate.title,
            date: certOrTemplate.issueDate || new Date().toISOString(),
            id: certOrTemplate.certificateCode || 'PREVIEW-MODE'
        };
        setPreviewCert(previewData);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Helper to check if a specific cert type is already earned
    const isEarned = (titleStub) => {
        return certificates.some(c => c.title === titleStub);
    };

    return (
        <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
            {/* Off-screen Render Container for accurate PDF generation */}
            {pdfExportData && (
                <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '1123px', height: '794px' }}>
                    <div id="certificate-export-container" className="w-[1123px] h-[794px]">
                        <CertificateTemplate
                            recipientName={pdfExportData.recipientName}
                            courseName={pdfExportData.courseName}
                            date={pdfExportData.date}
                            id={pdfExportData.id || pdfExportData.certificateCode}
                        />
                    </div>
                </div>
            )}

            {/* Top Status Bar (Matching Dashboard) */}
            <div className={`fixed top-0 left-0 right-0 z-50 ${statusBarBg} border-b ${border} px-6 py-3 pl-64`}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4"></div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FireIcon className="w-5 h-5 text-orange-400" />
                            <span className="font-semibold">{userStats?.streak || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <SparklesIcon className="w-5 h-5 text-blue-400" />
                            <span className="font-semibold">{userStats?.totalXP || 0} XP</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold">Rank {userStats?.level || 1}</span>
                        </div>
                        <TopBarUserAvatar size={8} />
                    </div>
                </div>
            </div>

            <div className="flex pt-16">
                {/* Sidebar for Dashboard Consistency */}
                <Sidebar handleLogout={handleLogout} />

                {/* Main Content Area */}
                <div className="flex-1 ml-64 p-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Header Section */}
                        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-extrabold mb-2">Professional Certification</h1>
                                        <p className="text-blue-100 max-w-xl">
                                            Earn official, verifiable certificates to showcase your ASL proficiency to employers and institutions.
                                        </p>
                                    </div>
                                    <div className="hidden md:block">
                                        <TrophyIcon className="w-24 h-24 text-yellow-300 opacity-80" />
                                    </div>
                                </div>
                            </div>
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>

                        {/* "How it Works" Steps */}
                        <div className="grid md:grid-cols-3 gap-6 mb-10">
                            {[
                                { icon: AcademicCapIcon, title: '1. Master Skills', desc: 'Complete all lessons in a level.' },
                                { icon: DocumentCheckIcon, title: '2. Pass Exam', desc: 'Score 80%+ on the Mastery Quiz.' },
                                { icon: CheckBadgeIcon, title: '3. Get Certified', desc: 'Download your official PDF instantly.' }
                            ].map((step, i) => (
                                <div key={i} className={`flex items-center space-x-4 p-4 rounded-xl border ${cardBg} shadow-sm`}>
                                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{step.title}</h3>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" />
                            Your Achievements
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                            </div>
                        ) : (

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {devMode && (
                                    <div className="col-span-full mb-2 p-3 bg-green-900/30 border border-green-500/30 rounded-lg flex items-center justify-center text-green-400 font-mono text-sm">
                                        <SparklesIcon className="w-4 h-4 mr-2" />
                                        DEV MODE: ALL CERTIFICATES UNLOCKED
                                    </div>
                                )}

                                {/* Combine Earned and Available, Remove Duplicates, Sort by ID/Level */}
                                {(() => {
                                    // Helper to extract level number
                                    const getLevel = (title) => {
                                        const match = title.match(/Level\s+(\d+)/i);
                                        return match ? parseInt(match[1]) : 999;
                                    };

                                    const earnedTitles = new Set(certificates.map(c => c.title));

                                    // Create unified list
                                    const allCerts = [
                                        ...certificates.map(c => ({ ...c, isEarned: true, level: getLevel(c.title) })),
                                        ...availableCertificates
                                            .filter(ac => !earnedTitles.has(ac.title))
                                            .map(ac => ({ ...ac, isEarned: false, level: getLevel(ac.title) }))
                                    ];

                                    // Sort by level
                                    allCerts.sort((a, b) => a.level - b.level);

                                    return allCerts.map(cert => (
                                        cert.isEarned ? (
                                            /* Render EARNED Certificate */
                                            <div key={cert._id} className={`rounded-xl border border-yellow-500/30 bg-gradient-to-br ${darkMode ? 'from-[#2e374a] to-[#1e293b]' : 'from-yellow-50/80 to-white'} p-6 relative group transition-all hover:scale-[1.02] shadow-md hover:shadow-xl`}>
                                                <div className="absolute top-0 right-0 p-4 z-20">
                                                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md flex items-center">
                                                        <CheckBadgeIcon className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </div>
                                                </div>

                                                <div className="mb-6 flex justify-center mt-6 relative">
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-yellow-100 to-yellow-50 flex items-center justify-center border-[3px] border-yellow-400 shadow-inner">
                                                        <TrophyIcon className="w-12 h-12 text-yellow-600 drop-shadow-sm" />
                                                    </div>
                                                    {/* Badge Overlay */}
                                                    <div className="absolute -bottom-2 -right-1 bg-blue-600 text-white p-2 rounded-full border-4 border-white dark:border-[#1e293b] shadow-md" title="Certified Badge">
                                                        <CheckBadgeIcon className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-center mb-1">{cert.title}</h3>
                                                <p className="text-[10px] text-center text-gray-400 mb-6 font-mono uppercase tracking-wide">ID: {cert.certificateCode}</p>

                                                <div className="space-y-3 pb-2">
                                                    <div className="flex justify-between text-xs py-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                                                        <span className="text-gray-500">Issued On</span>
                                                        <span className="font-semibold">{new Date(cert.issueDate).toLocaleDateString()}</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                                        <button
                                                            onClick={() => handlePreview(cert)}
                                                            className="col-span-1 flex items-center justify-center space-x-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold text-xs border border-transparent hover:border-gray-300"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadPdf(cert)}
                                                            className="col-span-1 flex items-center justify-center space-x-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-xs shadow-md shadow-blue-500/20"
                                                        >
                                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                                            <span>PDF</span>
                                                        </button>
                                                        {/* Badge Download Button */}
                                                        <button
                                                            onClick={() => handleDownloadBadge(cert)}
                                                            className="col-span-2 flex items-center justify-center space-x-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-all font-bold text-xs shadow-md shadow-orange-500/20"
                                                        >
                                                            <StarIcon className="w-4 h-4" />
                                                            <span>Download Verified Badge</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Render LOCKED Certificate */
                                            <div key={cert.id} className={`rounded-xl border ${border} ${darkMode ? 'bg-[#23272F]/50' : 'bg-gray-50'} p-6 relative transition-all duration-300 group`}>
                                                <div className="absolute top-4 right-4">
                                                    <LockClosedIcon className="w-6 h-6 text-gray-400" />
                                                </div>

                                                <div className="mb-6 flex justify-center mt-4">
                                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
                                                        <AcademicCapIcon className="w-10 h-10 text-gray-400" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-center mb-2">{cert.title}</h3>
                                                <p className="text-sm text-center text-gray-500 mb-6 px-4 min-h-[40px]">
                                                    {cert.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <button
                                                        onClick={() => handlePreview({ ...cert, issueDate: new Date(), certificateCode: 'SAMPLE' })}
                                                        className={`col-span-1 py-2 border ${border} text-gray-500 hover:text-blue-500 hover:border-blue-500 rounded-lg font-medium text-sm flex justify-center items-center transition-colors`}
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-2" />
                                                        Preview
                                                    </button>
                                                    <button disabled className={`col-span-1 py-2 border ${border} text-gray-400 rounded-lg cursor-not-allowed font-medium text-sm flex justify-center items-center bg-gray-100 dark:bg-gray-800`}>
                                                        <LockClosedIcon className="w-4 h-4 mr-2" />
                                                        Locked
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ));
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificate Preview Modal */}
            {
                previewCert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto p-4 flex flex-col items-center">
                            <button
                                onClick={() => !generatingPdf && setPreviewCert(null)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-50"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-600" />
                            </button>

                            <div className="mb-4 text-center">
                                <h2 className="text-2xl font-bold text-gray-800">Certificate Preview</h2>
                                <p className="text-gray-500 text-sm">Review your achievement below</p>
                            </div>

                            <div className="w-full max-w-md mb-6 px-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Certificate</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={previewCert.recipientName}
                                        onChange={(e) => setPreviewCert({ ...previewCert, recipientName: e.target.value })}
                                        onBlur={async () => {
                                            if (previewCert._id) { // Only save if it's a real certificate (has _id)
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await fetch(`${getApiUrl('/certificates')}/${previewCert._id}/name`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ recipientName: previewCert.recipientName })
                                                    });
                                                } catch (err) {
                                                    console.error("Failed to save name", err);
                                                }
                                            }
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This name will appear on your official certificate.</p>
                            </div>

                            {/* Actual Certificate Component Area */}
                            {/* Wrapper to handle scaling and centering without scrolling issues */}
                            <div className="w-full flex justify-center bg-gray-50 rounded-lg p-2" style={{ height: '460px' }}>
                                <div
                                    id="certificate-preview-content"
                                    className="origin-top transform transition-transform"
                                    style={{
                                        transform: 'scale(0.55)',
                                        width: '1123px', // Original Cert Width
                                        height: '794px', // Original Cert Height
                                        marginBottom: '-350px' // Compensate for empty space at bottom after scaling
                                    }}
                                >
                                    <CertificateTemplate
                                        recipientName={previewCert.recipientName}
                                        courseName={previewCert.courseName}
                                        date={previewCert.date}
                                        id={previewCert.id}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-4">
                                <button
                                    onClick={() => handleDownloadPdf(previewCert)}
                                    disabled={generatingPdf}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
                                >
                                    {generatingPdf ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Generating PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                            <span>Download PDF</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
