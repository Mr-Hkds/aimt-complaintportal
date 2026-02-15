import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen aurora-bg text-white overflow-hidden relative">
      {/* Background Blobs */}
      <div className="fixed top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob" />
      <div className="fixed top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-2000" />
      <div className="fixed -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <span className="font-bold text-xl">A</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">AIMT Portal</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-white text-black hover:bg-gray-200 transition-all">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm text-gray-300 font-medium">Bharamratri Studios Edition</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          The Future of <br /> Campus Management
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Experience the next generation complaint portal. Lightning fast,
          beautifully designed, and built for the students of AIMT.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 border-0 rounded-2xl">
              Create Account
            </Button>
          </Link>
          <Link href="/public/status">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl backdrop-blur-sm">
              Check Status
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-5xl">
          {[
            {
              icon: Zap,
              title: "Instant Resolution",
              desc: "Direct connection to technicians with real-time updates."
            },
            {
              icon: ShieldCheck,
              title: "Secure Access",
              desc: "Enterprise-grade security with role-based permissions."
            },
            {
              icon: CheckCircle2,
              title: "Smart Tracking",
              desc: "Track every step of your complaint from submission to fix."
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-left">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
