'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe, Plus, ChevronRight, Clock, CheckCircle, Loader2, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    quoted: 'bg-indigo-50 text-indigo-700',
    paid: 'bg-green-50 text-green-700',
    shipped: 'bg-cyan-50 text-cyan-700',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-50 text-red-600',
}

export default function ImportsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => { fetchImports() }, [])

    const fetchImports = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase
            .from('import_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setRequests(data || [])
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-2xl text-brand-dark">Import Requests</h1>
                    <p className="text-sm text-brand-dark/50 mt-0.5">Track your global sourcing requests</p>
                </div>
                <Link
                    href="/dashboard/imports/request"
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Request
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-16 text-center">
                    <Globe className="w-14 h-14 text-brand-dark/10 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-brand-dark mb-2">No Import Requests Yet</h3>
                    <p className="text-brand-dark/50 mb-6 max-w-sm mx-auto">
                        Source any product from China, Turkey, UAE, India and more. We'll find the best suppliers for you.
                    </p>
                    <Link
                        href="/dashboard/imports/request"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Start Your First Import
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl border border-brand-dark/8 p-5 hover:border-brand-dark/20 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Globe className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-brand-dark">{req.product_name || req.title || 'Unnamed Request'}</h3>
                                        {req.description && (
                                            <p className="text-sm text-brand-dark/50 mt-0.5 line-clamp-1">{req.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-brand-dark/40 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {req.quantity && (
                                                <span className="text-xs text-brand-dark/40">Qty: {req.quantity}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${STATUS_STYLES[req.status] || 'bg-brand-dark/5 text-brand-dark/50'}`}>
                                        {req.status?.replace(/_/g, ' ') || 'pending'}
                                    </span>
                                    {(req.status === 'quoted' || req.ai_processed) && (
                                        <Link
                                            href={`/import/quotes/${req.id}`}
                                            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-medium hover:bg-brand-dark/90 transition-colors"
                                        >
                                            <FileText className="w-3 h-3" /> View Quotes
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
