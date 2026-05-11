"use client"

import React from 'react';
import Link from 'next/link';
import { useUser, SignOutButton, UserProfile } from '@clerk/nextjs';
import { Settings as SettingsIcon, Shield, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Settings...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 font-body flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity">Frenix Labs</Link>
          <nav className="hidden md:flex gap-4 text-sm font-medium text-white/40">
            <Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/dashboard/keys" className="hover:text-white transition-colors">API Keys</Link>
            <Link href="/dashboard/billing" className="hover:text-white transition-colors">Billing</Link>
            <Link href="/dashboard/settings" className="text-white underline decoration-white/20 underline-offset-4">Settings</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <SignOutButton>
            <button className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors">
              Log out
            </button>
          </SignOutButton>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-medium tracking-tight mb-2">Settings</h1>
          <p className="text-white/40 text-sm">Manage your account preferences and security settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Nav */}
          <aside className="col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium">
              <User size={16} />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white/40 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <Shield size={16} />
              Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white/40 hover:text-white rounded-lg text-sm font-medium transition-colors">
              <Bell size={16} />
              Notifications
            </button>
          </aside>

          {/* Content Area */}
          <div className="col-span-1 lg:col-span-3 space-y-12">
            <section>
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <User size={18} className="text-white/40" />
                Account Profile
              </h2>
              <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 overflow-hidden">
                <UserProfile routing="hash" />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Shield size={18} className="text-white/40" />
                Data & Privacy
              </h2>
              <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-medium mb-1">Export Data</h4>
                    <p className="text-white/40 text-xs">Download all your activity logs and usage history.</p>
                  </div>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors">Export</button>
                </div>
                <div className="h-px bg-white/5 w-full mb-6" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-500 mb-1">Delete Account</h4>
                    <p className="text-white/40 text-xs">Permanently remove your account and all associated data.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition-colors">Delete</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-8 text-white/10 text-[10px] text-center uppercase tracking-widest border-t border-white/5">
        Uttam Vara Console • Account Settings
      </footer>
    </div>
  );
}
