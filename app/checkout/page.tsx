'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CreditCard, Shield, Truck, CheckCircle2, ChevronRight,
    Package, Phone, Mail, MapPin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CartItem {
    id: string
    title: string
    price: number
    quantity: number
    image?: string
    seller?: string
}

export default function CheckoutPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')

    // Form state
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('Ghana')

    // Mock cart — in production this comes from cart state/context
    const [cart] = useState<CartItem[]>([
        // Cart is populated from query params or cart state in production
    ])

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) { router.push('/login?redirect=/checkout'); return }
            setUser(data.user)
            setEmail(data.user.email || '')
        })
    }, [])

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = subtotal > 500 ? 0 : 25
    const total = subtotal + deliveryFee

    const handleProceedToPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName || !phone || !address || !city) {
            toast.error('Please fill all required fields')
            return
        }
        setStep('payment')
    }

    const handlePayWithPaystack = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/payments/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    amount: total, // API converts to pesewas
                    currency: 'GHS',
                    userId: user?.id,
                    type: 'checkout',
                    metadata: { full_name: fullName, phone, address, city, country },
                }),
            })
            const data = await res.json()
            if (data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                toast.error('Payment initialization failed')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-brand-light pt-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* Progress */}
                <div className="flex items-center gap-3 mb-8">
                    {(['details', 'payment', 'success'] as const).map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${step === s ? 'bg-brand-dark text-white' :
                                    (i < ['details', 'payment', 'success'].indexOf(step)) ? 'bg-green-500 text-white' :
                                        'bg-brand-dark/10 text-brand-dark/40'}`}
                            >
                                {i < ['details', 'payment', 'success'].indexOf(step) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-sm font-medium capitalize ${step === s ? 'text-brand-dark' : 'text-brand-dark/40'}`}>
                                {s}
                            </span>
                            {i < 2 && <ChevronRight className="w-4 h-4 text-brand-dark/20" />}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left — forms */}
                    <div className="lg:col-span-2 space-y-4">

                        {step === 'details' && (
                            <form onSubmit={handleProceedToPayment}>
                                <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
                                    <h2 className="font-display text-xl text-brand-dark flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> Delivery Details
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">Full Name *</label>
                                            <input value={fullName} onChange={e => setFullName(e.target.value)} required
                                                className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                                placeholder="John Mensah" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">Phone *</label>
                                            <input value={phone} onChange={e => setPhone(e.target.value)} required
                                                className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                                placeholder="+233 24 000 0000" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">Email</label>
                                        <input value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                            placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">Address *</label>
                                        <input value={address} onChange={e => setAddress(e.target.value)} required
                                            className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                            placeholder="House No. 5, Spintex Road" />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">City *</label>
                                            <input value={city} onChange={e => setCity(e.target.value)} required
                                                className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                                                placeholder="Accra" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-brand-dark/50 uppercase tracking-wide mb-1.5">Country</label>
                                            <select value={country} onChange={e => setCountry(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-brand-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20">
                                                <option>Ghana</option>
                                                <option>Nigeria</option>
                                                <option>Kenya</option>
                                                <option>South Africa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit"
                                        className="w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2">
                                        Continue to Payment <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'payment' && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="font-display text-xl text-brand-dark flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5" /> Payment
                                </h2>
                                <div className="flex items-center gap-3 p-4 bg-brand-light rounded-xl mb-4">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <p className="text-sm text-brand-dark/70">Secured by <strong>Paystack</strong> — your payment is 100% safe</p>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-brand-dark/60">
                                        <span>Subtotal</span><span>GHS {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-brand-dark/60">
                                        <span>Delivery</span>
                                        <span>{deliveryFee === 0 ? <span className="text-green-500">Free</span> : `GHS ${deliveryFee}`}</span>
                                    </div>
                                    <div className="flex justify-between font-display text-lg text-brand-dark pt-3 border-t border-brand-light">
                                        <span>Total</span><span>GHS {total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button onClick={handlePayWithPaystack} disabled={loading}
                                    className="w-full py-3 bg-brand-gold text-brand-dark font-semibold rounded-xl hover:bg-brand-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? 'Initializing...' : `Pay GHS ${total.toFixed(2)} with Paystack`}
                                </button>
                                <button onClick={() => setStep('details')} className="w-full mt-3 py-2 text-sm text-brand-dark/50 hover:text-brand-dark transition-colors">
                                    ← Back to Details
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right — Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
                            <h3 className="font-display text-lg text-brand-dark mb-4">Order Summary</h3>
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-10 h-10 text-brand-dark/20 mx-auto mb-2" />
                                    <p className="text-sm text-brand-dark/40">Your cart is empty</p>
                                    <Link href="/listings" className="text-sm text-brand-dark font-medium mt-2 block hover:underline">
                                        Browse listings
                                    </Link>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-brand-light last:border-0">
                                    <div className="w-12 h-12 bg-brand-light rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-brand-dark truncate">{item.title}</p>
                                        <p className="text-xs text-brand-dark/40">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-display text-brand-dark">GHS {(item.price * item.quantity).toFixed(0)}</p>
                                </div>
                            ))}
                            <div className="mt-4 pt-4 border-t border-brand-light flex justify-between font-display">
                                <span className="text-brand-dark">Total</span>
                                <span className="text-brand-dark">GHS {total.toFixed(2)}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-brand-dark/40">
                                <Truck className="w-4 h-4" />
                                {deliveryFee === 0 ? 'Free delivery on this order' : 'Standard delivery applies'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
