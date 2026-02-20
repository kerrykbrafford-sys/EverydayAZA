'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Ship, ArrowRight, Check, Loader2, Globe, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ImportRequestForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [destinationCountry, setDestinationCountry] = useState('Ghana')
  const [preferredShipping, setPreferredShipping] = useState<'air' | 'sea' | 'both'>('air')
  const [loading, setLoading] = useState(false)
  const [agentRunning, setAgentRunning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newRequestId, setNewRequestId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/import-request')
        return
      }

      // Insert import request
      const { data: newRequest, error } = await supabase
        .from('import_requests')
        .insert({
          title,
          product_name: title,
          description,
          quantity,
          destination_country: destinationCountry,
          preferred_shipping: preferredShipping,
          shipping_method: preferredShipping === 'both' ? 'air' : preferredShipping,
          user_id: user.id,
          status: 'pending',
          ai_processed: false,
        })
        .select()
        .single()

      if (error || !newRequest) {
        setError(error?.message || 'Error submitting request. Please try again.')
        setLoading(false)
        return
      }

      setNewRequestId(newRequest.id)
      setLoading(false)
      setAgentRunning(true)

      // Trigger AI Agent via Edge Function
      try {
        const { error: agentError } = await supabase.functions.invoke('import-agent', {
          body: { request_id: newRequest.id },
        })
        if (agentError) console.error('Agent error:', agentError)
      } catch (agentErr) {
        console.error('Agent invocation failed:', agentErr)
      }

      setAgentRunning(false)
      setSubmitted(true)
    } catch (error: any) {
      console.error('Error submitting request:', error)
      setError(error?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setAgentRunning(false)
    }
  }

  // Success screen: AI found quotes!
  if (submitted && newRequestId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-24 h-24 bg-brand-gold/15 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Sparkles className="w-10 h-10 text-brand-gold" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <h2 className="font-display text-3xl text-brand-dark mb-3">
          AI Agent Found Suppliers! ✦
        </h2>
        <p className="text-brand-dark/60 mb-8 max-w-md mx-auto">
          Our sourcing agent scanned global markets and found the best quotes for your product. Compare and select now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(`/import/quotes/${newRequestId}`)}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-dark text-white rounded-full font-medium hover:bg-brand-dark/90 transition-colors"
          >
            View AI Quotes
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/dashboard/import-orders')}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-brand-dark/15 text-brand-dark rounded-full font-medium hover:bg-brand-light transition-colors"
          >
            My Orders
          </button>
        </div>
      </div>
    )
  }

  // Agent running screen
  if (agentRunning) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-12 h-12 text-brand-gold animate-pulse" />
        </div>
        <h2 className="font-display text-2xl text-brand-dark mb-3">
          AI Agent is Sourcing...
        </h2>
        <p className="text-brand-dark/60 mb-6">
          Scanning global markets — China, Turkey, UAE, India — to find the best suppliers for your product.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-brand-dark/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          This takes about 15–30 seconds...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* AI badge */}
      <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-sm">
        <Sparkles className="w-4 h-4" />
        <span>Our <strong>AI Sourcing Agent</strong> will automatically find suppliers and generate quotes after submission.</span>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Product Title */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-2">
          Product Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. iPhone 15 Pro Max, Nike Air Force 1, Industrial Sewing Machine"
          required
          className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-2">
          Description & Specifications
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details: color, size, model number, quality grade, etc."
          rows={4}
          className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none"
        />
      </div>

      {/* Quantity + Country row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Destination Country
          </label>
          <input
            type="text"
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
        </div>
      </div>

      {/* Shipping Method */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-4">
          Preferred Shipping
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'air', label: 'Air Freight', sub: '4–12 days', icon: Plane },
            { value: 'sea', label: 'Sea Freight', sub: '28–45 days', icon: Ship },
            { value: 'both', label: 'Compare Both', sub: 'See all options', icon: Globe },
          ].map(({ value, label, sub, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreferredShipping(value as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${preferredShipping === value
                ? 'border-brand-dark bg-brand-dark/5'
                : 'border-brand-dark/10 hover:border-brand-dark/30'
                }`}
            >
              <Icon className="w-6 h-6 text-brand-dark mb-2" />
              <h4 className="font-medium text-sm text-brand-dark">{label}</h4>
              <p className="text-xs text-brand-dark/60">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || agentRunning}
        className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Get AI Quotes</>
        )}
      </button>
    </form>
  )
}
