'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types'

interface ChatProps {
  conversationId: string
  currentUserId: string
}

export default function Chat({ conversationId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                msg.sender_id === currentUserId
                  ? 'bg-brand-dark text-white rounded-br-none'
                  : 'bg-brand-light text-brand-dark rounded-bl-none'
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-brand-dark/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-brand-light rounded-full border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
          <button
            onClick={sendMessage}
            className="w-12 h-12 bg-brand-dark text-white rounded-full flex items-center justify-center hover:bg-brand-dark/90 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
