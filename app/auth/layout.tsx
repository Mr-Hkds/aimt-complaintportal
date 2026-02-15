import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - College Branding */}
            <div className="hidden lg:flex lg:w-1/2 hero-section relative flex-col justify-between p-12">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="AIMT Crest"
                            className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <p className="font-semibold text-white text-sm leading-tight">
                                Army Institute of Management & Technology
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Greater Noida • Est. 2004
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-snug">
                        Student Complaint &{" "}
                        <span className="text-[#c8a951]">Resolution Portal</span>
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        A dedicated platform for AIMT students to report campus
                        infrastructure issues and track resolutions efficiently.
                    </p>
                </div>

                <div className="relative z-10">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Army Institute of Management & Technology
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 relative">
                {/* Mobile header */}
                <div className="lg:hidden absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="AIMT" className="w-8 h-8 object-contain" />
                        <span className="font-semibold text-[#0c1b3a] text-sm">
                            AIMT Portal
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-md mt-16 lg:mt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
