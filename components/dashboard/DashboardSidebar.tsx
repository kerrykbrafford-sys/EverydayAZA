'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    MessageSquare,
    Globe,
    ShoppingBag,
    Heart,
    CreditCard,
    User,
    Settings,
    LogOut,
    ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/listings', label: 'My Listings', icon: Package },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/imports', label: 'Import Requests', icon: Globe },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Failed to sign out')
        } else {
            router.push('/')
            router.refresh()
        }
    }

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href
        return pathname.startsWith(href)
    }

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-brand-dark/8 flex flex-col flex-shrink-0">
            {/* Brand */}
            <div className="p-6 border-b border-brand-dark/8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display text-brand-dark text-base leading-tight">
                        My Dashboard
                    </span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href, item.exact)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                                    ? 'bg-brand-dark text-white shadow-sm'
                                    : 'text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5'
                                }`}
                        >
                            <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-brand-dark/40 group-hover:text-brand-dark'}`} />
                            <span className="flex-1">{item.label}</span>
                            {active && <ChevronRight className="w-4 h-4 text-white/50" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-3 border-t border-brand-dark/8">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
