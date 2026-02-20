'use client'

interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    onClick?: () => void
}

export default function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
    onClick,
}: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }

    return (
        <div
            className={`bg-white rounded-2xl shadow-card ${paddings[padding]} ${hover
                    ? 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                    : ''
                } ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
