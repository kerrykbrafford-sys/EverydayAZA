'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package, MessageSquare, Globe, ShoppingBag,
  Heart, CreditCard, TrendingUp, ArrowRight, Plus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  listings: number
  messages: number
  imports: number
  orders: number
  favorites: number
  payments: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ listings: 0, messages: 0, imports: 0, orders: 0, favorites: 0, payments: 0 })
  const [recentListings, setRecentListings] = useState<any[]>([])
  const [recentImports, setRecentImports] = useState<any[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, listingsRes, messagesRes, importsRes, ordersRes, favRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('listings').select('id,title,price,status,images,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('conversations').select('id', { count: 'exact', head: true }).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
      supabase.from('import_requests').select('id,product_name,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('import_orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    setUserName(profileRes.data?.full_name || 'there')
    setStats({
      listings: listingsRes.data?.length || 0,
      messages: messagesRes.count || 0,
      imports: importsRes.data?.length || 0,
      orders: ordersRes.count || 0,
      favorites: favRes.count || 0,
      payments: paymentsRes.count || 0,
    })
    setRecentListings(listingsRes.data || [])
    setRecentImports(importsRes.data || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'My Listings', value: stats.listings, icon: Package, href: '/dashboard/listings', color: 'bg-blue-50 text-blue-600' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, href: '/dashboard/messages', color: 'bg-purple-50 text-purple-600' },
    { label: 'Import Requests', value: stats.imports, icon: Globe, href: '/dashboard/imports', color: 'bg-amber-50 text-amber-600' },
    { label: 'Orders', value: stats.orders, icon: ShoppingBag, href: '/dashboard/orders', color: 'bg-green-50 text-green-600' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, href: '/dashboard/favorites', color: 'bg-red-50 text-red-500' },
    { label: 'Payments', value: stats.payments, icon: CreditCard, href: '/dashboard/payments', color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-dark">
          Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-brand-dark/50 mt-1">Here's an overview of your account activity.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/listing/create" className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors">
          <Plus className="w-4 h-4" /> Post Listing
        </Link>
        <Link href="/dashboard/imports/request" className="flex items-center gap-2 px-5 py-2.5 border border-brand-dark/20 text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-dark/5 transition-colors">
          <Globe className="w-4 h-4" /> Request Import
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="group bg-white rounded-2xl p-5 shadow-sm border border-brand-dark/5 hover:shadow-md hover:border-brand-dark/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-brand-dark/20 group-hover:text-brand-dark/60 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="font-display text-2xl text-brand-dark">
                {loading ? <div className="h-8 w-16 bg-brand-dark/10 rounded animate-pulse" /> : card.value}
              </div>
              <div className="text-sm text-brand-dark/50 mt-0.5">{card.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-dark/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/5">
            <h2 className="font-display text-lg text-brand-dark">Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-xs text-brand-dark/40 hover:text-brand-dark transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-brand-dark/5">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4">
                  <div className="w-12 h-12 bg-brand-dark/5 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-brand-dark/5 rounded animate-pulse w-40" />
                    <div className="h-3 bg-brand-dark/5 rounded animate-pulse w-24" />
                  </div>
                </div>
              ))
            ) : recentListings.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Package className="w-10 h-10 text-brand-dark/10 mx-auto mb-2" />
                <p className="text-sm text-brand-dark/40">No listings yet</p>
                <Link href="/listing/create" className="text-sm text-brand-dark font-medium mt-2 inline-block hover:underline">Post your first listing</Link>
              </div>
            ) : recentListings.map((l) => (
              <Link key={l.id} href={`/listing/${l.id}`} className="flex items-center gap-3 px-6 py-4 hover:bg-brand-dark/2 transition-colors">
                <div className="w-12 h-12 bg-brand-light rounded-xl overflow-hidden flex-shrink-0">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                    : <Package className="w-6 h-6 text-brand-dark/20 m-auto mt-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{l.title}</p>
                  <p className="text-xs text-brand-gold">₵{l.price?.toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${l.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-dark/5 text-brand-dark/50'}`}>
                  {l.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Imports */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-dark/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/5">
            <h2 className="font-display text-lg text-brand-dark">Import Requests</h2>
            <Link href="/dashboard/imports" className="text-xs text-brand-dark/40 hover:text-brand-dark transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-brand-dark/5">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="h-4 bg-brand-dark/5 rounded animate-pulse w-40 mb-2" />
                  <div className="h-3 bg-brand-dark/5 rounded animate-pulse w-24" />
                </div>
              ))
            ) : recentImports.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Globe className="w-10 h-10 text-brand-dark/10 mx-auto mb-2" />
                <p className="text-sm text-brand-dark/40">No import requests yet</p>
                <Link href="/dashboard/imports/request" className="text-sm text-brand-dark font-medium mt-2 inline-block hover:underline">Start an import</Link>
              </div>
            ) : recentImports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-6 py-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{r.product_name}</p>
                  <p className="text-xs text-brand-dark/40">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${r.status === 'quoted' ? 'bg-blue-50 text-blue-600' :
                    r.status === 'paid' ? 'bg-green-50 text-green-600' :
                      'bg-amber-50 text-amber-600'
                  }`}>{r.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
