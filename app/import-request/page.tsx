export const dynamic = 'force-dynamic'

import ImportRequestForm from '@/components/ImportRequestForm'

export default function ImportRequestPage() {
  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-brand-gold font-medium mb-4">
            <span className="w-8 h-px bg-brand-gold" />
            Import Request
            <span className="w-8 h-px bg-brand-gold" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-dark mb-4">
            Request an Import
          </h1>
          <p className="text-brand-dark/70">
            Tell us what product you're looking for and we'll source it for you
            from international markets.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <ImportRequestForm />
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-card text-center">
            <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-display text-brand-gold">24h</span>
            </div>
            <h3 className="font-display text-lg text-brand-dark mb-2">
              Quick Response
            </h3>
            <p className="text-sm text-brand-dark/60">
              Get your quote within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card text-center">
            <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-display text-brand-gold">50+</span>
            </div>
            <h3 className="font-display text-lg text-brand-dark mb-2">
              Countries
            </h3>
            <p className="text-sm text-brand-dark/60">
              Source from suppliers worldwide
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card text-center">
            <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-display text-brand-gold">100%</span>
            </div>
            <h3 className="font-display text-lg text-brand-dark mb-2">
              Secure
            </h3>
            <p className="text-sm text-brand-dark/60">
              Escrow protection for all orders
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
