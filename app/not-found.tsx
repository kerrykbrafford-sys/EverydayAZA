export const dynamic = 'force-dynamic'

export default function NotFound() {
    return (
        <main className="min-h-screen bg-brand-light flex items-center justify-center">
            <div className="text-center">
                <h1 className="font-display text-6xl text-brand-dark mb-4">404</h1>
                <p className="text-brand-dark/60 text-lg mb-8">Page not found</p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-dark/90 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </main>
    )
}
