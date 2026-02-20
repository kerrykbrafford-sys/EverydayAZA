'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
    Package,
    Plane,
    Ship,
    Clock,
    CheckCircle,
    Truck,
    Search,
    Edit,
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'
import type { ImportOrder } from '@/types'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
    in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<ImportOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [editingOrder, setEditingOrder] = useState<string | null>(null)
    const [newStatus, setNewStatus] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('import_orders')
            .select('*, profiles(full_name), import_quotes(*)')
            .order('created_at', { ascending: false })

        if (data) setOrders(data)
        setLoading(false)
    }

    const updateOrder = async (orderId: string) => {
        const updates: any = {}
        if (newStatus) updates.status = newStatus
        if (trackingNumber) updates.tracking_number = trackingNumber

        await supabase.from('import_orders').update(updates).eq('id', orderId)

        setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
        )
        setEditingOrder(null)
        setNewStatus('')
        setTrackingNumber('')
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <main className="flex-1 bg-brand-light p-8">
                <div className="max-w-6xl">
                    <h1 className="font-display text-3xl text-brand-dark mb-8">
                        Import Orders
                    </h1>

                    {/* Stats */}
                    <div className="grid sm:grid-cols-4 gap-6 mb-8">
                        {Object.entries(statusConfig).map(([key, config]) => {
                            const Icon = config.icon
                            return (
                                <div key={key} className="bg-white rounded-2xl p-6 shadow-card">
                                    <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-brand-dark" />
                                    </div>
                                    <div className="font-display text-2xl text-brand-dark">
                                        {orders.filter((o) => o.status === key).length}
                                    </div>
                                    <div className="text-sm text-brand-dark/60">
                                        {config.label}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-brand-dark/40">
                                Loading orders...
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-brand-light">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Order ID
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Customer
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Total
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Tracking
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
                                    {orders.map((order) => {
                                        const sc = statusConfig[order.status] || statusConfig.pending
                                        const StatusIcon = sc.icon
                                        return (
                                            <tr
                                                key={order.id}
                                                className="border-t border-brand-dark/5"
                                            >
                                                <td className="px-6 py-4 text-brand-dark font-medium">
                                                    {order.id.slice(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark/60">
                                                    {(order.profiles as any)?.full_name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark font-medium">
                                                    ${(order.import_quotes as any)?.total_cost?.toLocaleString() || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark/60">
                                                    {order.tracking_number || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${sc.color}`}
                                                    >
                                                        <StatusIcon className="w-3 h-3" />
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-brand-dark/60">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setEditingOrder(order.id)
                                                            setNewStatus(order.status)
                                                            setTrackingNumber(order.tracking_number || '')
                                                        }}
                                                        className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center hover:bg-brand-gold/30 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit className="w-4 h-4 text-brand-gold" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}

                        {!loading && orders.length === 0 && (
                            <div className="p-12 text-center text-brand-dark/40">
                                No orders found
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editingOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h2 className="font-display text-2xl text-brand-dark mb-6">
                                Update Order
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-dark mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-dark mb-2">
                                        Tracking Number
                                    </label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                        className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setEditingOrder(null)}
                                        className="flex-1 py-3 border-2 border-brand-dark text-brand-dark rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => updateOrder(editingOrder)}
                                        className="flex-1 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
