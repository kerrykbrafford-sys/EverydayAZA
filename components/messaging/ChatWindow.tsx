'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ChatWindowProps {
    conversationId: string
    conversationName: string
}

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
}

export default function ChatWindow({ conversationId, conversationName }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState('')
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadUser()
        loadMessages()

        // Realtime subscription
        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)
    }

    const loadMessages = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (data) setMessages(data)
        setLoading(false)
    }

    const sendMessage = async () => {
        if (!text.trim() || !currentUserId || sending) return

        setSending(true)
        const content = text
        setText('')

        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content,
        })

        setSending(false)
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="bg-white rounded-2xl shadow-card h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-brand-dark/8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-dark to-brand-dark/70 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div>
                    <div className="font-medium text-sm text-brand-dark">{conversationName}</div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-xs text-brand-dark/40">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-brand-dark/5 rounded-full flex items-center justify-center mb-3">
                            <Send className="w-7 h-7 text-brand-dark/20" />
                        </div>
                        <p className="text-sm text-brand-dark/40 mb-1">No messages yet</p>
                        <p className="text-xs text-brand-dark/25">Send a message to start the conversation</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isMine = msg.sender_id === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine
                                                ? 'bg-brand-dark text-white rounded-br-md'
                                                : 'bg-brand-light text-brand-dark rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <p
                                            className={`text-[10px] mt-1 ${isMine ? 'text-white/50' : 'text-brand-dark/35'
                                                }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-brand-dark/8">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-brand-light/70 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/15"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!text.trim() || sending}
                        className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center hover:bg-brand-dark/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
