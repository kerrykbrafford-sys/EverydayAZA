export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import NextTopLoader from 'nextjs-toploader'

export const metadata: Metadata = {
  title: 'EverydayAZA - Marketplace & Global Sourcing',
  description: "Ghana's premier marketplace and global import sourcing platform. Buy, sell, and import from worldwide suppliers with air and sea shipping.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#D4AF37" showSpinner={false} />
        <Toaster position="top-right" />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
