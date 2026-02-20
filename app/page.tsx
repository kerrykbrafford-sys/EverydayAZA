'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Grid3X3,
  LayoutList,
  X,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Globe,
  Package,
} from 'lucide-react'
import ListingGrid from '@/components/marketplace/ListingGrid'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Vehicles',
  'Health & Wellness',
  'Sport',
  'Art',
  'Books & Media',
  'Services',
]

const CATEGORIES_WITH_SUBS: Record<string, string[]> = {
  Electronics: ['Phones & Tablets', 'Laptops & Computers', 'TVs & Audio', 'Cameras & Drones', 'Accessories'],
  Vehicles: ['Cars', 'Motorcycles', 'Trucks & Vans', 'Vehicle Parts', 'Boats & Watercraft'],
  Property: ['Houses for Sale', 'Apartments', 'Land', 'Commercial Property', 'Short Stay / AirBnB'],
  'Home & Garden': ['Furniture', 'Home Appliances', 'Kitchen & Dining', 'Garden & Outdoor', 'Home Decor'],
  Fashion: ["Men's Clothing", "Women's Clothing", 'Shoes & Sneakers', 'Bags & Luggage', 'Jewellery & Watches'],
  Sports: ['Gym Equipment', 'Outdoor & Adventure', 'Team Sports', 'Cycling'],
  Services: ['Cleaning & Maintenance', 'Repairs & Technicians', 'Transport & Delivery', 'Tutoring & Education'],
}

