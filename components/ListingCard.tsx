'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing & { promoted?: boolean }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    checkFavorite()
  }, [listing.id])

  const checkFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listing.id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: listing.id })
      setIsFavorite(true)
    }
  }

  const imageUrl = listing.images?.[0] || ''

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-light to-white">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-brand-dark/15" />
            </div>
          )}

          {/* Favorite button */}
          <button
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorite
              ? 'bg-red-50 shadow-sm scale-100'
              : 'bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
              }`}
            onClick={toggleFavorite}
          >
            <Heart
              className={`w-4.5 h-4.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-brand-dark/60'
                }`}
              style={{ width: 18, height: 18 }}
            />
          </button>

          {/* Badge */}
          {listing.promoted && (
            <span className="absolute top-3 left-3 badge badge-top">Top item</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-body text-sm font-medium text-brand-dark mb-1.5 line-clamp-1 group-hover:text-brand-gold transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span className="text-xs text-brand-dark/50 font-medium">4.8</span>
          </div>

          <div className="flex items-center justify-between">
            {listing.condition === 'used' && listing.price ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-dark/40 line-through">
                  ₵{(listing.price * 1.2).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-brand-dark">
                  ₵{listing.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-brand-dark">
                ₵{listing.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </span>
            )}

            <div className="w-8 h-8 rounded-full bg-brand-dark/5 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-all">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
