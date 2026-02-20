'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Users, Shield, Ban, Eye, Search } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setUsers(data)
        setLoading(false)
    }

    const toggleBan = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'banned' ? 'user' : 'banned'
        await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        )
    }

    const makeAdmin = async (userId: string) => {
        await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)

        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u))
        )
    }

    const filtered = users.filter(
        (u) =>
            (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const roleColors: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-700',
        user: 'bg-green-100 text-green-700',
        banned: 'bg-red-100 text-red-700',
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />

            <main className="flex-1 bg-brand-light p-8">
                <div className="max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-display text-3xl text-brand-dark">Users</h1>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 shadow-card"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {users.length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Total Users</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {users.filter((u) => u.role === 'admin').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Admins</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-card">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                                <Ban className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="font-display text-2xl text-brand-dark">
                                {users.filter((u) => u.role === 'banned').length}
                            </div>
                            <div className="text-sm text-brand-dark/60">Banned</div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-brand-dark/40">
                                Loading users...
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-brand-light">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            User
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Phone
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Role
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Joined
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-brand-dark/60">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-t border-brand-dark/5"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center">
                                                        <span className="text-white font-medium">
                                                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-brand-dark font-medium">
                                                            {user.full_name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-brand-dark/40">
                                                            {user.id.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-brand-dark/60">
                                                {user.phone || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${roleColors[user.role] || roleColors.user
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-brand-dark/60">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => makeAdmin(user.id)}
                                                            className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center hover:bg-purple-100 transition-colors"
                                                            title="Make Admin"
                                                        >
                                                            <Shield className="w-4 h-4 text-purple-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleBan(user.id, user.role)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${user.role === 'banned'
                                                                ? 'bg-green-50 hover:bg-green-100'
                                                                : 'bg-red-50 hover:bg-red-100'
                                                            }`}
                                                        title={
                                                            user.role === 'banned' ? 'Unban User' : 'Ban User'
                                                        }
                                                    >
                                                        <Ban
                                                            className={`w-4 h-4 ${user.role === 'banned'
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="p-12 text-center text-brand-dark/40">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
