'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] min-h-[500px]">
      <div className="mb-5">
        <h1 className="font-display text-2xl text-brand-dark">Messages</h1>
        <p className="text-sm text-brand-dark/50 mt-0.5">Chat with buyers and sellers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100%-70px)]">
        <div className="lg:col-span-1">
          <ConversationList
            selectedId={selectedConversation?.id}
            onSelect={(conv) => setSelectedConversation(conv)}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation.id}
              conversationName={selectedConversation.name}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-brand-dark/8 h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-9 h-9 text-brand-dark/20" />
              </div>
              <h3 className="font-display text-lg text-brand-dark mb-1">Select a Conversation</h3>
              <p className="text-sm text-brand-dark/40 max-w-xs">Choose a conversation from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
