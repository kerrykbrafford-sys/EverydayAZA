'use client'

import { useState } from 'react'
import { Plane, Ship, ArrowRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ImportRequestForm() {
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea'>('air')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Please login first')
        return
      }

      await supabase.from('import_requests').insert({
        product_name: productName,
        description: description,
        shipping_method: shippingMethod,
        user_id: user.id,
        status: 'pending',
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Error submitting request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-brand-gold" />
        </div>
        <h2 className="font-display text-3xl text-brand-dark mb-4">
          Request Submitted!
        </h2>
        <p className="text-brand-dark/70 mb-8">
          We'll get back to you with a quote within 24 hours.
        </p>
        <a
          href="/dashboard/import-orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
        >
          View Your Requests
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-2">
          Product Name
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="What product are you looking for?"
          required
          className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about the product (quantity, specifications, etc.)"
          rows={4}
          required
          className="w-full px-4 py-3 bg-white rounded-xl border border-brand-dark/10 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none"
        />
      </div>

      {/* Shipping Method */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-4">
          Shipping Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setShippingMethod('air')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              shippingMethod === 'air'
                ? 'border-brand-dark bg-brand-dark/5'
                : 'border-brand-dark/10 hover:border-brand-dark/30'
            }`}
          >
            <Plane className="w-8 h-8 text-brand-dark mb-3" />
            <h4 className="font-display text-lg text-brand-dark mb-1">
              Air Freight
            </h4>
            <p className="text-sm text-brand-dark/60">7-10 days delivery</p>
          </button>

          <button
            type="button"
            onClick={() => setShippingMethod('sea')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              shippingMethod === 'sea'
                ? 'border-brand-dark bg-brand-dark/5'
                : 'border-brand-dark/10 hover:border-brand-dark/30'
            }`}
          >
            <Ship className="w-8 h-8 text-brand-dark mb-3" />
            <h4 className="font-display text-lg text-brand-dark mb-1">
              Sea Freight
            </h4>
            <p className="text-sm text-brand-dark/60">35-40 days delivery</p>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          'Submitting...'
        ) : (
          <>
            Submit Request
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}
