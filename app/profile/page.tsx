'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User, Package, Globe, Settings, LogOut, Camera,
    MapPin, Phone, Mail, Edit3, Check, X, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Tab = 'listings' | 'imports' | 'settings'

interface Profile {
    id: string
    full_name: string
    email: string
    phone?: string
    location?: string
    avatar_url?: string
    role: string
    created_at: string
}

interface Listing {
    id: string
    title: string
    price: number
    status: string
    created_at: string
    images: string[]
}

interface ImportOrder {
    id: string
    title: string
    status: string
    created_at: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('listings')
    const [profile, setProfile] = useState<Profile | null>(null)
    const [listings, setListings] = useState<Listing[]>([])
    const [imports, setImports] = useState<ImportOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editLocation, setEditLocation] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const [profileRes, listingsRes, importsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('listings').select('id,title,price,status,created_at,images').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
            supabase.from('import_requests').select('id,title,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        ])

        if (profileRes.data) {
            setProfile(profileRes.data)
            setEditName(profileRes.data.full_name || '')
            setEditPhone(profileRes.data.phone || '')
            setEditLocation(profileRes.data.location || '')
        }
        setListings(listingsRes.data || [])
        setImports(importsRes.data || [])
        setLoading(false)
    }

    const saveProfile = async () => {
        if (!profile) return
        setSaving(true)
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editName, phone: editPhone, location: editLocation })
            .eq('id', profile.id)

        if (error) { toast.error('Failed to save'); }
        else {
            toast.success('Profile updated!')
            setProfile(prev => prev ? { ...prev, full_name: editName, phone: editPhone, location: editLocation } : prev)
            setEditing(false)
        }
        setSaving(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-brand-light pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin" />
            </main>
        )
    }

    const TABS = [
        { id: 'listings', label: 'My Listings', icon: Package, count: listings.length },
        { id: 'imports', label: 'Import Orders', icon: Globe, count: imports.length },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const

    return (
        <main className="min-h-screen bg-brand-light pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-card p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-brand-dark flex items-center justify-center text-white text-3xl font-display">
                                {profile?.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center cursor-pointer hover:bg-brand-light transition-colors">
                                <Camera className="w-4 h-4 text-brand-dark/60" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {editing ? (
                                <div className="space-y-3">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Full Name"
                                        className="block w-full px-4 py-2 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 font-display text-xl"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            value={editPhone}
                                            onChange={e => setEditPhone(e.target.value)}
                                            placeholder="Phone number"
                                            className="flex-1 px-4 py-2 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm"
                                        />
                                        <input
                                            value={editLocation}
                                            onChange={e => setEditLocation(e.target.value)}
                                            placeholder="Location (e.g. Accra, Ghana)"
                                            className="flex-1 px-4 py-2 bg-brand-light rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="font-display text-2xl text-brand-dark">{profile?.full_name || 'Unknown User'}</h1>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-brand-dark/50">
                                        {profile?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{profile.email}</span>}
                                        {profile?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{profile.phone}</span>}
                                        {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
                                    </div>
                                    <p className="text-xs text-brand-dark/30 mt-1">
                                        Member since {new Date(profile?.created_at || '').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <button onClick={saveProfile} disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors disabled:opacity-50">
                                        <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditing(false)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-light text-brand-dark rounded-xl text-sm hover:bg-brand-dark/10 transition-colors">
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-light text-brand-dark rounded-xl text-sm hover:bg-brand-dark/10 transition-colors">
                                        <Edit3 className="w-4 h-4" /> Edit Profile
                                    </button>
                                    <button onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm hover:bg-red-100 transition-colors">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl shadow-card p-1.5 mb-6 w-fit">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as Tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
                ${tab === t.id ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-dark/60 hover:text-brand-dark hover:bg-brand-light'}`}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                            {'count' in t && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-brand-dark/10 text-brand-dark/60'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === 'listings' && (
                    <div className="space-y-3">
                        {listings.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                                <Package className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                                <p className="text-brand-dark/50 mb-4">You haven't posted any listings yet</p>
                                <Link href="/create-listing" className="px-6 py-3 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">
                                    Post First Listing
                                </Link>
                            </div>
                        ) : listings.map(l => (
                            <Link key={l.id} href={`/listing/${l.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-all group">
                                <div className="w-16 h-16 bg-brand-light rounded-xl overflow-hidden flex-shrink-0">
                                    {l.images?.[0]
                                        ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                                        : <Package className="w-8 h-8 text-brand-dark/20 m-auto mt-4" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-brand-dark group-hover:text-brand-gold transition-colors">{l.title}</h3>
                                    <p className="text-brand-gold font-display text-sm">GHS {l.price.toLocaleString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${l.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-light text-brand-dark/50'}`}>
                                    {l.status}
                                </span>
                                <ChevronRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-dark transition-colors" />
                            </Link>
                        ))}
                    </div>
                )}

                {tab === 'imports' && (
                    <div className="space-y-3">
                        {imports.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                                <Globe className="w-12 h-12 text-brand-dark/20 mx-auto mb-3" />
                                <p className="text-brand-dark/50 mb-4">No import orders yet</p>
                                <Link href="/import-request" className="px-6 py-3 bg-brand-dark text-white rounded-xl text-sm hover:bg-brand-dark/90 transition-colors">
                                    Start an Import
                                </Link>
                            </div>
                        ) : imports.map(i => (
                            <Link key={i.id} href={`/dashboard/import-orders`}
                                className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-all group">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-brand-dark group-hover:text-brand-gold transition-colors">{i.title}</h3>
                                    <p className="text-xs text-brand-dark/40">{new Date(i.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${i.status === 'quoted' ? 'bg-blue-50 text-blue-600' :
                                        i.status === 'completed' ? 'bg-green-50 text-green-600' :
                                            'bg-brand-light text-brand-dark/50'
                                    }`}>{i.status?.replace('_', ' ')}</span>
                                <ChevronRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-dark transition-colors" />
                            </Link>
                        ))}
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="bg-white rounded-2xl shadow-card p-8">
                        <h2 className="font-display text-xl text-brand-dark mb-6">Account Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4 border-b border-brand-light">
                                <div>
                                    <p className="font-medium text-brand-dark">Email Address</p>
                                    <p className="text-sm text-brand-dark/50">{profile?.email}</p>
                                </div>
                                <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full">Verified</span>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-brand-light">
                                <div>
                                    <p className="font-medium text-brand-dark">Account Role</p>
                                    <p className="text-sm text-brand-dark/50 capitalize">{profile?.role || 'user'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-medium text-red-500">Delete Account</p>
                                    <p className="text-sm text-brand-dark/40">Permanently remove your account and all data</p>
                                </div>
                                <button className="px-4 py-2 border-2 border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
