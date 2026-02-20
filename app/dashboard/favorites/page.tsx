'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, MapPin, Trash2 } from 'lucide-react'
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
                            Favorites
                        </h1>
                        <p className="text-brand-dark/60">Items you saved</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center text-brand-dark/40">
                        Loading favorites...
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-red-300" />
                        </div>
                        <h2 className="font-display text-2xl text-brand-dark mb-2">
                            No Favorites Yet
                        </h2>
                        <p className="text-brand-dark/60 mb-6">
                            Browse listings and save the ones you love
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((listing) => (
                            <div
                                key={listing.favorite_listing_id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
                            >
                                <Link href={`/listing/${listing.id}`}>
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        <img
                                            src={listing.images?.[0] || '/images/product-1.jpg'}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </Link>
                                <div className="p-5">
                                    <Link href={`/listing/${listing.id}`}>
                                        <h3 className="font-display text-lg text-brand-dark mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
                                            {listing.title}
                                        </h3>
                                    </Link>
                                    {listing.location && (
                                        <div className="flex items-center gap-1 text-sm text-brand-dark/60 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            {listing.location}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-semibold text-brand-dark">
                                            ₵{listing.price?.toLocaleString() || '0'}
                                        </span>
                                        <button
                                            onClick={() => removeFavorite(listing.favorite_listing_id)}
                                            className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                                            title="Remove from favorites"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
