'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ChevronRight, Globe, Loader2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
    awaiting_payment: { label: 'Awaiting Payment', className: 'bg-amber-50 text-amber-700' },
    paid: { label: 'Paid', className: 'bg-blue-50 text-blue-700' },
    processing: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700' },
    shipped: { label: 'Shipped', className: 'bg-cyan-50 text-cyan-700' },
    delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600' },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => { fetchOrders() }, [])

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase
            .from('import_orders')
            .select(`
        *,
        import_requests(product_name, title),
        import_quotes(supplier_name, supplier_country, shipping_method, total_cost)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setOrders(data || [])
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="font-display text-2xl text-brand-dark">My Orders</h1>
                <p className="text-sm text-brand-dark/50 mt-0.5">Track your import orders and shipping status</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-16 text-center">
                    <ShoppingBag className="w-14 h-14 text-brand-dark/10 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-brand-dark mb-2">No Orders Yet</h3>
                    <p className="text-brand-dark/50 mb-6 max-w-sm mx-auto">
                        Your confirmed import orders will appear here.
                    </p>
                    <Link href="/dashboard/imports" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors">
                        Browse Imports
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const status = ORDER_STATUS[order.shipping_status || order.payment_status] || ORDER_STATUS.awaiting_payment
                        const req = order.import_requests
                        const quote = order.import_quotes
                        return (
                            <Link
                                key={order.id}
                                href={`/import/orders/${order.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-brand-dark/8 p-5 hover:border-brand-dark/20 hover:shadow-sm transition-all group"
                            >
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-brand-dark group-hover:text-brand-gold transition-colors">
                                        {req?.product_name || req?.title || 'Import Order'}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        {quote?.supplier_name && (
                                            <span className="text-xs text-brand-dark/50">{quote.supplier_name} · {quote.supplier_country}</span>
                                        )}
                                        {quote?.shipping_method && (
                                            <span className="text-xs text-brand-dark/40 capitalize">{quote.shipping_method} freight</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-brand-dark/30 mt-0.5">
                                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {quote?.total_cost && (
                                        <span className="text-sm font-display text-brand-gold">₵{quote.total_cost.toLocaleString()}</span>
                                    )}
                                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${status.className}`}>{status.label}</span>
                                    <ChevronRight className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-dark/60 transition-colors" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
