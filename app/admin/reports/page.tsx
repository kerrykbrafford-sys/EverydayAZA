'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
    Flag, AlertTriangle, Search, CheckCircle, XCircle, Eye, ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Report = {
    id: string
    reporter_id: string
    target_id: string
    target_type: 'listing' | 'user' | 'message'
    reason: string
    description: string | null
    status: 'open' | 'reviewed' | 'dismissed'
    created_at: string
    reporter?: { full_name: string | null; email: string }
}

const STATUS_COLORS = {
    open: 'bg-red-50 text-red-600',
    reviewed: 'bg-green-50 text-green-600',
    dismissed: 'bg-brand-light text-brand-dark/40',
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'open' | 'reviewed' | 'dismissed'>('open')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchReports() }, [filter])

    const fetchReports = async () => {
        setLoading(true)
        let query = supabase
            .from('reports')
            .select('*, profiles:reporter_id(full_name, email)')
            .order('created_at', { ascending: false })

        if (filter !== 'all') query = query.eq('status', filter)

        const { data } = await query.limit(100)
        setReports(data || [])
        setLoading(false)
    }

    const updateStatus = async (id: string, status: Report['status']) => {
        await supabase.from('reports').update({ status }).eq('id', id)
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }

    const filtered = search
        ? reports.filter(r =>
            r.reason.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase()) ||
            r.target_type.toLowerCase().includes(search.toLowerCase())
        )
        : reports

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl text-brand-dark">Reports & Moderation</h1>
                    <p className="text-sm text-brand-dark/50 mt-0.5">Review user-submitted reports and take action</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full font-medium">
                        {reports.filter(r => r.status === 'open').length} Open
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search reports..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl shadow-card border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'open', 'reviewed', 'dismissed'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === s ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark/60 hover:text-brand-dark shadow-card'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports table */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-brand-dark/40 text-sm">Loading reports...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-brand-dark/50">No {filter !== 'all' ? filter : ''} reports</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-light">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-dark/40 uppercase tracking-wide">Report</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-dark/40 uppercase tracking-wide hidden md:table-cell">Reporter</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-dark/40 uppercase tracking-wide hidden lg:table-cell">Date</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-dark/40 uppercase tracking-wide">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-dark/40 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(report => (
                                <tr key={report.id} className="border-b border-brand-light/60 hover:bg-brand-light/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-start gap-2">
                                            <Flag className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-brand-dark capitalize">{report.reason.replace('_', ' ')}</p>
                                                <p className="text-xs text-brand-dark/40 capitalize">{report.target_type} report</p>
                                                {report.description && (
                                                    <p className="text-xs text-brand-dark/60 mt-0.5 max-w-xs truncate">{report.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <p className="text-brand-dark/70">{(report as any).profiles?.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-brand-dark/40">{(report as any).profiles?.email}</p>
                                    </td>
                                    <td className="px-5 py-4 text-brand-dark/40 hidden lg:table-cell">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[report.status]}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {report.status === 'open' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'reviewed')}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Mark reviewed"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'dismissed')}
                                                        className="p-1.5 bg-brand-light text-brand-dark/50 rounded-lg hover:bg-brand-dark/10 transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="p-1.5 bg-brand-light text-brand-dark/50 rounded-lg hover:bg-brand-dark/10 transition-colors"
                                                title="View target"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
