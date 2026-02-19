'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Globe,
  ArrowRight,
  Plane,
  Ship,
  ShieldCheck,
  Search,
} from 'lucide-react'
import ListingCard from '@/components/ListingCard'
import { supabase } from '@/lib/supabase'
import type { Listing } from '@/types'

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8)

    if (data) setListings(data)
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchListings()
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .ilike('title', `%${searchQuery}%`)
      .order('created_at', { ascending: false })

    if (data) setListings(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden bg-brand-light pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full">
                <Globe className="w-4 h-4 text-brand-gold" />
                <span className="text-sm font-medium text-brand-dark">
                  Global Sourcing, Simplified
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-brand-dark leading-tight">
                Import Quality Products{' '}
                <span className="text-brand-gold">From Anywhere</span>
              </h1>

              <p className="text-lg text-brand-dark/70 max-w-lg leading-relaxed">
                We handle the logistics, customs, and delivery—so you can focus
                on growing your business. From Asia to your doorstep,
                seamlessly.
              </p>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search listings..."
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 shadow-card"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors font-medium"
                >
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/listing/create"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors group"
                >
                  Sell an Item
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/import-request"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-brand-dark text-brand-dark rounded-full hover:bg-brand-dark hover:text-white transition-colors"
                >
                  Import Item
                  <Globe className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="font-display text-3xl text-brand-dark">
                    15K+
                  </div>
                  <div className="text-sm text-brand-dark/60">Happy Clients</div>
                </div>
                <div>
                  <div className="font-display text-3xl text-brand-dark">
                    50+
                  </div>
                  <div className="text-sm text-brand-dark/60">Countries</div>
                </div>
                <div>
                  <div className="font-display text-3xl text-brand-dark">
                    99%
                  </div>
                  <div className="text-sm text-brand-dark/60">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="relative h-[500px] lg:h-[600px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] lg:w-[380px] z-10">
                <img
                  src="/images/hero-main.jpg"
                  alt="Professional"
                  className="w-full h-auto rounded-2xl shadow-elevated"
                />
              </div>

              <div className="absolute top-[10%] right-[5%] w-[140px] sm:w-[160px] lg:w-[180px] z-20">
                <img
                  src="/images/hero-small-1.jpg"
                  alt="Team"
                  className="w-full h-auto rounded-xl shadow-card"
                />
              </div>

              <div className="absolute bottom-[15%] left-[5%] w-[140px] sm:w-[160px] lg:w-[180px] z-20">
                <img
                  src="/images/hero-small-2.jpg"
                  alt="Team"
                  className="w-full h-auto rounded-xl shadow-card"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 -mt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-3">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Plane className="w-8 h-8 text-brand-dark" />
              </div>
              <h3 className="font-display text-xl text-brand-dark mb-2">
                Air Freight
              </h3>
              <p className="text-brand-dark/60">
                7-10 days delivery for urgent shipments
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-3 md:scale-105 md:shadow-elevated">
              <div className="w-16 h-16 bg-cyan-50 rounded-xl flex items-center justify-center mb-6">
                <Ship className="w-8 h-8 text-brand-dark" />
              </div>
              <h3 className="font-display text-xl text-brand-dark mb-2">
                Sea Freight
              </h3>
              <p className="text-brand-dark/60">
                35-40 days for cost-effective bulk orders
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-3">
              <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-brand-dark" />
              </div>
              <h3 className="font-display text-xl text-brand-dark mb-2">
                Secure Payments
              </h3>
              <p className="text-brand-dark/60">
                Escrow protection for every transaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 lg:py-32 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-gold font-medium mb-4">
                <span className="w-8 h-px bg-brand-gold" />
                Marketplace
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-dark">
                Featured Listings
              </h2>
            </div>
            <Link
              href="/listing/create"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-dark text-brand-dark rounded-full hover:bg-brand-dark hover:text-white transition-colors self-start"
            >
              Post Your Item
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-brand-dark/40">
              Loading listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-dark/40 mb-4">
                {searchQuery ? 'No listings match your search' : 'No listings yet. Be the first to post!'}
              </p>
              <Link
                href="/listing/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
              >
                Post a Listing
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-brand-gold font-medium mb-4">
              <span className="w-8 h-px bg-brand-gold" />
              How It Works
              <span className="w-8 h-px bg-brand-gold" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-dark">
              Four Steps to Global Sourcing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Browse Products',
                desc: 'Explore our curated catalog of international products.',
                img: '/images/step-1.jpg',
              },
              {
                step: '02',
                title: 'Request a Quote',
                desc: 'Get competitive pricing within 24 hours.',
                img: '/images/step-2.jpg',
              },
              {
                step: '03',
                title: 'Confirm Order',
                desc: 'Review and approve your quote securely.',
                img: '/images/step-3.jpg',
              },
              {
                step: '04',
                title: 'Receive & Track',
                desc: 'Get real-time updates on your shipment.',
                img: '/images/step-4.jpg',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative group text-center">
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-brand-dark/10">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-gold rounded-full" />
                  </div>
                )}

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-brand-dark/10 mb-6 group-hover:border-brand-gold group-hover:bg-brand-gold/5 transition-all">
                  <span className="font-display text-3xl text-brand-dark/20 group-hover:text-brand-gold transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-brand-light max-w-[200px] mx-auto">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-display text-xl text-brand-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-brand-dark/60 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-gold/10 rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-gold/5 rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
            Ready to Start Importing?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Get your first quote within 24 hours. No commitments, no hidden
            fees.
          </p>
          <Link
            href="/import-request"
            className="inline-flex items-center gap-2 px-10 py-4 bg-brand-gold text-brand-dark rounded-full font-semibold hover:bg-brand-gold/90 transition-colors group"
          >
            Get Free Quote
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}
