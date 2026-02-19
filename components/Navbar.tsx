'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, Menu, X, User, Package, MessageCircle, Heart } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-brand-dark/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl text-brand-dark">
              RecWorld
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/listing/create"
              className="flex items-center gap-2 text-sm font-medium text-brand-dark/80 hover:text-brand-dark transition-colors"
            >
              <Package className="w-4 h-4" />
              Post Listing
            </Link>
            <Link
              href="/import-request"
              className="flex items-center gap-2 text-sm font-medium text-brand-dark/80 hover:text-brand-dark transition-colors"
            >
              <Globe className="w-4 h-4" />
              Import Item
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-brand-dark/80 hover:text-brand-dark transition-colors"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-brand-dark" />
            ) : (
              <Menu className="w-6 h-6 text-brand-dark" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-brand-dark/10 pt-4">
            <Link
              href="/listing/create"
              className="flex items-center gap-2 text-brand-dark/80 hover:text-brand-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4" />
              Post Listing
            </Link>
            <Link
              href="/import-request"
              className="flex items-center gap-2 text-brand-dark/80 hover:text-brand-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Globe className="w-4 h-4" />
              Import Item
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-brand-dark/80 hover:text-brand-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-brand-dark/80 hover:text-brand-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
