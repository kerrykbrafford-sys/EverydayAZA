'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
    completed: { label: 'Completed', icon: CheckCircle, className: 'text-green-600 bg-green-50' },
    pending: { label: 'Pending', icon: Clock, className: 'text-amber-600 bg-amber-50' },
    failed: { label: 'Failed', icon: XCircle, className: 'text-red-500 bg-red-50' },
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const router = useRouter()

    useEffect(() => { fetchPayments() }, [])

    const fetchPayments = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        const list = data || []
        setPayments(list)
        setTotal(list.filter(p => p.status === 'completed').reduce((s: number, p: any) => s + (p.amount || 0), 0))
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="font-display text-2xl text-brand-dark">Payment History</h1>
                <p className="text-sm text-brand-dark/50 mt-0.5">All your transactions in one place</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-5">
                    <p className="text-sm text-brand-dark/50 mb-1">Total Spent</p>
                    <p className="font-display text-2xl text-brand-dark">₵{total.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-5">
                    <p className="text-sm text-brand-dark/50 mb-1">Transactions</p>
                    <p className="font-display text-2xl text-brand-dark">{payments.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" />
                </div>
            ) : payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-16 text-center">
                    <CreditCard className="w-14 h-14 text-brand-dark/10 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-brand-dark mb-2">No Payments Yet</h3>
                    <p className="text-brand-dark/50 max-w-sm mx-auto">Your payment history will appear here once you make a purchase.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-brand-dark/8 overflow-hidden">
                    <div className="divide-y divide-brand-dark/5">
                        {payments.map((p) => {
                            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                            const Icon = cfg.icon
                            return (
                                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.className}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-brand-dark capitalize">
                                            {p.type?.replace(/_/g, ' ') || 'Payment'}
                                        </p>
                                        <p className="text-xs text-brand-dark/40">
                                            {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-display text-brand-dark">₵{(p.amount || 0).toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.className}`}>{cfg.label}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
