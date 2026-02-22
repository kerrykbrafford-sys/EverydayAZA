'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Bell, Trash2, Shield, Loader2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
        if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) toast.error(error.message)
        else { toast.success('Password updated successfully!'); setNewPassword(''); setConfirmPassword('') }
        setLoading(false)
    }

    const deleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
        setDeleting(true)
        toast.error('Please contact support to delete your account.')
        setDeleting(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="font-display text-2xl text-brand-dark">Settings</h1>
                <p className="text-sm text-brand-dark/50 mt-0.5">Manage your account security and preferences</p>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-brand-dark/8 p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-brand-dark/5 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-brand-dark" />
                    </div>
                    <div>
                        <h2 className="font-display text-lg text-brand-dark">Change Password</h2>
                        <p className="text-sm text-brand-dark/40">Update your account password</p>
                    </div>
                </div>
                <form onSubmit={changePassword} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1.5 block">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 bg-brand-light rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 bg-brand-light rounded-xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-medium hover:bg-brand-dark/90 transition-colors disabled:opacity-50">
                        <Check className="w-4 h-4" />
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-2xl border border-brand-dark/8 p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-brand-dark/5 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-brand-dark" />
                    </div>
                    <div>
                        <h2 className="font-display text-lg text-brand-dark">Account Security</h2>
                        <p className="text-sm text-brand-dark/40">Your account protection settings</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-brand-dark/5">
                        <div>
                            <p className="text-sm font-medium text-brand-dark">Two-Factor Authentication</p>
                            <p className="text-xs text-brand-dark/40">Add an extra layer of security</p>
                        </div>
                        <span className="text-xs text-brand-dark/40 bg-brand-light px-3 py-1 rounded-full">Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-medium text-brand-dark">Login Sessions</p>
                            <p className="text-xs text-brand-dark/40">Manage active login sessions</p>
                        </div>
                        <button
                            onClick={async () => { await supabase.auth.signOut({ scope: 'global' }); router.push('/login') }}
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                            Sign out all devices
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="font-display text-lg text-red-500">Delete Account</h2>
                        <p className="text-sm text-brand-dark/40">Permanently remove your account and all data</p>
                    </div>
                </div>
                <p className="text-sm text-brand-dark/60 mb-4">
                    This action cannot be undone. All your listings, messages, orders and data will be permanently deleted.
                </p>
                <div className="flex items-center gap-3">
                    <input
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="flex-1 px-4 py-2.5 border border-red-200 rounded-xl text-sm text-brand-dark focus:outline-none focus:border-red-400"
                    />
                    <button onClick={deleteAccount} disabled={deleting}
                        className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}
