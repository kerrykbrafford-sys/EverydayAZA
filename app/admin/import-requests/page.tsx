'use client'

import { useState } from 'react'
import { Plane, Ship, Check, X, Eye, ArrowRight } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'

const mockRequests = [
  {
    id: 'REQ-001',
    product: 'iPhone 15 Pro Max 256GB',
    user: 'John Doe',
    shippingMethod: 'air',
    status: 'pending',
    date: '2026-02-19',
  },
  {
    id: 'REQ-002',
    product: 'Sony PlayStation 5',
    user: 'Sarah Smith',
    shippingMethod: 'sea',
    status: 'quoted',
    date: '2026-02-18',
  },
  {
    id: 'REQ-003',
    product: 'MacBook Pro M3 Max',
    user: 'Mike Johnson',
    shippingMethod: 'air',
    status: 'approved',
    date: '2026-02-17',
  },
  {
    id: 'REQ-004',
    product: 'Samsung 85" QLED TV',
    user: 'Emma Wilson',
    shippingMethod: 'sea',
    status: 'pending',
    date: '2026-02-16',
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  quoted: { label: 'Quoted', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

export default function AdminImportRequestsPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [quotePrice, setQuotePrice] = useState('')

  const handleQuote = (requestId: string) => {
    // In production, send quote to Supabase
    alert(`Quote sent for ${requestId}: $${quotePrice}`)
    setSelectedRequest(null)
    setQuotePrice('')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 bg-brand-light p-8">
        <div className="max-w-6xl">
          <h1 className="font-display text-3xl text-brand-dark mb-8">
            Import Requests
          </h1>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-brand-light">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Request ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Shipping
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-brand-dark/5">
                    <td className="px-6 py-4 text-brand-dark">{request.id}</td>
                    <td className="px-6 py-4 text-brand-dark">
                      {request.product}
                    </td>
                    <td className="px-6 py-4 text-brand-dark/60">
                      {request.user}
                    </td>
                    <td className="px-6 py-4">
                      {request.shippingMethod === 'air' ? (
                        <span className="flex items-center gap-2 text-brand-dark/60">
                          <Plane className="w-4 h-4" />
                          Air
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-brand-dark/60">
                          <Ship className="w-4 h-4" />
                          Sea
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${statusConfig[request.status].color}`}
                      >
                        {statusConfig[request.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-dark/60">
                      {request.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setSelectedRequest(request.id)}
                              className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center hover:bg-brand-gold/30 transition-colors"
                              title="Send Quote"
                            >
                              <ArrowRight className="w-4 h-4 text-brand-gold" />
                            </button>
                            <button
                              className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                        <button
                          className="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-brand-dark" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quote Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="font-display text-2xl text-brand-dark mb-4">
                  Send Quote
                </h2>
                <p className="text-brand-dark/60 mb-6">
                  Enter the price quote for request {selectedRequest}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">
                      Quote Price (USD)
                    </label>
                    <input
                      type="number"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 py-3 border-2 border-brand-dark text-brand-dark rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuote(selectedRequest)}
                      className="flex-1 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
                    >
                      Send Quote
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
