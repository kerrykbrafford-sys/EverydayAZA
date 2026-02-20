'use client'

import { useState } from 'react'
import { Star, Zap, X, CreditCard, ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PromoteListingModalProps {
    listingId: string
    listingTitle: string
    isOpen: boolean
    onClose: () => void
}

const promotionPlans = [
    {
        id: 'featured',
        name: 'Featured',
        price: 50,
        currency: 'GHS',
        duration: '7 days',
        badge: 'Featured',
        icon: Star,
        color: 'from-amber-500 to-yellow-500',
        benefits: [
            'Highlighted in search results',
            'Featured badge on listing',
            'Priority in category pages',
        ],
    },
    {
        id: 'top',
        name: 'Top Listing',
        price: 100,
        currency: 'GHS',
        duration: '14 days',
        badge: 'Top',
        icon: Zap,
        color: 'from-purple-600 to-indigo-600',
        benefits: [
            'Pinned to top of homepage',
            'Top listing badge',
            'Featured in all categories',
            'Priority in search results',
            'Highlighted seller badge',
        ],
    },
]

export default function PromoteListingModal({
    listingId,
    listingTitle,
    isOpen,
    onClose,
}: PromoteListingModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handlePromote = async () => {
        const plan = promotionPlans.find((p) => p.id === selectedPlan)
        if (!plan) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                window.location.href = '/login'
                return
            }

            // Create promotion record
            const { data: promotion } = await supabase
                .from('promotions')
                .insert({
                    listing_id: listingId,
                    type: plan.id,
                    expires_at: new Date(Date.now() + (plan.id === 'top' ? 14 : 7) * 86400000).toISOString(),
                    is_active: false, // Activated after payment
                })
                .select()
                .single()

            if (!promotion) throw new Error('Failed to create promotion')

            // Initialize payment
            const res = await fetch('/api/payments/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    amount: plan.price,
                    currency: plan.currency,
                    userId: user.id,
                    type: 'promotion',
                    relatedId: promotion.id,
                }),
            })

            const data = await res.json()
            if (data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                alert(data.error || 'Payment failed')
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full animate-slideUp overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-dark to-brand-dark/80 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <h2 className="font-display text-2xl mb-1">Promote Your Listing</h2>
                    <p className="text-white/70 text-sm truncate">{listingTitle}</p>
                </div>

                {/* Plans */}
                <div className="p-6 space-y-4">
                    {promotionPlans.map((plan) => {
                        const Icon = plan.icon
                        const isSelected = selectedPlan === plan.id
                        return (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? 'border-brand-dark bg-brand-dark/5 shadow-lg'
                                        : 'border-brand-dark/10 hover:border-brand-dark/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-display text-lg text-brand-dark">{plan.name}</h3>
                                            <div className="font-display text-xl text-brand-dark">
                                                GHS {plan.price}
                                                <span className="text-xs text-brand-dark/40 font-normal ml-1">/{plan.duration}</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-1 mt-2">
                                            {plan.benefits.map((b, i) => (
                                                <li key={i} className="text-sm text-brand-dark/60 flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${plan.color}`} />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </button>
                        )
                    })}

                    {/* Pay Button */}
                    <button
                        onClick={handlePromote}
                        disabled={!selectedPlan || loading}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                {selectedPlan
                                    ? `Pay GHS ${promotionPlans.find((p) => p.id === selectedPlan)?.price} & Promote`
                                    : 'Select a Plan'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-brand-dark/40 flex items-center justify-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Secure payment via Paystack
                    </p>
                </div>
            </div>
        </div>
    )
}
