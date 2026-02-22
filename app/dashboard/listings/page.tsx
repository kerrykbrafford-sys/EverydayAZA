'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Edit, Trash2, Eye, Plus, MapPin, Loader2 } from 'lucide-react'
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
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-2xl text-brand-dark">My Listings</h1>
                    <p className="text-sm text-brand-dark/50 mt-0.5">Manage your posted items</p>
                </div>
                <Link href="/listing/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Listing
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" />
                </div>
            ) : listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-16 text-center">
                    <Package className="w-14 h-14 text-brand-dark/10 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-brand-dark mb-2">No Listings Yet</h3>
                    <p className="text-brand-dark/50 mb-6">Start selling by posting your first item</p>
                    <Link href="/listing/create" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">
                        <Plus className="w-4 h-4" /> Post First Listing
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-2xl border border-brand-dark/8 p-5 flex items-center justify-between hover:border-brand-dark/20 transition-all">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-14 h-14 bg-brand-light rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={listing.images?.[0] || '/images/product-1.jpg'} alt={listing.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-brand-dark truncate">{listing.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm font-display text-brand-gold">₵{listing.price?.toLocaleString() || '0'}</span>
                                        {listing.location && <span className="flex items-center gap-1 text-xs text-brand-dark/40"><MapPin className="w-3 h-3" />{listing.location}</span>}
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[listing.status] || statusColors.active}`}>{listing.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Link href={`/listing/${listing.id}`} className="w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors" title="View">
                                    <Eye className="w-4 h-4 text-brand-dark" />
                                </Link>
                                <button onClick={() => deleteListing(listing.id)} className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
