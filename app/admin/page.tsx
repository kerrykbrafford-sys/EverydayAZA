'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  Globe,
  Users,
  DollarSign,
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    totalImportOrders: 0,
    totalPayments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [])

  /* Auto-refresh every 30 seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
      fetchActivity()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    // Keep loading true only on initial load to avoid flickering
    if (!stats.totalListings) setLoading(true)

    const [listingsRes, usersRes, ordersRes, paymentsRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('import_orders').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount'),
    ])

    const totalPayments = (paymentsRes.data || []).reduce(
      (sum: number, p: { amount: number | null }) => sum + (p.amount || 0),
      0
    )

    setStats({
      totalListings: listingsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalImportOrders: ordersRes.count || 0,
      totalPayments,
    })
    setLoading(false)
  }

  const fetchActivity = async () => {
    const { data: listings } = await supabase
      .from('listings')
      .select('title, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    if (listings) {
      setRecentActivity(
        listings.map((l: any) => ({
          action: `New listing: ${l.title}`,
          user: l.profiles?.full_name || 'Unknown',
          time: new Date(l.created_at).toLocaleDateString(),
        }))
      )
    }
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Active Listings',
      value: stats.totalListings.toLocaleString(),
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Import Orders',
      value: stats.totalImportOrders.toLocaleString(),
      icon: Globe,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 bg-brand-light p-8">
        <div className="max-w-6xl">
          <h1 className="font-display text-3xl text-brand-dark mb-8">
            Admin Dashboard
          </h1>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-2xl p-6 shadow-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="font-display text-2xl text-brand-dark min-h-[32px]">
                    {loading ? (
                      <div className="h-8 w-24 bg-brand-dark/10 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-brand-dark/60">{stat.title}</div>
                </div>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-display text-xl text-brand-dark mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {loading && recentActivity.length === 0 ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-brand-dark/5">
                    <div>
                      <div className="h-4 w-48 bg-brand-dark/10 rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-brand-dark/5 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-16 bg-brand-dark/5 rounded animate-pulse" />
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="text-center text-brand-dark/40 py-4">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-brand-dark/5 last:border-0"
                  >
                    <div>
                      <div className="text-brand-dark">{activity.action}</div>
                      <div className="text-sm text-brand-dark/60">
                        by {activity.user}
                      </div>
                    </div>
                    <div className="text-sm text-brand-dark/40">
                      {activity.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
