import Link from 'next/link'
import { Globe, Mail, Phone, Shield, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

const FOOTER_LINKS = {
    Marketplace: [
        { label: 'All Listings', href: '/listings' },
        { label: 'Categories', href: '/categories' },
        { label: 'Post a Listing', href: '/listing/create' },
        { label: 'Import a Product', href: '/import-request' },
    ],
    Account: [
        { label: 'My Profile', href: '/profile' },
        { label: 'My Listings', href: '/profile/listings' },
        { label: 'My Orders', href: '/profile/orders' },
        { label: 'Messages', href: '/dashboard/messages' },
    ],
    Support: [
        { label: 'Help Center', href: '/help' },
        { label: 'Safety Tips', href: '/safety' },
        { label: 'Report a Problem', href: '/report' },
        { label: 'Contact Us', href: '/contact' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-white/60">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4 text-brand-dark" />
                            </div>
                            <span className="font-display text-xl text-white">EverydayAZA</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-4">
                            Ghana's premier marketplace & import platform. Buy, sell, and import globally with confidence.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 bg-white/10 hover:bg-brand-gold/20 hover:text-brand-gold rounded-lg flex items-center justify-center transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <h4 className="text-sm font-semibold text-white mb-3">{group}</h4>
                            <ul className="space-y-2">
                                {links.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs">© {new Date().getFullYear()} EverydayAZA. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-xs">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                        <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-brand-gold" /> Secured Platform
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