const CONDITIONS = ['Any', 'New', 'Like New', 'Used', 'Refurbished']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Most Popular', value: 'views-desc' },
]

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Categories')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [condition, setCondition] = useState('Any')
  const [sortBy, setSortBy] = useState('created_at-desc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [activeSubCategory, setActiveSubCategory] = useState('')

  const currentSubCategories = CATEGORIES_WITH_SUBS[activeCategory] || []

  useEffect(() => {
    fetchCategories()
    fetchListings()
  }, [activeCategory, activeSubCategory, condition, sortBy])

  const fetchCategories = async () => {
    const { data, error: catError } = await supabase.from('categories').select('name').order('name')
    if (catError) {
      console.error('Failed to fetch categories:', catError)
    } else if (data && data.length > 0) {
      setCategories(['All Categories', ...data.map((c: any) => c.name)])
    }
  }

  const fetchListings = async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (activeCategory !== 'All Categories') {
      query = query.eq('category', activeCategory)
    }
    if (activeSubCategory) {
      query = query.eq('sub_category', activeSubCategory)
    }

    if (condition !== 'Any') {
      query = query.eq('condition', condition.toLowerCase())
    }

    if (searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery}%`)
    }

    if (priceMin) query = query.gte('price', Number(priceMin))
    if (priceMax) query = query.lte('price', Number(priceMax))

    const [sortField, sortDir] = sortBy.split('-')
    query = query.order(sortField, { ascending: sortDir === 'asc' })
    query = query.limit(24)

    const { data, count, error: fetchError } = await query

    if (fetchError) {
      console.error('Failed to fetch listings:', fetchError)
      setError(fetchError.message || 'Failed to fetch the listings. Please try again.')
    } else {
      if (data) setListings(data)
      if (count !== null) setTotalCount(count)
    }

    setLoading(false)
  }

  const handleSearch = () => {
    fetchListings()
  }

  const clearFilters = () => {
    setActiveCategory('All Categories')
    setActiveSubCategory('')
    setPriceMin('')
    setPriceMax('')
    setCondition('Any')
    setSortBy('created_at-desc')
    setSearchQuery('')
  }

  const hasActiveFilters =
    activeCategory !== 'All Categories' ||
    priceMin !== '' ||
    priceMax !== '' ||
    condition !== 'Any' ||
    searchQuery !== ''

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      {/* Category Bar */}
      <div className="border-b border-brand-dark/8 bg-white/60 backdrop-blur-sm sticky top-[68px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveSubCategory('') }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Sub-category pills — only visible when parent has sub-categories */}
          {currentSubCategories.length > 0 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveSubCategory('')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeSubCategory === ''
                  ? 'bg-brand-gold/20 text-brand-dark border border-brand-gold/40'
                  : 'text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 border border-transparent'
                  }`}
              >
                All {activeCategory}
              </button>
              {currentSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(sub)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeSubCategory === sub
                    ? 'bg-brand-gold/20 text-brand-dark border border-brand-gold/40'
                    : 'text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 border border-transparent'
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* === SIDEBAR (Desktop) === */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[140px] space-y-6">
              {/* Search */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2.5 bg-brand-light/70 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body text-sm font-semibold text-brand-dark">Price Range</h3>
                  {(priceMin || priceMax) && (
                    <button
                      onClick={() => { setPriceMin(''); setPriceMax('') }}
                      className="text-xs text-brand-dark/40 hover:text-brand-dark"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 bg-brand-light/70 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                    />
                  </div>
                  <span className="text-brand-dark/30 text-sm">–</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 bg-brand-light/70 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full mt-3 py-2 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-lg text-xs font-medium text-brand-dark transition-colors"
                >
                  Apply Price
                </button>
              </div>

              {/* Condition */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-body text-sm font-semibold text-brand-dark mb-4">Condition</h3>
                <div className="space-y-2">
                  {CONDITIONS.map((c) => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${condition === c
                          ? 'bg-brand-dark border-brand-dark'
                          : 'border-brand-dark/20 group-hover:border-brand-dark/40'
                          }`}
                      >
                        {condition === c && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-brand-dark/70 group-hover:text-brand-dark">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-body text-sm font-semibold text-brand-dark mb-4">Sort By</h3>
                <div className="space-y-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === opt.value
                        ? 'bg-brand-dark text-white'
                        : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Import CTA */}
              <div className="bg-gradient-to-br from-brand-dark to-brand-dark/90 rounded-2xl p-5 text-white">
                <Globe className="w-8 h-8 text-brand-gold mb-3" />
                <h3 className="font-body text-sm font-semibold mb-1">Import from Anywhere</h3>
                <p className="text-xs text-white/60 mb-4">
                  Can't find what you need? Request an import from Asia.
                </p>
                <Link
                  href="/import-request"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-brand-dark rounded-lg text-xs font-semibold hover:bg-brand-gold/90 transition-colors"
                >
                  Request Import
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* === MAIN CONTENT === */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-body text-lg font-semibold text-brand-dark">
                  {activeCategory === 'All Categories' ? 'All Products' : activeCategory}
                </h1>
                <p className="text-sm text-brand-dark/40 mt-0.5">
                  {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-dark/60 hover:text-brand-dark bg-white rounded-lg shadow-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear filters
                  </button>
                )}

                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-brand-dark"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Sort dropdown (mobile) */}
                <div className="relative lg:hidden">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white rounded-xl shadow-sm px-4 py-2 pr-8 text-sm font-medium text-brand-dark focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showMobileFilters && (
              <div className="lg:hidden bg-white rounded-2xl shadow-card p-5 mb-5 animate-slideUp space-y-5">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2.5 bg-brand-light/70 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                  />
                </div>

                {/* Mobile Price */}
                <div>
                  <h4 className="text-sm font-semibold text-brand-dark mb-2">Price Range</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 bg-brand-light/70 rounded-lg text-sm border-none focus:outline-none"
                    />
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 bg-brand-light/70 rounded-lg text-sm border-none focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Condition */}
                <div>
                  <h4 className="text-sm font-semibold text-brand-dark mb-2">Condition</h4>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCondition(c)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${condition === c
                          ? 'bg-brand-dark text-white'
                          : 'bg-brand-light text-brand-dark/60'
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { handleSearch(); setShowMobileFilters(false) }}
                    className="flex-1 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => { clearFilters(); setShowMobileFilters(false) }}
                    className="px-4 py-2.5 border border-brand-dark/20 text-brand-dark rounded-xl text-sm font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Strip */}
            <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
              <Link
                href="/listing/create"
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-sm font-medium text-brand-dark whitespace-nowrap hover:bg-brand-gold/20 transition-colors"
              >
                <Package className="w-4 h-4 text-brand-gold" />
                Sell an Item
              </Link>
              <Link
                href="/import-request"
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark/5 border border-brand-dark/10 rounded-xl text-sm font-medium text-brand-dark whitespace-nowrap hover:bg-brand-dark/10 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-dark/60" />
                Import from Asia
              </Link>
            </div>

            {/* Listing Grid */}
            <ListingGrid
              listings={listings}
              loading={loading}
              error={error}
              onRetry={fetchListings}
              emptyMessage={
                searchQuery
                  ? `No products matching "${searchQuery}"`
                  : activeCategory !== 'All Categories'
                    ? `No products in ${activeCategory}`
                    : 'No products listed yet. Be the first to sell!'
              }
            />
          </div>
        </div>
      </div>
    </main>
  )
}
