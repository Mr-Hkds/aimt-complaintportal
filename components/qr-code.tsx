"use client"

import { QRCodeSVG } from "qrcode.react"

interface QRCodeDisplayProps {
    token: string
    size?: number
    className?: string
}

export function QRCodeDisplay({ token, size = 200, className = "" }: QRCodeDisplayProps) {
    const scanUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/scanner?token=${token}`

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG
                    value={scanUrl}
                    size={size}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#0c1b3a"
                />
            </div>
            <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Complaint Token</p>
                <p className="font-mono text-lg font-bold text-[#0c1b3a] tracking-wider">{token}</p>
            </div>
        </div>
    )
}
