'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
    DollarSign,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    TrendingUp,
    ArrowUpRight,
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: ArrowUpRight },
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('payments')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false })

        if (data) setPayments(data)
        setLoading(false)
    }

    const totalRevenue = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    const pendingRevenue = payments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    const filtered = payments.filter((p) => {
        const matchesSearch =
            (p.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.provider_reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <main className="flex-1 bg-brand-light p-8">
                <div className="max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-3xl text-brand-dark">Payments</h1>
                            <p className="text-brand-dark/50">
                                {payments.length} total transaction{payments.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 shadow-card"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid sm:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                GHS {totalRevenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-brand-dark/60">Total Revenue</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                GHS {pendingRevenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-brand-dark/60">Pending</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {payments.filter((p) => p.status === 'completed').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Completed</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {payments.filter((p) => p.type === 'promotion').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Promotions</div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        {['all', 'pending', 'completed', 'failed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s
                                        ? 'bg-brand-dark text-white'
                                        : 'bg-white text-brand-dark/60 hover:bg-brand-dark/5'
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin mx-auto" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-12 text-center text-brand-dark/40">No payments found</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-brand-light">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">User</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Amount</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Type</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Provider</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((payment) => {
                                        const sc = statusConfig[payment.status] || statusConfig.pending
                                        const StatusIcon = sc.icon
                                        return (
                                            <tr key={payment.id} className="border-t border-brand-dark/5">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-brand-dark">
                                                        {payment.profiles?.full_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-brand-dark/40 font-mono">
                                                        {payment.id.slice(0, 8)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-brand-dark">
                                                    {payment.currency} {payment.amount?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.type === 'promotion'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {payment.type?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark/60 capitalize">
                                                    {payment.provider || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${sc.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark/60 text-sm">
                                                    {formatDate(payment.created_at)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
