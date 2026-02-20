'use client'

import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/types'

interface ListingGridProps {
    listings: Listing[]
    loading?: boolean
    error?: string | null
    onRetry?: () => void
    emptyMessage?: string
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className="aspect-square skeleton" />
            <div className="p-4 space-y-2.5">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/4 skeleton" />
                <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-1/3 skeleton" />
                    <div className="w-8 h-8 rounded-full skeleton" />
                </div>
            </div>
        </div>
    )
}

export default function ListingGrid({ listings, loading, error, onRetry, emptyMessage }: ListingGridProps) {
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Something went wrong</h3>
                <p className="text-brand-dark/60 mb-6 max-w-sm">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-2.5 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        )
    }

    if (loading && listings.length === 0) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        )
    }

    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-dark/30">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-brand-dark/50 font-medium mb-1">
                    {emptyMessage || 'No listings found'}
                </p>
                <p className="text-sm text-brand-dark/30">
                    Try adjusting your filters or search terms
                </p>
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
            ))}
        </div>
    )
}
