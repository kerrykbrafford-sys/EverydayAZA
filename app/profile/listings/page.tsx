'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit, Trash2, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

const STATUS_COLORS = {
    active: 'bg-green-50 text-green-600',
    sold: 'bg-blue-50 text-blue-600',
    removed: 'bg-red-50 text-red-600',
    flagged: 'bg-yellow-50 text-yellow-600',
    draft: 'bg-brand-light text-brand-dark/50',
}

export default function ProfileListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            setUser(data.user)
            supabase
                .from('listings')
                .select('*, listing_images(image_url)')
                .eq('user_id', data.user.id)
                .order('created_at', { ascending: false })
                .then(({ data: rows }) => {
                    setListings(rows || [])
                    setLoading(false)
                })
        })
    }, [])

    const deleteListing = async (id: string) => {
        if (!confirm('Delete this listing permanently?')) return
        await supabase.from('listings').delete().eq('id', id)
        setListings(prev => prev.filter(l => l.id !== id))
    }

    return (
        <main className="min-h-screen bg-brand-light pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-display text-2xl text-brand-dark">My Listings</h1>
                        <p className="text-sm text-brand-dark/40 mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link href="/listing/create"
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-all">
                        <Plus className="w-4 h-4" /> New Listing
                    </Link>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-white rounded-2xl shadow-card animate-pulse" />
                        ))
                    ) : listings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                            <Tag className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                            <p className="text-brand-dark/50 text-sm mb-4">You haven't posted any listings yet</p>
                            <Link href="/listing/create"
                                className="px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90">
                                Post Your First Listing
                            </Link>
                        </div>
                    ) : listings.map(listing => {
                        const thumb = (listing.listing_images as any)?.[0]?.image_url
                        return (
                            <div key={listing.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-light flex-shrink-0">
                                    {thumb
                                        ? <img src={thumb} alt={listing.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-brand-dark/20 text-2xl">📦</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-brand-dark truncate">{listing.title}</p>
                                    <p className="text-sm text-brand-dark/50 mt-0.5">
                                        GHS {listing.price?.toLocaleString() || '—'} · {listing.location || 'No location'}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex-shrink-0 ${STATUS_COLORS[listing.status] || STATUS_COLORS.draft}`}>
                                    {listing.status}
                                </span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Link href={`/listing/${listing.id}`}
                                        className="p-2 bg-brand-light text-brand-dark/50 rounded-lg hover:text-brand-dark transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link href={`/listing/create?edit=${listing.id}`}
                                        className="p-2 bg-brand-light text-brand-dark/50 rounded-lg hover:text-brand-dark transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => deleteListing(listing.id)}
                                        className="p-2 bg-red-50 text-red-400 rounded-lg hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
