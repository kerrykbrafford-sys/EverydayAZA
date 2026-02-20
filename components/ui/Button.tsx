'use client'

import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', size = 'md', loading, icon, className = '', disabled, ...props }, ref) => {
        const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

        const variants = {
            primary: 'bg-brand-dark text-white hover:bg-brand-dark/90 focus:ring-brand-dark shadow-sm hover:shadow-md',
            secondary: 'bg-brand-gold text-brand-dark hover:bg-brand-gold/90 focus:ring-brand-gold shadow-sm hover:shadow-md',
            outline: 'border-2 border-brand-dark/20 text-brand-dark hover:border-brand-dark hover:bg-brand-dark/5 focus:ring-brand-dark',
            ghost: 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5 focus:ring-brand-dark',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-8 py-3.5 text-base',
        }

        return (
            <button
                ref={ref}
                className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" />
                    </svg>
                ) : icon ? (
                    icon
                ) : null}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
export default Button
