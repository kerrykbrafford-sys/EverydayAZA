'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Globe,
  Menu,
  X,
  User,
  Package,
  Heart,
  Search,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Check auth + role
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowUserMenu(false)
    router.push('/')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-brand-dark/8 py-2'
          : 'bg-white py-3'
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* EverydayAZA Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/logo.svg"
                alt="EverydayAZA"
                width={260}
                height={60}
                priority
                className="h-14 w-auto"
              />
            </Link>

            {/* Center Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/35" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-light/80 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-dark/15 focus:border-brand-dark/10 focus:bg-white transition-all placeholder:text-brand-dark/35"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(`/?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`)
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/listing/create"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Sell</span>
              </Link>

              <Link
                href="/import-request"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Import</span>
              </Link>

              <Link
                href="/dashboard/favorites"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl transition-all"
              >
                <Heart className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/import-orders"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
              </Link>

              {/* User */}
              {user ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-brand-dark/5 transition-all"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-dark to-brand-dark/80 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      {isAdmin && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-gold rounded-full flex items-center justify-center" title="Admin">
                          <Shield className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-brand-dark/40" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-brand-dark/8 py-2 z-50 animate-slideUp">
                        <div className="px-4 py-2 border-b border-brand-dark/8">
                          <p className="text-xs text-brand-dark/40 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/listings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="w-4 h-4" />
                          My Listings
                        </Link>
                        <Link
                          href="/dashboard/favorites"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="w-4 h-4" />
                          Favourites
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-gold hover:text-brand-gold/80 hover:bg-brand-gold/10 transition-colors font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-brand-dark/8 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="ml-1 flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white text-sm font-medium rounded-xl hover:bg-brand-dark/90 transition-all"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-brand-dark/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-brand-dark" />
              ) : (
                <Menu className="w-5 h-5 text-brand-dark" />
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/35" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-brand-light/80 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`)
                  }
                }}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-1 border-t border-brand-dark/8 pt-3 animate-slideUp">
              <Link
                href="/listing/create"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-4 h-4" />
                Post Listing
              </Link>
              <Link
                href="/import-request"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe className="w-4 h-4" />
                Import Item
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/favorites"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                Favourites
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Login / Register
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
