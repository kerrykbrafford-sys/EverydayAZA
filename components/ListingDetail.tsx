'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import type { Listing } from '@/types'

interface ListingDetailProps {
  listing: Listing
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [imgError, setImgError] = useState(false)

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
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-card relative">
              <img
                src={!imgError ? (listing.images?.[selectedImage] || '/images/product-1.jpg') : 'https://placehold.co/600x600?text=No+Image'}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3">
                {listing.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index)
                      setImgError(false)
                    }}
                    className={`w-20 h-20 rounded-xl overflow-hidden ${selectedImage === index
                      ? 'ring-2 ring-brand-dark'
                      : 'opacity-60'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=?'
                      }}
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
                {listing.category}
                <span className="mx-2">•</span>
                {listing.condition}
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-brand-dark mb-4">
                {listing.title}
              </h1>
              <div className="text-3xl font-bold text-brand-dark">
                ₵{listing.price?.toLocaleString() || '0.00'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with Seller
              </button>
              <button className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center hover:bg-brand-gold/20 transition-colors">
                <Heart className="w-6 h-6 text-brand-dark" />
              </button>
              <button className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center hover:bg-brand-gold/20 transition-colors">
                <Share2 className="w-6 h-6 text-brand-dark" />
              </button>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center overflow-hidden">
                  {listing.profiles?.avatar_url ? (
                    <img src={listing.profiles.avatar_url} alt="Seller" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-display text-xl">
                      {listing.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-brand-dark">
                    {listing.profiles?.full_name || 'Unknown Seller'}
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
                  {listing.location}
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
                {listing.description}
              </p>
            </div>

            {/* Report */}
            <button className="flex items-center gap-2 text-sm text-brand-dark/40 hover:text-red-500 transition-colors">
              <Flag className="w-4 h-4" />
              Report this listing
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
