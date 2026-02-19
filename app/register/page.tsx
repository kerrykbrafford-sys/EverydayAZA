'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-brand-light pt-20">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-brand-gold" />
            </div>
            <h1 className="font-display text-3xl text-brand-dark mb-4">
              Registration Successful!
            </h1>
            <p className="text-brand-dark/70 mb-8">
              Please check your email to verify your account.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-full hover:bg-brand-dark/90 transition-colors"
            >
              Go to Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-brand-dark mb-2">
              Create Account
            </h1>
            <p className="text-brand-dark/60">
              Join our global marketplace
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-dark/60">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-brand-dark font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
