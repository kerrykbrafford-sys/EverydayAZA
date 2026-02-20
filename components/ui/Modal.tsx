'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (open) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [open, onClose])

    if (!open) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm animate-fadeIn" />

            {/* Content */}
            <div
                className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-elevated animate-slideUp`}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/10">
                        <h3 className="font-display text-xl text-brand-dark">{title}</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
                        >
                            <X className="w-5 h-5 text-brand-dark/60" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className={title ? 'p-6' : 'p-6'}>
                    {!title && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-brand-dark/60" />
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}
