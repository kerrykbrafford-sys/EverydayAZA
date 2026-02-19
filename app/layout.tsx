import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'RecWorld - Global Marketplace & Import Sourcing',
  description: 'Buy and sell locally, request products internationally, and track your imports with RecWorld.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
