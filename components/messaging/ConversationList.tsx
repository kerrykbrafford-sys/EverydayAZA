'use client'

import { useEffect, useState } from 'react'
import { Search, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Conversation {
    id: string
    name: string
    lastMessage: string
    time: string
    unread: number
    avatar?: string
}

interface ConversationListProps {
    selectedId?: string
    onSelect: (conversation: Conversation) => void
}

export default function ConversationList({ selectedId, onSelect }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        // Get user's conversation participations
        const { data: participations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id)

        if (!participations || participations.length === 0) {
            setLoading(false)
            return
        }

        const convIds = participations.map((p: any) => p.conversation_id)

        // Get conversations with latest messages
        const { data: convs } = await supabase
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('updated_at', { ascending: false })

        if (convs) {
            const mapped: Conversation[] = convs.map((c: any) => ({
                id: c.id,
                name: c.title || 'Chat',
                lastMessage: c.last_message || 'No messages yet',
                time: c.updated_at ? formatTime(c.updated_at) : '',
                unread: 0,
            }))
            setConversations(mapped)
        }
        setLoading(false)
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    const filtered = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-brand-dark/8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/35" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-3 py-2.5 bg-brand-light/70 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse2">
                                <div className="w-11 h-11 rounded-full bg-brand-light" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-2/3 bg-brand-light rounded" />
                                    <div className="h-3 w-full bg-brand-light/80 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-14 h-14 bg-brand-dark/5 rounded-full flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-brand-dark/20" />
                        </div>
                        <p className="text-sm text-brand-dark/40">
                            {searchTerm ? 'No conversations found' : 'No conversations yet'}
                        </p>
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv)}
                            className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${selectedId === conv.id
                                    ? 'bg-brand-dark/5'
                                    : 'hover:bg-brand-light/50'
                                }`}
                        >
                            <div className="w-11 h-11 bg-gradient-to-br from-brand-dark to-brand-dark/70 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-brand-dark truncate">
                                        {conv.name}
                                    </span>
                                    <span className="text-[11px] text-brand-dark/35 flex-shrink-0 ml-2">
                                        {conv.time}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-xs text-brand-dark/50 truncate">
                                        {conv.lastMessage}
                                    </span>
                                    {conv.unread > 0 && (
                                        <span className="w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center text-[10px] text-brand-dark font-bold flex-shrink-0 ml-2">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
