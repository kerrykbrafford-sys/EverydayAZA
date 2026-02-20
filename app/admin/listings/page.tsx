'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Package, Eye, Trash2, Search, CheckCircle, XCircle } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchListings()
    }, [])

    const fetchListings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('listings')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false })

        if (data) setListings(data)
        setLoading(false)
    }

    const updateStatus = async (listingId: string, status: string) => {
        await supabase
            .from('listings')
            .update({ status })
            .eq('id', listingId)

        setListings((prev) =>
            prev.map((l) => (l.id === listingId ? { ...l, status: status as any } : l))
        )
    }

    const filtered = listings.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        sold: 'bg-blue-100 text-blue-700',
        removed: 'bg-red-100 text-red-700',
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <main className="flex-1 bg-brand-light p-8">
                <div className="max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-display text-3xl text-brand-dark">
                            All Listings
                        </h1>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 shadow-card"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {listings.filter((l) => l.status === 'active').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Active</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {listings.filter((l) => l.status === 'sold').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Sold</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {listings.filter((l) => l.status === 'removed').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Removed</div>
                        </div>
                    </div>

                    {/* Listings Table */}
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-brand-dark/40">
                                Loading listings...
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-brand-light">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Listing
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Seller
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Price
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
                                    {filtered.map((listing) => (
                                        <tr
                                            key={listing.id}
                                            className="border-t border-brand-dark/5"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-brand-dark">
                                                    {listing.title}
                                                </div>
                                                <div className="text-xs text-brand-dark/40">
                                                    {listing.location || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-brand-dark/60">
                                                {(listing.profiles as any)?.full_name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-brand-dark font-medium">
                                                ${listing.price?.toLocaleString() || '0'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${statusColors[listing.status] || statusColors.active
                                                        }`}
                                                >
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-brand-dark/60">
                                                {new Date(listing.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`/listing/${listing.id}`}
                                                        className="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4 text-brand-dark" />
                                                    </a>
                                                    {listing.status === 'active' ? (
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(listing.id, 'removed')
                                                            }
                                                            className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(listing.id, 'active')
                                                            }
                                                            className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors"
                                                            title="Restore"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="p-12 text-center text-brand-dark/40">
                                No listings found
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
