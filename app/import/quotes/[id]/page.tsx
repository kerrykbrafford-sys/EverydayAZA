'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plane, Ship, Globe, Star, CheckCircle, Loader2, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PayButton from '@/components/payments/PayButton'

interface Quote {
    id: string
    request_id: string
    supplier_name: string
    supplier_country: string
    product_cost: number
    shipping_cost: number
    shipping_method: 'air' | 'sea'
    delivery_days: number
    total_cost: number
    service_fee: number
}

interface ImportRequest {
    id: string
    title: string | null
    product_name: string | null
    quantity: number
    status: string
    ai_processed: boolean
}

export default function ImportQuotesPage() {
    const params = useParams()
    const router = useRouter()
    const requestId = params.id as string

    const [request, setRequest] = useState<ImportRequest | null>(null)
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)
    const [selecting, setSelecting] = useState<string | null>(null)

    useEffect(() => {
        fetchQuotes()
        // Poll every 3s while AI is processing
        const poll = setInterval(async () => {
            const { data: req } = await supabase
                .from('import_requests')
                .select('ai_processed, status')
                .eq('id', requestId)
                .single()
            if (req?.ai_processed) {
                clearInterval(poll)
                fetchQuotes()
            }
        }, 3000)
        return () => clearInterval(poll)
    }, [requestId])

    const fetchQuotes = async () => {
        setLoading(true)
        const [{ data: req }, { data: quotesData }] = await Promise.all([
            supabase.from('import_requests').select('*').eq('id', requestId).single(),
            supabase
                .from('import_quotes')
                .select('*')
                .eq('request_id', requestId)
                .order('shipping_method', { ascending: false }),
        ])
        if (req) setRequest(req)
        if (quotesData) setQuotes(quotesData)
        setLoading(false)
    }

    const handleSelectQuote = async (quote: Quote) => {
        setSelecting(quote.id)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setSelecting(null); return }

        // Create an import order linked to this quote
        const { data: order } = await supabase
            .from('import_orders')
            .insert({
                user_id: user.id,
                quote_id: quote.id,
                request_id: quote.request_id,
                payment_status: 'pending',
                shipping_status: 'awaiting_payment',
            })
            .select()
            .single()

        if (order) {
            // Insert first tracking event
            await supabase.from('import_tracking_events').insert({
                order_id: order.id,
                status: 'awaiting_payment',
                description: 'Order created. Awaiting payment confirmation.',
            })
            router.push(`/import/orders/${order.id}`)
        }
        setSelecting(null)
    }

    const airQuotes = quotes.filter(q => q.shipping_method === 'air')
    const seaQuotes = quotes.filter(q => q.shipping_method === 'sea')
    const productTitle = request?.title || request?.product_name || 'Import Request'
    const isProcessing = !request?.ai_processed && quotes.length === 0

    return (
        <main className="min-h-screen bg-brand-light pt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard/import-orders"
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-brand-dark" />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl text-brand-dark">AI Sourcing Quotes</h1>
                        <p className="text-brand-dark/60">{productTitle}</p>
                    </div>
                </div>

                {/* AI Processing State */}
                {isProcessing && (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                        </div>
                        <h2 className="font-display text-2xl text-brand-dark mb-3">
                            AI Agent is Finding Suppliers...
                        </h2>
                        <p className="text-brand-dark/60 max-w-md mx-auto">
                            Our sourcing agent is scanning global markets to find the best suppliers for your product. This takes about 30 seconds.
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6 text-sm text-brand-dark/50">
                            <Globe className="w-4 h-4 animate-pulse" />
                            <span>Searching China, Turkey, UAE, India...</span>
                        </div>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && !isProcessing && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-card p-6">
                                <div className="h-6 w-48 bg-brand-dark/10 rounded animate-pulse mb-3" />
                                <div className="h-4 w-full bg-brand-dark/5 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Quotes Display */}
                {!loading && quotes.length > 0 && (
                    <>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                            <CheckCircle className="w-4 h-4" />
                            AI found {airQuotes.length} suppliers — {quotes.length} quotes generated
                        </div>

                        {/* Air Shipping */}
                        {airQuotes.length > 0 && (
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl text-brand-dark">Air Freight</h2>
                                        <p className="text-sm text-brand-dark/60">Fast delivery — 4–12 days</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {airQuotes.map(quote => (
                                        <QuoteCard
                                            key={quote.id}
                                            quote={quote}
                                            onSelect={handleSelectQuote}
                                            selecting={selecting === quote.id}
                                            icon={<Plane className="w-5 h-5 text-blue-600" />}
                                            iconBg="bg-blue-50"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sea Shipping */}
                        {seaQuotes.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                                        <Ship className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl text-brand-dark">Sea Freight</h2>
                                        <p className="text-sm text-brand-dark/60">Cost-efficient — 28–45 days</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {seaQuotes.map(quote => (
                                        <QuoteCard
                                            key={quote.id}
                                            quote={quote}
                                            onSelect={handleSelectQuote}
                                            selecting={selecting === quote.id}
                                            icon={<Ship className="w-5 h-5 text-cyan-600" />}
                                            iconBg="bg-cyan-50"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}

function QuoteCard({
    quote,
    onSelect,
    selecting,
    icon,
    iconBg,
}: {
    quote: Quote
    onSelect: (q: Quote) => void
    selecting: boolean
    icon: React.ReactNode
    iconBg: string
}) {
    return (
        <div className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-brand-dark">{quote.supplier_name}</div>
                    <div className="text-sm text-brand-dark/60">{quote.supplier_country}</div>
                </div>
            </div>

            <div className="space-y-2 flex-1 mb-5">
                <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60">Product Cost</span>
                    <span className="font-medium text-brand-dark">₵{quote.product_cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60">Shipping</span>
                    <span className="font-medium text-brand-dark">₵{quote.shipping_cost?.toLocaleString()}</span>
                </div>
                {quote.service_fee ? (
                    <div className="flex justify-between text-sm">
                        <span className="text-brand-dark/60">Service Fee</span>
                        <span className="font-medium text-brand-dark">₵{quote.service_fee?.toLocaleString()}</span>
                    </div>
                ) : null}
                <div className="border-t border-brand-dark/10 pt-2 flex justify-between">
                    <span className="font-display text-brand-dark">Total</span>
                    <span className="font-display text-xl text-brand-dark">₵{quote.total_cost?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-brand-dark/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{quote.delivery_days} days delivery to Ghana</span>
                </div>
            </div>

            <button
                onClick={() => onSelect(quote)}
                disabled={selecting}
                className="w-full py-2.5 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {selecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {selecting ? 'Creating Order...' : 'Select This Quote'}
            </button>
        </div>
    )
}
