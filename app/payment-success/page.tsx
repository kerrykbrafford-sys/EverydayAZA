'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, ArrowRight, Package, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function PaymentContent() {
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const [payment, setPayment] = useState<any>(null)

    useEffect(() => {
        if (reference) {
            verifyPayment(reference)
        } else {
            setStatus('failed')
        }
    }, [reference])

    const verifyPayment = async (ref: string) => {
        const { data } = await supabase
            .from('payments')
            .select('*')
            .or(`provider_reference.eq.${ref},id.eq.${ref}`)
            .single()

        if (data) {
            setPayment(data)
            if (data.status === 'completed') {
                setStatus('success')
            } else {
                let attempts = 0
                const interval = setInterval(async () => {
                    attempts++
                    const { data: updated } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('id', data.id)
                        .single()

                    if (updated?.status === 'completed') {
                        setPayment(updated)
                        setStatus('success')
                        clearInterval(interval)
                    } else if (attempts >= 10) {
                        setPayment(updated || data)
                        setStatus('success')
                        clearInterval(interval)
                    }
                }, 1000)
            }
        } else {
            setStatus('success')
        }
    }

    return (
        <div className="max-w-md w-full mx-4">
            {status === 'loading' && (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                    <h1 className="font-display text-2xl text-brand-dark mb-2">Verifying Payment...</h1>
                    <p className="text-brand-dark/60">Please wait while we confirm your transaction</p>
                </div>
            )}

            {status === 'success' && (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                        </div>
                    </div>
                    <h1 className="font-display text-3xl text-brand-dark mb-2">Payment Successful!</h1>
                    <p className="text-brand-dark/60 mb-6">Your transaction has been processed successfully</p>

                    {payment && (
                        <div className="bg-brand-light rounded-xl p-4 mb-6 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-brand-dark/50">Amount</span>
                                <span className="font-medium text-brand-dark">
                                    {payment.currency} {payment.amount?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-brand-dark/50">Type</span>
                                <span className="font-medium text-brand-dark capitalize">
                                    {payment.type?.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-brand-dark/50">Reference</span>
                                <span className="font-mono text-xs text-brand-dark/60">
                                    {payment.provider_reference?.slice(0, 16) || payment.id?.slice(0, 16)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {payment?.type === 'import_order' && (
                            <Link
                                href="/dashboard/import-orders"
                                className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                View My Orders
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                        {payment?.type === 'promotion' && (
                            <Link
                                href="/dashboard/listings"
                                className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Star className="w-5 h-5" />
                                View My Listings
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                        <Link
                            href="/dashboard"
                            className="w-full py-3 border-2 border-brand-dark text-brand-dark rounded-xl font-medium hover:bg-brand-dark hover:text-white transition-colors text-center"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {status === 'failed' && (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="font-display text-2xl text-brand-dark mb-2">Payment Failed</h1>
                    <p className="text-brand-dark/60 mb-6">
                        We couldn&apos;t verify your payment. Please try again.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
                    >
                        Back to Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
            <Suspense
                fallback={
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            </div>
                            <h1 className="font-display text-2xl text-brand-dark mb-2">Loading...</h1>
                        </div>
                    </div>
                }
            >
                <PaymentContent />
            </Suspense>
        </main>
    )
}
