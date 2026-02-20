'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
    { slug: 'electronics', label: 'Electronics', emoji: '📱', description: 'Phones, laptops & gadgets', color: 'from-blue-500/10 to-blue-600/5' },
    { slug: 'fashion', label: 'Fashion', emoji: '👗', description: 'Clothing, shoes & accessories', color: 'from-pink-500/10 to-pink-600/5' },
    { slug: 'vehicles', label: 'Vehicles', emoji: '🚗', description: 'Cars, bikes & spare parts', color: 'from-orange-500/10 to-orange-600/5' },
    { slug: 'property', label: 'Property', emoji: '🏠', description: 'Houses & apartments', color: 'from-green-500/10 to-green-600/5' },
    { slug: 'furniture', label: 'Furniture & Home', emoji: '🛋️', description: 'Home décor & furnishings', color: 'from-amber-500/10 to-amber-600/5' },
    { slug: 'agriculture', label: 'Agriculture', emoji: '🌾', description: 'Farm produce & equipment', color: 'from-lime-500/10 to-lime-600/5' },
    { slug: 'health', label: 'Health & Beauty', emoji: '💊', description: 'Wellness & personal care', color: 'from-teal-500/10 to-teal-600/5' },
    { slug: 'sports', label: 'Sports & Outdoors', emoji: '⚽', description: 'Fitness & outdoor gear', color: 'from-indigo-500/10 to-indigo-600/5' },
    { slug: 'books', label: 'Books & Education', emoji: '📚', description: 'Textbooks & learning', color: 'from-purple-500/10 to-purple-600/5' },
    { slug: 'food', label: 'Food & Drinks', emoji: '🍎', description: 'Groceries & beverages', color: 'from-red-500/10 to-red-600/5' },
    { slug: 'babies', label: 'Babies & Kids', emoji: '👶', description: 'Toys, clothes & gear', color: 'from-yellow-500/10 to-yellow-600/5' },
    { slug: 'services', label: 'Services', emoji: '🔧', description: 'Freelance & professional', color: 'from-slate-500/10 to-slate-600/5' },
]

export default function CategoriesPage() {
    return (
        <main className="min-h-screen bg-brand-light pt-24">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-display text-4xl text-brand-dark mb-2">Browse Categories</h1>
                    <p className="text-brand-dark/50">Find exactly what you're looking for</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <Link
                            key={cat.slug}
                            href={`/category/${cat.slug}`}
                            className={`group relative bg-gradient-to-br ${cat.color} bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 cursor-pointer overflow-hidden`}
                        >
                            {/* Background emoji watermark */}
                            <div className="absolute -bottom-3 -right-3 text-7xl opacity-10 select-none">
                                {cat.emoji}
                            </div>

                            <span className="text-4xl mb-4 block">{cat.emoji}</span>
                            <h3 className="font-display text-base text-brand-dark mb-1 leading-tight">
                                {cat.label}
                            </h3>
                            <p className="text-xs text-brand-dark/50 mb-3">{cat.description}</p>
                            <div className="flex items-center gap-1 text-xs font-medium text-brand-dark/60 group-hover:text-brand-dark transition-colors">
                                Browse <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Import CTA */}
                <div className="mt-12 bg-brand-dark rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-white">
                        <h2 className="font-display text-2xl mb-1">Can't find it locally?</h2>
                        <p className="text-white/60">Import any product from China, Turkey, UAE or anywhere worldwide</p>
                    </div>
                    <Link
                        href="/import-request"
                        className="flex-shrink-0 px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded-xl hover:bg-brand-gold/90 transition-all hover:scale-105"
                    >
                        Start Importing →
                    </Link>
                </div>
            </div>
        </main>
    )
}
