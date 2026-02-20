'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ImportOrder } from '@/types'

const STATUS_CONFIG = {
    payment_confirmed: { label: 'Payment Confirmed', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
    order_placed: { label: 'Order Placed', icon: Package, color: 'text-blue-500 bg-blue-50' },
    processing: { label: 'Processing', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    dispatched: { label: 'Dispatched', icon: Truck, color: 'text-indigo-500 bg-indigo-50' },
    in_transit: { label: 'In Transit', icon: Truck, color: 'text-purple-500 bg-purple-50' },
    customs_clearance: { label: 'Customs', icon: AlertCircle, color: 'text-orange-500 bg-orange-50' },
    arrived_country: { label: 'Arrived', icon: CheckCircle2, color: 'text-teal-500 bg-teal-50' },
    out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-blue-600 bg-blue-50' },
    delivered: { label: 'Delivered ✓', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
}

export default function ProfileOrdersPage() {
    const [orders, setOrders] = useState<ImportOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            supabase
                .from('import_orders')
                .select(`
          *,
          import_quotes(
            id, product_cost, shipping_cost, service_fee, total_cost, delivery_days, supplier_name, supplier_country,
            import_requests(id, title, product_name)
          )
        `)
                .eq('user_id', data.user.id)
                .order('created_at', { ascending: false })
                .then(({ data: rows }) => {
                    setOrders(rows || [])
                    setLoading(false)
                })
        })
    }, [])

    return (
        <main className="min-h-screen bg-brand-light pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="font-display text-2xl text-brand-dark">My Import Orders</h1>
                    <p className="text-sm text-brand-dark/40 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-28 bg-white rounded-2xl shadow-card animate-pulse" />
                        ))
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                            <Package className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                            <p className="text-brand-dark/50 text-sm mb-4">No import orders yet</p>
                            <Link href="/import-request"
                                className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90">
                                Start an Import Request
                            </Link>
                        </div>
                    ) : orders.map(order => {
                        const quote = order.import_quotes as any
                        const request = quote?.import_requests
                        const status = order.shipping_status ? STATUS_CONFIG[order.shipping_status as keyof typeof STATUS_CONFIG] : null
                        const StatusIcon = status?.icon || Package
                        return (
                            <Link key={order.id} href={`/import/orders/${order.id}`}>
                                <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all cursor-pointer">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${status?.color || 'text-brand-dark/30 bg-brand-light'}`}>
                                                <StatusIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-brand-dark">
                                                    {request?.title || request?.product_name || 'Import Order'}
                                                </p>
                                                <p className="text-xs text-brand-dark/40 mt-0.5">
                                                    {quote?.supplier_name ? `${quote.supplier_name} · ${quote.supplier_country}` : 'Supplier pending'}
                                                    {order.tracking_number && ` · Track: ${order.tracking_number}`}
                                                </p>
                                                <p className="text-xs text-brand-dark/30 mt-1">
                                                    Ordered {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {quote?.total_cost && (
                                                <p className="font-display text-lg text-brand-dark">GHS {Number(quote.total_cost).toLocaleString()}</p>
                                            )}
                                            <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-brand-light text-brand-dark/50'}`}>
                                                {status?.label || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Delivery estimate */}
                                    {order.estimated_delivery && (
                                        <div className="mt-3 pt-3 border-t border-brand-light flex items-center gap-2 text-xs text-brand-dark/40">
                                            <Truck className="w-3.5 h-3.5" />
                                            Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
