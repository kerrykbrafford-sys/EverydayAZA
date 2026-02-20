'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Package,
    Edit,
    Trash2,
    Eye,
    Plus,
    MapPin,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

export default function DashboardListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchListings()
    }, [])

    const fetchListings = async () => {
        setLoading(true)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setListings(data)
        setLoading(false)
    }

    const deleteListing = async (listingId: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return

        await supabase.from('listings').delete().eq('id', listingId)
        setListings((prev) => prev.filter((l) => l.id !== listingId))
    }

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        sold: 'bg-blue-100 text-blue-700',
        removed: 'bg-red-100 text-red-700',
    }

    return (
        <main className="min-h-screen bg-brand-light pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-brand-dark" />
                        </Link>
                        <div>
                            <h1 className="font-display text-3xl text-brand-dark">
                                My Listings
                            </h1>
                            <p className="text-brand-dark/60">
                                Manage your posted items
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/listing/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Listing
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center text-brand-dark/40">
                        Loading your listings...
                    </div>
                ) : listings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-brand-dark/40" />
                        </div>
                        <h2 className="font-display text-2xl text-brand-dark mb-2">
                            No Listings Yet
                        </h2>
                        <p className="text-brand-dark/60 mb-6">
                            Start selling by posting your first item
                        </p>
                        <Link
                            href="/listing/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Post Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {listings.map((listing) => (
                            <div
                                key={listing.id}
                                className="bg-white rounded-2xl shadow-card p-6 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-brand-light rounded-xl overflow-hidden">
                                        <img
                                            src={listing.images?.[0] || '/images/product-1.jpg'}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg text-brand-dark">
                                            {listing.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-brand-dark font-medium">
                                                ₵{listing.price?.toLocaleString() || '0'}
                                            </span>
                                            {listing.location && (
                                                <span className="flex items-center gap-1 text-sm text-brand-dark/40">
                                                    <MapPin className="w-3 h-3" />
                                                    {listing.location}
                                                </span>
                                            )}
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs ${statusColors[listing.status] || statusColors.active
                                                    }`}
                                            >
                                                {listing.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/listing/${listing.id}`}
                                        className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
                                        title="View"
                                    >
                                        <Eye className="w-5 h-5 text-brand-dark" />
                                    </Link>
                                    <button
                                        onClick={() => deleteListing(listing.id)}
                                        className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
