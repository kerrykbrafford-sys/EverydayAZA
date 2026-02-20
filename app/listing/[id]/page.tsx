'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Calendar,
  Tag,
  Star,
  Heart,
  Share2,
  Flag,
  MessageCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'
import PromoteListingModal from '@/components/payments/PromoteListingModal'

export default function ListingPage() {
  const params = useParams()
  const id = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPromote, setShowPromote] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchListing()
    checkFavorite()
  }, [id])

  const fetchListing = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*, listing_images(image_url), profiles(full_name, avatar_url)')
      .eq('id', id)
      .single()

    if (data) {
      const images = data.listing_images?.map((img: any) => img.image_url) || []
      setListing({ ...data, images: images.length > 0 ? images : ['/images/product-1.jpg'] })

      // Check if current user owns this listing
      const { data: { user } } = await supabase.auth.getUser()
      if (user && data.user_id === user.id) setIsOwner(true)
    }
    setLoading(false)
  }

  const checkFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', id)
      .maybeSingle()

    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to save favorites')
      return
    }

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: id })
      setIsFavorite(true)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-brand-dark/60 mb-4">Listing not found</div>
          <Link href="/" className="text-brand-gold hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-dark/60 hover:text-brand-dark mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-card">
              <img
                src={listing.images?.[selectedImage] || '/images/product-1.jpg'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3">
                {listing.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden ${selectedImage === index
                      ? 'ring-2 ring-brand-dark'
                      : 'opacity-60'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-brand-dark/60 mb-2">
                <Tag className="w-4 h-4" />
                {listing.category || 'General'}
                {listing.condition && (
                  <>
                    <span className="mx-2">•</span>
                    {listing.condition}
                  </>
                )}
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-brand-dark mb-4">
                {listing.title}
              </h1>
              <div className="text-3xl font-bold text-brand-dark">
                ₵{listing.price?.toLocaleString() || '0'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with Seller
              </button>
              <button
                onClick={toggleFavorite}
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isFavorite
                  ? 'bg-red-50 hover:bg-red-100'
                  : 'bg-brand-light hover:bg-brand-gold/20'
                  }`}
              >
                <Heart
                  className={`w-6 h-6 ${isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-brand-dark'
                    }`}
                />
              </button>
              <button className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center hover:bg-brand-gold/20 transition-colors">
                <Share2 className="w-6 h-6 text-brand-dark" />
              </button>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center">
                  <span className="text-white font-display text-xl">
                    {((listing.profiles as any)?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-brand-dark">
                    {(listing.profiles as any)?.full_name || 'Seller'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-brand-dark/60">
                    <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    4.8 (24 reviews)
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-dark/10">
                <div className="flex items-center gap-2 text-sm text-brand-dark/60">
                  <MapPin className="w-4 h-4" />
                  {listing.location || 'Unknown location'}
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-dark/60 mt-2">
                  <Calendar className="w-4 h-4" />
                  Posted on{' '}
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-xl text-brand-dark mb-4">
                Description
              </h2>
              <p className="text-brand-dark/70 whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Promote (owner only) */}
            {isOwner && (
              <button
                onClick={() => setShowPromote(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Promote This Listing
              </button>
            )}

            {/* Report */}
            <button className="flex items-center gap-2 text-sm text-brand-dark/40 hover:text-red-500 transition-colors">
              <Flag className="w-4 h-4" />
              Report this listing
            </button>
          </div>
        </div>

        {/* Promote Modal */}
        <PromoteListingModal
          listingId={id}
          listingTitle={listing.title}
          isOpen={showPromote}
          onClose={() => setShowPromote(false)}
        />
      </div>
    </main>
  )
}
