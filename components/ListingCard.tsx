'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    checkFavorite()
  }, [listing.id])

  const checkFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()

    setIsFavorite(!!data)
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
      setIsFavorite(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listing.id })
      setIsFavorite(true)
    }
  }

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={listing.images?.[0] || '/images/product-1.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <button
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isFavorite
                ? 'bg-red-50 opacity-100'
                : 'bg-white/90 hover:bg-brand-gold'
              }`}
            onClick={toggleFavorite}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-brand-dark'
                }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg text-brand-dark mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-brand-dark/60 mb-2">
            <MapPin className="w-4 h-4" />
            {listing.location || 'Unknown'}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-brand-dark">
              ${listing.price?.toLocaleString() || '0'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
              <span className="text-sm text-brand-dark/60">4.8</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
