'use client'

import { useState } from 'react'
import { CreditCard, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PayButtonProps {
    amount: number
    currency?: string
    type: 'import_order' | 'promotion'
    relatedId?: string
    label?: string
    onSuccess?: () => void
    className?: string
    variant?: 'primary' | 'gold' | 'outline'
    size?: 'sm' | 'md' | 'lg'
}

export default function PayButton({
    amount,
    currency = 'GHS',
    type,
    relatedId,
    label,
    onSuccess,
    className = '',
    variant = 'primary',
    size = 'md',
}: PayButtonProps) {
    const [loading, setLoading] = useState(false)

    const variantClasses = {
        primary: 'bg-brand-dark text-white hover:bg-brand-dark/90',
        gold: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/25',
        outline: 'border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white',
    }

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-3',
    }

    const handlePay = async () => {
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                window.location.href = '/login'
                return
            }

            // Get user email
            const email = user.email

            const res = await fetch('/api/payments/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    amount,
                    currency,
                    userId: user.id,
                    type,
                    relatedId,
                }),
            })

            const data = await res.json()

            if (data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                alert(data.error || 'Payment initialization failed')
            }
        } catch (error) {
            console.error('Payment error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const displayAmount = new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currency,
    }).format(amount)

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    {label || `Pay ${displayAmount}`}
                    <ArrowRight className="w-4 h-4" />
                </>
            )}
        </button>
    )
}
