import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen aurora-bg flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Button>
                </Link>
            </div>
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                {children}
            </div>
        </div>
    );
}
