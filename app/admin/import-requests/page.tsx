'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plane, Ship, X, Eye, ArrowRight, Loader2 } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  finding_supplier: { label: 'AI Sourcing', color: 'bg-indigo-100 text-indigo-700' },
  quoted: { label: 'Quoted', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  paid: { label: 'Paid', color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
}

export default function AdminImportRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [productCost, setProductCost] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [serviceFee, setServiceFee] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [agentLoading, setAgentLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('import_requests')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (data) setRequests(data)
    setLoading(false)
  }

  const handleSendQuote = async (requestId: string) => {
    if (!productCost) return
    setQuoteLoading(true)

    const product = Number(productCost) || 0
    const shipping = Number(shippingCost) || 0
    const fee = Number(serviceFee) || 0
    const total = product + shipping + fee

    // Insert quote
    const { data: quote, error } = await supabase
      .from('import_quotes')
      .insert({
        request_id: requestId,
        product_cost: product,
        shipping_cost: shipping,
        service_fee: fee,
        total_cost: total,
        delivery_days: Number(estimatedDays) || 14,
      })
      .select()
      .single()

    if (!error && quote) {
      // Update request status to 'quoted'
      await supabase
        .from('import_requests')
        .update({ status: 'quoted' })
        .eq('id', requestId)

      toast.success('Quote sent successfully!')
      setSelectedRequest(null)
      setProductCost('')
      setShippingCost('')
      setServiceFee('')
      setEstimatedDays('')
      fetchRequests()
    } else {
      toast.error('Failed to send quote')
    }
    setQuoteLoading(false)
  }

  const handleReject = async (requestId: string) => {
    await supabase
      .from('import_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)

    toast.success('Request rejected')
    fetchRequests()
  }

  const handleTriggerAgent = async (requestId: string) => {
    setAgentLoading(requestId)
    try {
      const { data, error } = await supabase.functions.invoke('import-agent', {
        body: { request_id: requestId },
      })
      if (error) throw error
      toast.success('AI Agent triggered! Quotes are being generated...')
      setTimeout(() => { fetchRequests() }, 2000)
    } catch (err: any) {
      toast.error(`Agent error: ${err.message || 'Failed to trigger agent'}`)
    }
    setAgentLoading(null)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 bg-brand-light p-8">
        <div className="max-w-6xl">
          <h1 className="font-display text-3xl text-brand-dark mb-2">Import Requests</h1>
          <p className="text-brand-dark/50 mb-8">
            {requests.length} total request{requests.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
              <p className="text-brand-dark/40">No import requests yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-brand-light">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Product</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">User</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Shipping</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-t border-brand-dark/5">
                      <td className="px-6 py-4">
                        <div className="font-medium text-brand-dark">{req.title || req.product_name || '—'}</div>
                        <div className="text-xs text-brand-dark/40">{req.quantity} unit{req.quantity !== 1 ? 's' : ''}</div>
                        {req.ai_processed && (
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">✦ AI Processed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-brand-dark/60">
                        {req.profiles?.full_name || req.user_id?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        {req.shipping_method === 'sea' ? (
                          <span className="flex items-center gap-2 text-brand-dark/60">
                            <Ship className="w-4 h-4" /> Sea
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-brand-dark/60">
                            <Plane className="w-4 h-4" /> Air
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[req.status]?.color || 'bg-gray-100 text-gray-600'
                          }`}>
                          {statusConfig[req.status]?.label || req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brand-dark/60">{formatDate(req.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* AI Agent Trigger */}
                          {(req.status === 'pending' || !req.ai_processed) && (
                            <button
                              onClick={() => handleTriggerAgent(req.id)}
                              disabled={agentLoading === req.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                              title="Run AI Sourcing Agent"
                            >
                              {agentLoading === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>✦</span>
                              )}
                              {agentLoading === req.id ? 'Running...' : 'AI Source'}
                            </button>
                          )}
                          {req.ai_processed && (
                            <a
                              href={`/import/quotes/${req.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 text-brand-gold rounded-lg text-sm hover:bg-brand-gold/20 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Quotes
                            </a>
                          )}
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setSelectedRequest(req.id)}
                                className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center hover:bg-brand-gold/30 transition-colors"
                                title="Send Manual Quote"
                              >
                                <ArrowRight className="w-4 h-4 text-brand-gold" />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quote Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
                <h2 className="font-display text-2xl text-brand-dark mb-2">Send Quote</h2>
                <p className="text-brand-dark/60 mb-6">
                  Break down the costs for this import request
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Product Cost (USD) *</label>
                    <input
                      type="number"
                      value={productCost}
                      onChange={(e) => setProductCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-1">Shipping Cost</label>
                      <input
                        type="number"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-1">Service Fee</label>
                      <input
                        type="number"
                        value={serviceFee}
                        onChange={(e) => setServiceFee(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Estimated Days</label>
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      placeholder="14"
                      className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                    />
                  </div>

                  {(productCost || shippingCost || serviceFee) && (
                    <div className="bg-brand-light rounded-xl p-4 text-center">
                      <span className="text-sm text-brand-dark/50">Total: </span>
                      <span className="font-display text-xl text-brand-dark">
                        ${((Number(productCost) || 0) + (Number(shippingCost) || 0) + (Number(serviceFee) || 0)).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 py-3 border-2 border-brand-dark text-brand-dark rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendQuote(selectedRequest)}
                      disabled={quoteLoading || !productCost}
                      className="flex-1 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors disabled:opacity-50"
                    >
                      {quoteLoading ? 'Sending...' : 'Send Quote'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
