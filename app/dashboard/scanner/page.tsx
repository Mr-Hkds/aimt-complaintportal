"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Search, CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { getTicketByToken, resolveTicket } from "../actions"
import { toast } from "sonner"
import Link from "next/link"
import { Suspense } from "react"

function ScannerContent() {
    const searchParams = useSearchParams()
    const [mode, setMode] = useState<'scan' | 'manual' | 'found'>('scan')
    const [token, setToken] = useState(searchParams.get('token') || '')
    const [ticket, setTicket] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [resolving, setResolving] = useState(false)
    const [cameraActive, setCameraActive] = useState(false)
    const scannerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // If token from URL, auto-search
    useEffect(() => {
        const urlToken = searchParams.get('token')
        if (urlToken) {
            handleSearch(urlToken)
        }
    }, [searchParams])

    const handleSearch = useCallback(async (searchToken?: string) => {
        const t = searchToken || token
        if (!t.trim()) return

        setLoading(true)
        const result = await getTicketByToken(t.trim())
        setLoading(false)

        if (result) {
            setTicket(result)
            setMode('found')
            stopCamera()
        } else {
            toast.error('No complaint found with this token')
        }
    }, [token])

    async function startCamera() {
        try {
            const { Html5Qrcode } = await import('html5-qrcode')
            if (!containerRef.current) return

            const scanner = new Html5Qrcode('qr-reader')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    // Extract token from URL or use as-is
                    const urlMatch = decodedText.match(/token=([A-Z0-9]+)/i)
                    const scannedToken = urlMatch ? urlMatch[1] : decodedText
                    setToken(scannedToken)
                    handleSearch(scannedToken)
                },
                () => { } // Error callback (ignore decode failures)
            )

            setCameraActive(true)
        } catch (err: any) {
            toast.error('Camera access denied or not available')
            console.error(err)
        }
    }

    function stopCamera() {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => { })
            scannerRef.current = null
        }
        setCameraActive(false)
    }

    useEffect(() => {
        return () => stopCamera()
    }, [])

    async function handleResolve(formData: FormData) {
        setResolving(true)
        const result = await resolveTicket(formData)
        setResolving(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Complaint updated successfully!')
            // Refresh ticket data
            const updated = await getTicketByToken(ticket.token)
            if (updated) setTicket(updated)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#0c1b3a]">QR Scanner</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Scan a complaint QR code or enter the token manually
                </p>
            </div>

            {mode !== 'found' && (
                <>
                    {/* Manual Token Input */}
                    <Card className="college-card">
                        <CardContent className="p-5">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter complaint token (e.g., AB3X7K9P)"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                                    className="h-11 bg-white border-slate-200 text-[#0c1b3a] font-mono text-base tracking-wider placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button
                                    onClick={() => handleSearch()}
                                    disabled={loading || !token.trim()}
                                    className="h-11 px-5 bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white shrink-0"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Camera Scanner */}
                    <Card className="college-card">
                        <CardContent className="p-5">
                            {!cameraActive ? (
                                <div className="text-center py-8">
                                    <div className="p-4 rounded-full bg-slate-100 w-fit mx-auto mb-4">
                                        <Camera className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">Use your camera to scan a complaint QR code</p>
                                    <Button
                                        onClick={startCamera}
                                        className="bg-[#0c1b3a] hover:bg-[#1a2d5a] text-white"
                                    >
                                        <Camera className="mr-2 w-4 h-4" />
                                        Open Camera
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div id="qr-reader" ref={containerRef} className="rounded-lg overflow-hidden" />
                                    <Button
                                        onClick={stopCamera}
                                        variant="outline"
                                        className="w-full border-slate-200"
                                    >
                                        Close Camera
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Ticket Found */}
            {mode === 'found' && ticket && (
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        onClick={() => { setMode('scan'); setTicket(null); setToken('') }}
                        className="text-slate-500 hover:text-[#0c1b3a] -ml-2"
                    >
                        <ArrowLeft className="mr-1.5 w-4 h-4" />
                        Scan Another
                    </Button>

                    <Card className="college-card border-l-4 border-l-[#c8a951]">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-[#0c1b3a] text-lg">{ticket.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{ticket.description}</p>
                                </div>
                                <StatusBadge status={ticket.status} size="md" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-400">Category</p>
                                    <p className="text-sm font-medium text-[#0c1b3a]">{ticket.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Priority</p>
                                    <p className="text-sm font-medium text-[#0c1b3a] capitalize">{ticket.priority}</p>
                                </div>
                                {ticket.room_no && (
                                    <div>
                                        <p className="text-xs text-slate-400">Room</p>
                                        <p className="text-sm font-medium text-[#0c1b3a]">{ticket.room_no}</p>
                                    </div>
                                )}
                                {ticket.profiles?.full_name && (
                                    <div>
                                        <p className="text-xs text-slate-400">Reported By</p>
                                        <p className="text-sm font-medium text-[#0c1b3a]">{ticket.profiles.full_name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-400">Submitted</p>
                                    <p className="text-sm font-medium text-[#0c1b3a]">
                                        {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Token</p>
                                    <p className="text-sm font-mono font-medium text-[#c8a951]">{ticket.token}</p>
                                </div>
                            </div>

                            {ticket.tech_note && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-emerald-800 mb-0.5">Previous Note</p>
                                    <p className="text-sm text-emerald-700">{ticket.tech_note}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Update Form */}
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <Card className="college-card">
                            <CardContent className="p-6">
                                <h4 className="font-medium text-[#0c1b3a] mb-4">Update Status</h4>
                                <form action={handleResolve} className="space-y-4">
                                    <input type="hidden" name="ticketId" value={ticket.id} />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">New Status</Label>
                                        <Select name="status" defaultValue="resolved">
                                            <SelectTrigger className="h-11 bg-white border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="rejected">Rejected (Invalid)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">Note</Label>
                                        <Textarea
                                            name="techNote"
                                            placeholder="Describe what was done to fix the issue..."
                                            className="min-h-[80px] bg-white border-slate-200 text-[#0c1b3a] placeholder:text-slate-400 focus:border-[#c8a951] focus:ring-[#c8a951]/20"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={resolving}
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium active:scale-[0.98]"
                                    >
                                        {resolving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Update Complaint
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="max-w-2xl mx-auto animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-72"></div>
                <div className="h-32 bg-slate-100 rounded-xl"></div>
            </div>
        }>
            <ScannerContent />
        </Suspense>
    )
}
