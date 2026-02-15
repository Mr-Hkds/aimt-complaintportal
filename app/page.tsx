import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Clock, Users, MapPin, Phone, Mail, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AIMT Crest"
              className="w-10 h-10 md:w-12 md:h-12 object-contain hover:scale-105 transition-transform cursor-pointer"
            />
            <div className="hidden sm:block">
              <p className="font-semibold text-sm md:text-base text-[#0c1b3a] leading-tight">
                Army Institute of Management & Technology
              </p>
              <p className="text-[11px] text-slate-500 tracking-wide">
                Greater Noida • Established 2004 by AWES
              </p>
            </div>
            <p className="sm:hidden font-bold text-[#0c1b3a] text-sm">AIMT</p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-[#0c1b3a] hover:bg-slate-100 text-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white text-sm transition-colors">
                Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section text-white relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8a951] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8a951]"></span>
              </span>
              <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
                Official Campus Portal
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Student Complaint &{" "}
              <span className="text-[#c8a951]">Resolution Portal</span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
              A streamlined platform for AIMT students to report campus
              infrastructure issues, track complaint status, and receive timely
              resolutions from the maintenance team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base bg-[#c8a951] hover:bg-[#d4b96a] text-[#0c1b3a] font-semibold rounded-lg shadow-lg shadow-[#c8a951]/20 transition-all active:scale-95"
                >
                  Register a Complaint
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-lg transition-all"
                >
                  Track Status
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users className="w-4 h-4 text-[#c8a951]" />
                <span>500+ Students Registered</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4 text-[#c8a951]" />
                <span>Avg. 24hr Resolution</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <ShieldCheck className="w-4 h-4 text-[#c8a951]" />
                <span>Secure & Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#c8a951] tracking-wide uppercase mb-3">
              How It Works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0c1b3a] tracking-tight">
              Efficient Complaint Management
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              From submission to resolution — every step is tracked and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                step: "01",
                title: "Submit Your Complaint",
                desc: "Report infrastructure issues like WiFi, plumbing, electricity, or mess-related concerns with detailed descriptions.",
              },
              {
                icon: ShieldCheck,
                step: "02",
                title: "Auto-Assignment",
                desc: "Your complaint is automatically routed to the relevant maintenance team based on category and priority level.",
              },
              {
                icon: CheckCircle2,
                step: "03",
                title: "Track & Resolve",
                desc: "Monitor real-time status updates from submission to resolution. Get notified when your issue is fixed.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="college-card p-6 text-left group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0c1b3a] rounded-lg flex items-center justify-center text-[#c8a951] group-hover:bg-[#1a2d5a] transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#c8a951] tracking-wider">
                    STEP {feature.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#0c1b3a] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-[#0c1b3a] py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Complaints Resolved" },
            { value: "24hr", label: "Avg. Response Time" },
            { value: "6", label: "Complaint Categories" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl md:text-3xl font-bold text-[#c8a951]">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 mt-1 tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* College Info */}
            <div>
              <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                <img src="/logo.png" alt="AIMT" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white text-sm">
                    Army Institute of Management & Technology
                  </p>
                  <p className="text-[11px] text-slate-500">
                    An AWES Institution
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Established in 2004 by the Army Welfare Education Society, AIMT
                is a premium management institute in Greater Noida committed to
                academic excellence and holistic development.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-[#c8a951] transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="hover:text-[#c8a951] transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <a
                    href="https://aimt.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c8a951] transition-colors"
                  >
                    AIMT Official Website ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
                Contact
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#c8a951] shrink-0" />
                  <span>
                    Plot M-1, Pocket P-5, Greater Noida, Uttar Pradesh 201306
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#c8a951] shrink-0" />
                  <span>0120-2329503</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#c8a951] shrink-0" />
                  <span>info@aimt.ac.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Army Institute of Management &
              Technology. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Student Complaint Portal v1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
