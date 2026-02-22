'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Camera, Mail, Phone, MapPin, Edit3, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function DashboardProfile() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ full_name: '', phone: '', location: '' })

    useEffect(() => { fetchProfile() }, [])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
            setProfile(data)
            setForm({ full_name: data.full_name || '', phone: data.phone || '', location: data.location || '' })
        }
        setLoading(false)
    }

    const save = async () => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
        if (error) toast.error('Failed to save changes')
        else {
            toast.success('Profile updated!')
            setProfile((p: any) => ({ ...p, ...form }))
            setEditing(false)
        }
        setSaving(false)
    }

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-dark/30" /></div>
    }

    const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="font-display text-2xl text-brand-dark">My Profile</h1>
                <p className="text-sm text-brand-dark/50 mt-0.5">Manage your personal information</p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-dark/8 overflow-hidden">
                {/* Avatar Header */}
                <div className="bg-gradient-to-br from-brand-dark to-brand-dark/80 px-8 pt-10 pb-16 relative">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-display border-2 border-white/30">
                                {profile?.avatar_url
                                    ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-2xl" />
                                    : initials}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                                <Camera className="w-3.5 h-3.5 text-brand-dark" />
                            </button>
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-white">{profile?.full_name || 'Your Name'}</h2>
                            <p className="text-white/60 text-sm mt-1 capitalize">{profile?.role || 'user'} account</p>
                            <p className="text-white/40 text-xs mt-0.5">
                                Member since {new Date(profile?.created_at || '').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-8 -mt-6 pb-8">
                    <div className="bg-white rounded-2xl border border-brand-dark/8 shadow-sm p-6 space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <User className="w-3.5 h-3.5" /> Full Name
                            </label>
                            {editing
                                ? <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-brand-light rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
                                : <p className="text-brand-dark font-medium">{profile?.full_name || <span className="text-brand-dark/30">Not set</span>}</p>}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Mail className="w-3.5 h-3.5" /> Email Address
                            </label>
                            <div className="flex items-center gap-2">
                                <p className="text-brand-dark">{profile?.email}</p>
                                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Verified</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <Phone className="w-3.5 h-3.5" /> Phone Number
                            </label>
                            {editing
                                ? <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+233 XX XXX XXXX"
                                    className="w-full px-4 py-3 bg-brand-light rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
                                : <p className="text-brand-dark">{profile?.phone || <span className="text-brand-dark/30">Not set</span>}</p>}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="text-xs font-medium text-brand-dark/40 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <MapPin className="w-3.5 h-3.5" /> Location
                            </label>
                            {editing
                                ? <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    placeholder="e.g. Accra, Ghana"
                                    className="w-full px-4 py-3 bg-brand-light rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
                                : <p className="text-brand-dark">{profile?.location || <span className="text-brand-dark/30">Not set</span>}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            {editing ? (
                                <>
                                    <button onClick={save} disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50">
                                        <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button onClick={() => setEditing(false)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-light text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-dark/10 transition-colors">
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-light text-brand-dark rounded-xl text-sm font-medium hover:bg-brand-dark/10 transition-colors">
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
