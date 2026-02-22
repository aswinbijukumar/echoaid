import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContextConstants';

const Certificate = ({ userName, courseName, date, certificateId }) => {
    const certificateRef = useRef(null);
    const { user } = useAuth();

    // Default values if props are missing
    const headerName = userName || user?.name || "EchoAid Learner";
    const certDate = date || new Date().toLocaleDateString();
    const certId = certificateId || `EA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const handleDownload = async () => {
        const element = certificateRef.current;
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`EchoAid_Certificate_${headerName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto p-4">

            {/* Controls */}
            <div className="flex gap-4 w-full justify-end">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00CC00] hover:bg-[#00AA00] text-white font-bold rounded-xl shadow-lg hover:shadow-[#00CC00]/20 transition-all transform hover:scale-105"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Certificate Template */}
            <div
                ref={certificateRef}
                className="relative w-full aspect-[1.414/1] bg-white text-black p-12 shadow-2xl overflow-hidden"
                style={{ fontFamily: "'Cinzel', serif" }} // Ideally import a serif font
            >
                {/* Border Design */}
                <div className="absolute inset-4 border-4 border-[#00CC00] rounded-sm"></div>
                <div className="absolute inset-6 border-2 border-dashed border-gray-300 rounded-sm"></div>

                {/* Corner Decorations */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#00CC00]"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#00CC00]"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#00CC00]"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#00CC00]"></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 text-center">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#00CC00] rounded-lg flex items-center justify-center text-white font-black text-xl">E</div>
                            <span className="text-2xl font-bold tracking-widest text-gray-800">ECHOAID ACADEMY</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-[#1a1a1a] tracking-tight uppercase">
                            Certificate
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 uppercase tracking-[0.3em]">
                            of Completion
                        </p>
                    </div>

                    {/* Recipient */}
                    <div className="space-y-2 w-full max-w-3xl">
                        <p className="text-gray-500 italic">This certifies that</p>
                        <h2 className="text-4xl md:text-6xl font-script text-[#00CC00] py-4 border-b-2 border-gray-100 italic" style={{ fontFamily: "cursive" }}>
                            {headerName}
                        </h2>
                        <p className="text-gray-500 italic pt-2">has successfully completed the comprehensive course on</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                            {courseName || "American Sign Language Fundamentals"}
                        </h3>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="grid grid-cols-3 w-full max-w-4xl mt-12 items-end">
                        <div className="space-y-2">
                            <div className="h-px bg-gray-400 w-full mb-2"></div>
                            <p className="text-sm font-bold uppercase text-gray-600">Instructor</p>
                            <p className="text-xs text-gray-400">Dr. Sarah Jensen, PhD</p>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            {/* Gold Seal */}
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                                <div className="absolute inset-1 border-2 border-yellow-100 rounded-full border-dashed"></div>
                                <div className="text-center text-yellow-50 font-bold text-[10px] md:text-xs leading-tight">
                                    OFFICIAL<br />CERTIFIED<br />EXCELLENCE
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-right">
                            <div className="h-px bg-gray-400 w-full mb-2 ml-auto"></div>
                            <p className="text-sm font-bold uppercase text-gray-600">Date Issued</p>
                            <p className="text-xs text-gray-400">{certDate}</p>
                            <p className="text-[10px] text-gray-300 font-mono mt-1">ID: {certId}</p>
                        </div>
                    </div>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <span className="text-[200px] font-black transform -rotate-12">ECHOAID</span>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
