'use client'

import Link from 'next/link'
import { ArrowLeft, Plane, Ship, Package, Clock, CheckCircle } from 'lucide-react'

const mockOrders = [
  {
    id: 'ORD-001',
    product: 'iPhone 15 Pro Max',
    status: 'in_transit',
    shippingMethod: 'air',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2026-02-25',
    origin: 'China',
    destination: 'Nigeria',
  },
  {
    id: 'ORD-002',
    product: 'Sony WH-1000XM5',
    status: 'pending',
    shippingMethod: 'sea',
    trackingNumber: null,
    estimatedDelivery: '2026-03-15',
    origin: 'Japan',
    destination: 'Ghana',
  },
  {
    id: 'ORD-003',
    product: 'MacBook Pro M3',
    status: 'delivered',
    shippingMethod: 'air',
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2026-02-10',
    origin: 'USA',
    destination: 'Kenya',
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: any }> =
  {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-700',
      icon: Clock,
    },
    in_transit: {
      label: 'In Transit',
      color: 'bg-blue-100 text-blue-700',
      icon: Plane,
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
  }

export default function ImportOrdersPage() {
  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-dark" />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-brand-dark">
              Import Orders
            </h1>
            <p className="text-brand-dark/60">
              Track your international shipments
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        order.shippingMethod === 'air'
                          ? 'bg-blue-50'
                          : 'bg-cyan-50'
                      }`}
                    >
                      {order.shippingMethod === 'air' ? (
                        <Plane className="w-7 h-7 text-brand-dark" />
                      ) : (
                        <Ship className="w-7 h-7 text-brand-dark" />
                      )}
                    </div>
                    <div>
                      <div className="font-display text-lg text-brand-dark">
                        {order.product}
                      </div>
                      <div className="text-sm text-brand-dark/60">
                        Order #{order.id}
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-brand-dark/60">
                      <div>From</div>
                      <div className="font-medium text-brand-dark">
                        {order.origin}
                      </div>
                    </div>
                    <div className="w-16 h-px bg-brand-dark/20 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-gold rounded-full" />
                    </div>
                    <div className="text-brand-dark/60">
                      <div>To</div>
                      <div className="font-medium text-brand-dark">
                        {order.destination}
                      </div>
                    </div>
                  </div>

                  {/* Status & Delivery */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-brand-dark/60">
                        Est. Delivery
                      </div>
                      <div className="font-medium text-brand-dark">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig[order.status].color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[order.status].label}
                    </div>
                  </div>
                </div>

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-brand-dark/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-brand-dark/40" />
                      <span className="text-brand-dark/60">Tracking:</span>
                      <span className="font-medium text-brand-dark">
                        {order.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {mockOrders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-brand-dark/40" />
            </div>
            <h2 className="font-display text-2xl text-brand-dark mb-2">
              No Orders Yet
            </h2>
            <p className="text-brand-dark/60 mb-6">
              Start importing products from around the world
            </p>
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
