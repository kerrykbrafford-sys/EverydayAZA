'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plane, Ship, Package, Clock, CheckCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PayButton from '@/components/payments/PayButton'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  finding_supplier: { label: 'AI Sourcing...', color: 'bg-purple-100 text-purple-700', icon: Sparkles },
  ai_sourcing: { label: 'AI Sourcing...', color: 'bg-purple-100 text-purple-700', icon: Sparkles },
  quoted: { label: 'Quotes Ready', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-700', icon: Plane },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: Clock },
}

export default function ImportOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Get import orders for this user, joined with quotes (which join to requests)
    const { data } = await supabase
      .from('import_orders')
      .select('*, import_quotes(*, import_requests(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  // Fallback: if no import_orders exist, fetch the user's import_requests directly
  // so they can still see their submitted requests and pending status
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    if (!loading && orders.length === 0) {
      fetchRequests()
    }
  }, [loading, orders])

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('import_requests')
      .select('*, import_quotes(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setRequests(data)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-brand-dark" />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-brand-dark">Import Orders</h1>
            <p className="text-brand-dark/60">Track your international shipments</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon
              const request = order.import_quotes?.import_requests
              const quote = order.import_quotes

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${request?.shipping_method === 'sea' ? 'bg-cyan-50' : 'bg-blue-50'
                        }`}>
                        {request?.shipping_method === 'sea' ? (
                          <Ship className="w-7 h-7 text-brand-dark" />
                        ) : (
                          <Plane className="w-7 h-7 text-brand-dark" />
                        )}
                      </div>
                      <div>
                        <div className="font-display text-lg text-brand-dark">
                          {request?.product_name || 'Import Order'}
                        </div>
                        <div className="text-sm text-brand-dark/60">
                          Order #{order.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>

                    {quote && (
                      <div className="text-right">
                        <div className="text-sm text-brand-dark/60">Total Cost</div>
                        <div className="font-display text-xl text-brand-dark">
                          ₵{quote.total_cost?.toLocaleString() || '—'}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-brand-dark/60">Est. Delivery</div>
                        <div className="font-medium text-brand-dark">
                          {quote?.delivery_days ? `${quote.delivery_days} days` : '—'}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-brand-dark/10">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-brand-dark/40" />
                        <span className="text-brand-dark/60">Tracking:</span>
                        <span className="font-medium text-brand-dark">{order.tracking_number}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/import/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark/5 text-brand-dark rounded-lg text-sm hover:bg-brand-dark/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Track Order
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Import Requests (fallback when no orders yet) */}
        {!loading && orders.length === 0 && requests.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-brand-dark/50 mb-4">Your import requests (awaiting quotes):</p>
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${req.shipping_method === 'sea' ? 'bg-cyan-50' : 'bg-blue-50'
                      }`}>
                      {req.shipping_method === 'sea' ? (
                        <Ship className="w-6 h-6 text-brand-dark" />
                      ) : (
                        <Plane className="w-6 h-6 text-brand-dark" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-brand-dark">{req.product_name}</div>
                      <div className="text-sm text-brand-dark/50">{req.description?.slice(0, 80)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-brand-dark/40">{formatDate(req.created_at)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'finding_supplier' ? 'bg-purple-100 text-purple-700' :
                        req.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'paid' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-600'
                      }`}>
                      {req.status === 'finding_supplier' ? '✦ AI Sourcing...' :
                        req.status === 'quoted' ? '✓ Quotes Ready' :
                          req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                    </span>
                    {(req.status === 'quoted' || req.ai_processed) && (
                      <Link
                        href={`/import/quotes/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        View AI Quotes
                      </Link>
                    )}
                  </div>
                  {/* Show pay button for quoted requests */}
                  {req.status === 'quoted' && req.import_quotes?.[0] && (
                    <div className="mt-4 pt-4 border-t border-brand-dark/10 flex items-center justify-between">
                      <div>
                        <span className="text-sm text-brand-dark/50">Quote: </span>
                        <span className="font-display text-lg text-brand-dark">
                          GHS {req.import_quotes[0].total_cost?.toLocaleString()}
                        </span>
                      </div>
                      <PayButton
                        amount={req.import_quotes[0].total_cost}
                        currency="GHS"
                        type="import_order"
                        relatedId={req.id}
                        variant="gold"
                        size="sm"
                        label={`Pay GHS ${req.import_quotes[0].total_cost?.toLocaleString()}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && requests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-brand-dark/40" />
            </div>
            <h2 className="font-display text-2xl text-brand-dark mb-2">No Orders Yet</h2>
            <p className="text-brand-dark/60 mb-6">Start importing products from around the world</p>
            <Link
              href="/import-request"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
            >
              Request Import
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
