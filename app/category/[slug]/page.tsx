'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import ListingGrid from '@/components/marketplace/ListingGrid'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

const CONDITIONS = ['Any', 'New', 'Like New', 'Used', 'Refurbished']
const SORT_OPTIONS = [
    { label: 'Newest First', value: 'created_at-desc' },
    { label: 'Price: Low → High', value: 'price-asc' },
    { label: 'Price: High → Low', value: 'price-desc' },
]

export default function CategoryPage() {
    const params = useParams()
    const slug = decodeURIComponent(params.slug as string)

    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [priceMin, setPriceMin] = useState('')
    const [priceMax, setPriceMax] = useState('')
    const [condition, setCondition] = useState('Any')
    const [sortBy, setSortBy] = useState('created_at-desc')
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        fetchListings()
    }, [slug, condition, sortBy])

    const fetchListings = async () => {
        setLoading(true)

        let query = supabase
            .from('listings')
            .select('*', { count: 'exact' })
            .eq('status', 'active')
            .ilike('category', slug)

        if (condition !== 'Any') {
            query = query.eq('condition', condition.toLowerCase())
        }
        if (priceMin) query = query.gte('price', Number(priceMin))
        if (priceMax) query = query.lte('price', Number(priceMax))

        const [sortField, sortDir] = sortBy.split('-')
        query = query.order(sortField, { ascending: sortDir === 'asc' })
        query = query.limit(24)

        const { data, count } = await query
        if (data) setListings(data)
        if (count !== null) setTotalCount(count)
        setLoading(false)
    }

    return (
        <main className="min-h-screen bg-brand-light pt-24">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/"
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-brand-dark" />
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl text-brand-dark capitalize">{slug}</h1>
                        <p className="text-sm text-brand-dark/40">
                            {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-[260px] flex-shrink-0">
                        <div className="sticky top-[140px] space-y-6">
                            {/* Price Range */}
                            <div className="bg-white rounded-2xl p-5 shadow-card">
                                <h3 className="font-body text-sm font-semibold text-brand-dark mb-4">Price Range</h3>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" className="flex-1 px-3 py-2 bg-brand-light/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/15" />
                                    <span className="text-brand-dark/30">–</span>
                                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" className="flex-1 px-3 py-2 bg-brand-light/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/15" />
                                </div>
                                <button onClick={fetchListings} className="w-full mt-3 py-2 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-lg text-xs font-medium text-brand-dark transition-colors">
                                    Apply
                                </button>
                            </div>

                            {/* Condition */}
                            <div className="bg-white rounded-2xl p-5 shadow-card">
                                <h3 className="font-body text-sm font-semibold text-brand-dark mb-4">Condition</h3>
                                <div className="space-y-2">
                                    {CONDITIONS.map((c) => (
                                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${condition === c ? 'bg-brand-dark border-brand-dark' : 'border-brand-dark/20 group-hover:border-brand-dark/40'
                                                }`}>
                                                {condition === c && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-brand-dark/70 group-hover:text-brand-dark" onClick={() => setCondition(c)}>{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="bg-white rounded-2xl p-5 shadow-card">
                                <h3 className="font-body text-sm font-semibold text-brand-dark mb-4">Sort By</h3>
                                <div className="space-y-1.5">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === opt.value ? 'bg-brand-dark text-white' : 'text-brand-dark/60 hover:bg-brand-dark/5'
                                            }`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Listings */}
                    <div className="flex-1 min-w-0">
                        <ListingGrid
                            listings={listings}
                            loading={loading}
                            emptyMessage={`No products found in "${slug}"`}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
