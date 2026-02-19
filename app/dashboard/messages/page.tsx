'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, User } from 'lucide-react'
import Chat from '@/components/Chat'

const mockConversations = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Is this item still available?',
    time: '2 min ago',
    unread: 2,
  },
  {
    id: '2',
    name: 'Sarah Smith',
    lastMessage: 'Thanks for the quick response!',
    time: '1 hour ago',
    unread: 0,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    lastMessage: 'Can you ship to Ghana?',
    time: '3 hours ago',
    unread: 1,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    mockConversations[0]
  )

  return (
    <main className="min-h-screen bg-brand-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-brand-dark/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-dark" />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-brand-dark">Messages</h1>
            <p className="text-brand-dark/60">
              Chat with buyers and sellers
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-brand-dark/10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-12 pr-4 py-3 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto h-[calc(600px-85px)]">
              {mockConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-brand-light transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-brand-light' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-brand-dark">
                        {conv.name}
                      </span>
                      <span className="text-xs text-brand-dark/40">
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-brand-dark/60 truncate max-w-[150px]">
                        {conv.lastMessage}
                      </span>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center text-xs text-brand-dark font-medium">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="h-full">
                {/* Chat Header */}
                <div className="bg-white rounded-t-2xl shadow-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-brand-dark">
                      {selectedConversation.name}
                    </div>
                    <div className="text-sm text-green-600">Online</div>
                  </div>
                </div>

                {/* Chat Component */}
                <Chat
                  conversationId={selectedConversation.id}
                  currentUserId="current-user"
                />
              </div>
            ) : (
              <div className="h-full bg-white rounded-2xl shadow-card flex items-center justify-center">
                <p className="text-brand-dark/40">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
