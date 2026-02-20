'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Heart,
  Inbox,
  Globe,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const dashboardItems = [
  {
    title: 'My Listings',
    description: 'Manage your posted items',
    icon: Package,
    href: '/dashboard/listings',
    color: 'bg-blue-50',
  },
  {
    title: 'Favorites',
    description: 'Items you saved',
    icon: Heart,
    href: '/dashboard/favorites',
    color: 'bg-red-50',
  },
  {
    title: 'Import Requests',
    description: 'Items you requested to import',
    icon: Inbox,
    href: '/dashboard/import-orders',
    color: 'bg-green-50',
  },
  {
    title: 'Import Orders',
    description: 'Track your imports',
    icon: Globe,
    href: '/dashboard/import-orders',
    color: 'bg-purple-50',
  },
]

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    listings: 0,
    favorites: 0,
    messages: 0,
    importOrders: 0,
  })

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [listingsRes, favoritesRes, importRequestsRes, ordersRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('import_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('import_orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    setCounts({
      listings: listingsRes.count || 0,
      favorites: favoritesRes.count || 0,
      messages: importRequestsRes.count || 0,
      importOrders: ordersRes.count || 0,
    })
  }

  const countValues = [counts.listings, counts.favorites, counts.messages, counts.importOrders]

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-brand-dark mb-2">
            Dashboard
          </h1>
          <p className="text-brand-dark/60">
            Welcome back! Here&apos;s what&apos;s happening with your account.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-brand-gold" />
              </div>
            </div>
            <div className="font-display text-2xl text-brand-dark">{counts.listings}</div>
            <div className="text-sm text-brand-dark/60">My Listings</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="font-display text-2xl text-brand-dark">{counts.favorites}</div>
            <div className="text-sm text-brand-dark/60">Favorites</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Inbox className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="font-display text-2xl text-brand-dark">{counts.messages}</div>
            <div className="text-sm text-brand-dark/60">Import Requests</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="font-display text-2xl text-brand-dark">{counts.importOrders}</div>
            <div className="text-sm text-brand-dark/60">Import Orders</div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {dashboardItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7 text-brand-dark" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-brand-dark group-hover:text-brand-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-brand-dark/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center text-sm font-medium text-brand-dark">
                      {countValues[index]}
                    </span>
                    <ArrowRight className="w-5 h-5 text-brand-dark/40 group-hover:text-brand-dark group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-xl text-brand-dark mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/listing/create"
              className="px-6 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
            >
              Post New Listing
            </Link>
            <Link
              href="/import-request"
              className="px-6 py-3 border-2 border-brand-dark text-brand-dark rounded-xl hover:bg-brand-dark hover:text-white transition-colors"
            >
              Request Import
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
