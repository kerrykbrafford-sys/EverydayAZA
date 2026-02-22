'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

export default function DashboardFavoritesPage() {
    const [favorites, setFavorites] = useState<(Listing & { favorite_listing_id: string })[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFavorites()
    }, [])

    const fetchFavorites = async () => {
        setLoading(true)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        const { data } = await supabase
            .from('favorites')
            .select('user_id, listing_id, listings(*)')
            .eq('user_id', user.id)

        if (data) {
            const mapped = data
                .filter((f: any) => f.listings)
                .map((f: any) => ({
                    ...f.listings,
                    favorite_listing_id: f.listing_id,
                }))
            setFavorites(mapped)
        }
        setLoading(false)
    }

    const removeFavorite = async (listingId: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId)
        setFavorites((prev) => prev.filter((f) => f.favorite_listing_id !== listingId))
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="font-display text-2xl text-brand-dark">Favorites</h1>
                <p className="text-sm text-brand-dark/50 mt-0.5">Items you saved</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" />
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-dark/8 p-16 text-center">
                    <Heart className="w-14 h-14 text-brand-dark/10 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-brand-dark mb-2">No Favorites Yet</h3>
                    <p className="text-brand-dark/50 mb-6">Browse listings and save the ones you love</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">Browse Listings</Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favorites.map((listing) => (
                        <div key={listing.favorite_listing_id} className="group bg-white rounded-2xl overflow-hidden border border-brand-dark/8 hover:border-brand-dark/20 hover:shadow-md transition-all">
                            <Link href={`/listing/${listing.id}`}>
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img src={listing.images?.[0] || '/images/product-1.jpg'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </Link>
                            <div className="p-4">
                                <Link href={`/listing/${listing.id}`}>
                                    <h3 className="font-medium text-brand-dark mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">{listing.title}</h3>
                                </Link>
                                {listing.location && (
                                    <div className="flex items-center gap-1 text-xs text-brand-dark/50 mb-2">
                                        <MapPin className="w-3 h-3" />{listing.location}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="font-display text-brand-dark">₵{listing.price?.toLocaleString() || '0'}</span>
                                    <button onClick={() => removeFavorite(listing.favorite_listing_id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
