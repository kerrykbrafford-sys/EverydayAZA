'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, ChevronDown, X, Grid2X2, List } from 'lucide-react'
import ListingGrid from '@/components/marketplace/ListingGrid'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

const CONDITIONS = ['Any', 'New', 'Like New', 'Used', 'Refurbished']
const CATEGORIES = [
  'Electronics', 'Fashion', 'Vehicles', 'Property',
  'Furniture', 'Agriculture', 'Health & Beauty', 'Sports',
]
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
]

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('Any')
  const [sortBy, setSortBy] = useState('created_at-desc')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { fetchListings() }, [category, condition, sortBy])

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (category) query = query.ilike('category', category)
    if (condition !== 'Any') query = query.eq('condition', condition.toLowerCase().replace(' ', '_'))
    if (priceMin) query = query.gte('price', Number(priceMin))
    if (priceMax) query = query.lte('price', Number(priceMax))
    if (search) query = query.ilike('title', `%${search}%`)

    const [sortField, sortDir] = sortBy.split('-')
    query = query.order(sortField, { ascending: sortDir === 'asc' }).limit(48)

    const { data, count } = await query
    if (data) setListings(data)
    if (count !== null) setTotalCount(count)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-brand-light pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-brand-dark">All Listings</h1>
          <p className="text-sm text-brand-dark/40 mt-1">
            {loading ? 'Loading...' : `${totalCount.toLocaleString()} products available`}
          </p>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/35" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchListings()}
              placeholder="Search all listings..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl shadow-card border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-8 py-3 bg-white rounded-xl shadow-card border-none focus:outline-none cursor-pointer text-sm"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-card text-sm transition-all ${showFilters ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark hover:bg-brand-dark hover:text-white'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${!category ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark/60 hover:text-brand-dark shadow-card'}`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${category === c ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark/60 hover:text-brand-dark shadow-card'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-card p-5 mb-6 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-2">Condition</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${condition === c ? 'bg-brand-dark text-white' : 'bg-brand-light text-brand-dark/60 hover:text-brand-dark'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-2">Min Price (GHS)</label>
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-brand-light rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-2">Max Price (GHS)</label>
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 bg-brand-light rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2">
              <button onClick={() => { setCondition('Any'); setPriceMin(''); setPriceMax(''); setCategory('') }}
                className="px-4 py-2 text-sm text-brand-dark/50 hover:text-brand-dark transition-colors">
                Clear all
              </button>
              <button onClick={fetchListings}
                className="px-5 py-2 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <ListingGrid listings={listings} loading={loading} emptyMessage="No listings found. Try adjusting your filters." />
      </div>
    </main>
  )
}
