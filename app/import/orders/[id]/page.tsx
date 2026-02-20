'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Package, Plane, Ship, CheckCircle, Clock, MapPin,
    Loader2, Truck, Globe, Home, CreditCard, Search, ShieldCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TRACKING_STAGES = [
    { key: 'awaiting_payment', label: 'Order Created', icon: CreditCard, description: 'Awaiting payment confirmation' },
    { key: 'payment_confirmed', label: 'Payment Confirmed', icon: ShieldCheck, description: 'Payment received, processing begins' },
    { key: 'finding_supplier', label: 'Contacting Supplier', icon: Globe, description: 'Sourcing agent reaching out to supplier' },
    { key: 'supplier_processing', label: 'Supplier Processing', icon: Package, description: 'Supplier is preparing your order' },
    { key: 'shipped', label: 'Shipped', icon: Plane, description: 'Package is on its way to Ghana' },
    { key: 'arrived_country', label: 'Arrived in Ghana', icon: MapPin, description: 'Package has arrived in Ghana' },
    { key: 'customs_clearance', label: 'Customs Clearance', icon: Search, description: 'Package is going through customs' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'Package is being delivered to you' },
    { key: 'delivered', label: 'Delivered', icon: Home, description: 'Package successfully delivered!' },
]

interface TrackingEvent {
    id: string
    order_id: string
    status: string
    description: string
    created_at: string
}

interface ImportOrder {
    id: string
    payment_status: string
    shipping_status: string
    tracking_number: string | null
    created_at: string
    import_quotes: {
        supplier_name: string
        supplier_country: string
        shipping_method: string
        delivery_days: number
        total_cost: number
        import_requests: {
            title: string | null
            product_name: string | null
            quantity: number
        } | null
    } | null
}

export default function ImportOrderTrackingPage() {
    const params = useParams()
    const orderId = params.id as string
    const [order, setOrder] = useState<ImportOrder | null>(null)
    const [events, setEvents] = useState<TrackingEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
        fetchEvents()

        // Realtime subscription for live tracking updates
        const channel = supabase
            .channel(`order-tracking-${orderId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'import_tracking_events', filter: `order_id=eq.${orderId}` },
                (payload) => {
                    setEvents((prev) => [payload.new as TrackingEvent, ...prev])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'import_orders', filter: `id=eq.${orderId}` },
                () => fetchOrder()
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [orderId])

    const fetchOrder = async () => {
        const { data } = await supabase
            .from('import_orders')
            .select('*, import_quotes(*, import_requests(*))')
            .eq('id', orderId)
            .single()
        if (data) setOrder(data as any)
        setLoading(false)
    }

    const fetchEvents = async () => {
        const { data } = await supabase
            .from('import_tracking_events')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false })
        if (data) setEvents(data)
    }

    const currentStatus = order?.shipping_status || 'awaiting_payment'
    const currentStageIndex = TRACKING_STAGES.findIndex(s => s.key === currentStatus)
    const quote = order?.import_quotes
    const request = quote?.import_requests
    const productName = request?.title || request?.product_name || 'Import Order'
    const isAir = quote?.shipping_method === 'air'

    if (loading) {
        return (
            <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
            </main>
        )
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="font-display text-2xl text-brand-dark mb-2">Order not found</h2>
                    <Link href="/dashboard/import-orders" className="text-brand-gold underline">Return to orders</Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-light pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard/import-orders"
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-brand-dark" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl text-brand-dark">{productName}</h1>
                        <p className="text-brand-dark/60">Order #{orderId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    {/* Live badge */}
                    <div className="ml-auto flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Tracking
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Order Details */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="font-display text-lg text-brand-dark mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAir ? 'bg-blue-50' : 'bg-cyan-50'}`}>
                                        {isAir ? <Plane className="w-5 h-5 text-blue-600" /> : <Ship className="w-5 h-5 text-cyan-600" />}
                                    </div>
                                    <div>
                                        <div className="text-sm text-brand-dark/60">Shipping Method</div>
                                        <div className="font-medium text-brand-dark capitalize">{quote?.shipping_method || 'Air'} Freight</div>
                                    </div>
                                </div>
                                <div className="border-t border-brand-dark/10" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-dark/60">Supplier</span>
                                    <span className="font-medium text-brand-dark">{quote?.supplier_name || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-dark/60">Country</span>
                                    <span className="font-medium text-brand-dark">{quote?.supplier_country || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-dark/60">Est. Delivery</span>
                                    <span className="font-medium text-brand-dark">{quote?.delivery_days ? `${quote.delivery_days} days` : '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-dark/60">Total Paid</span>
                                    <span className="font-display text-lg text-brand-dark">₵{quote?.total_cost?.toLocaleString() || '—'}</span>
                                </div>
                                {order.tracking_number && (
                                    <>
                                        <div className="border-t border-brand-dark/10" />
                                        <div>
                                            <div className="text-xs text-brand-dark/50 mb-1">Tracking Number</div>
                                            <div className="font-mono text-sm font-bold text-brand-dark bg-brand-light px-3 py-1.5 rounded-lg">
                                                {order.tracking_number}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Event Log */}
                        {events.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="font-display text-lg text-brand-dark mb-4">Event Log</h2>
                                <div className="space-y-3">
                                    {events.map(event => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                                            <div>
                                                <div className="text-sm font-medium text-brand-dark">{event.description}</div>
                                                <div className="text-xs text-brand-dark/40">{new Date(event.created_at).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Visual Tracking Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-card p-6">
                            <h2 className="font-display text-xl text-brand-dark mb-6">Shipment Timeline</h2>
                            <div className="space-y-0">
                                {TRACKING_STAGES.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex
                                    const isCurrent = idx === currentStageIndex
                                    const isUpcoming = idx > currentStageIndex
                                    const Icon = stage.icon

                                    return (
                                        <div key={stage.key} className="flex gap-4">
                                            {/* Icon + Connector */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : isCurrent
                                                            ? 'bg-brand-gold text-white ring-4 ring-brand-gold/20'
                                                            : 'bg-brand-light text-brand-dark/30'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5" />
                                                    ) : isCurrent ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Icon className="w-5 h-5" />
                                                    )}
                                                </div>
                                                {idx < TRACKING_STAGES.length - 1 && (
                                                    <div
                                                        className={`w-0.5 h-8 my-1 transition-colors ${isCompleted ? 'bg-green-400' : 'bg-brand-dark/10'
                                                            }`}
                                                    />
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className="pt-2 pb-8">
                                                <div
                                                    className={`font-medium ${isCompleted
                                                        ? 'text-green-700'
                                                        : isCurrent
                                                            ? 'text-brand-dark'
                                                            : 'text-brand-dark/30'
                                                        }`}
                                                >
                                                    {stage.label}
                                                    {isCurrent && (
                                                        <span className="ml-2 text-xs bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-normal">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-sm mt-0.5 ${isUpcoming ? 'text-brand-dark/25' : 'text-brand-dark/55'}`}>
                                                    {stage.description}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
