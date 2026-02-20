'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import ConversationList from '@/components/messaging/ConversationList'
import ChatWindow from '@/components/messaging/ChatWindow'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  return (
    <main className="min-h-screen bg-brand-light pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-card hover:shadow-card-hover transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-brand-dark" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-brand-dark">Messages</h1>
            <p className="text-sm text-brand-dark/40">Chat with buyers and sellers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Conversations */}
          <div className="lg:col-span-1">
            <ConversationList
              selectedId={selectedConversation?.id}
              onSelect={(conv) => setSelectedConversation(conv)}
            />
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                conversationName={selectedConversation.name}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-card h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-9 h-9 text-brand-dark/20" />
                </div>
                <h3 className="font-display text-lg text-brand-dark mb-1">Select a Conversation</h3>
                <p className="text-sm text-brand-dark/40 max-w-xs">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
