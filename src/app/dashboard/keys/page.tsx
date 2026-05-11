"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiKeys, generateApiKey, deleteApiKey } from '@/services/tracking';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ApiKeysPage() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      fetchKeys();
    }
  }, [isLoaded, user]);

  const fetchKeys = async () => {
    try {
      const data = await getApiKeys(user?.id || '');
      setKeys(data);
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const expiryDate = newExpiry ? new Date(newExpiry).toISOString() : null;
      await generateApiKey(user.id, newName || 'New API Key', expiryDate);
      await fetchKeys();
      setShowForm(false);
      setNewName('');
      setNewExpiry('');
    } catch (error) {
      alert("Failed to create key. Ensure your Appwrite collection is configured.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this key? It will immediately stop working.")) return;
    try {
      await deleteApiKey(id);
      await fetchKeys();
    } catch (error) {
      alert("Failed to delete key.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Initializing Console...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 font-body flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity">Frenix Labs</Link>
          <nav className="hidden md:flex gap-4 text-sm font-medium text-white/40 relative">
            {[
              { name: 'Overview', href: '/dashboard' },
              { name: 'API Keys', href: '/dashboard/keys' },
              { name: 'Billing', href: '/dashboard/billing' },
              { name: 'Settings', href: '/dashboard/settings' },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "relative px-3 py-1 transition-colors hover:text-white",
                  pathname === link.href ? "text-white" : ""
                )}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
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
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-heading font-medium tracking-tight mb-2">API Keys</h1>
            <p className="text-white/40 text-sm">Use these keys to authenticate your requests to the Uttam Vara API.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                <Plus size={16} />
                Create new key
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-2xl sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading font-medium tracking-tight">Create API Key</DialogTitle>
                <DialogDescription className="text-white/40 text-sm">
                  Generate a new secret key to access the Uttam Vara API.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Key Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Production Environment"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 transition-colors outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 transition-colors outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
              <DialogFooter>
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-8 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Generating...' : 'Generate Key'}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-6 w-64 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-lg bg-white/5" />
                    <Skeleton className="size-8 rounded-lg bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="py-24 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Key size={24} className="text-white/20" />
              </div>
              <h3 className="text-lg font-medium mb-1">No API keys yet</h3>
              <p className="text-white/40 text-sm max-w-xs">Create your first key to start integrating Uttam Vara into your applications.</p>
            </div>
          ) : (
            keys.map((key, idx) => (
              <motion.div 
                key={key.$id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm">{key.name || 'Default Key'}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-white/60 bg-black/30 px-2 py-1 rounded">
                      {visibleKeys[key.$id] ? key.key : `${key.key.substring(0, 10)}****************`}
                    </code>
                    <button onClick={() => toggleVisibility(key.$id)} className="text-white/20 hover:text-white transition-colors">
                      {visibleKeys[key.$id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-[10px] text-white/20 uppercase tracking-tight">Created on {new Date(key.createdAt).toLocaleDateString()}</div>
                    {key.expiresAt && (
                      <div className={`text-[10px] uppercase tracking-tight font-bold ${new Date(key.expiresAt) < new Date() ? 'text-red-500' : 'text-white/40'}`}>
                        {new Date(key.expiresAt) < new Date() ? 'Expired' : `Expires on ${new Date(key.expiresAt).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyToClipboard(key.key, key.$id)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                  >
                    {copiedId === key.$id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(key.$id)}
                    className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-white/60"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-12 bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
           <h3 className="text-lg font-heading font-medium mb-4">Security Best Practices</h3>
           <ul className="space-y-3 text-sm text-white/40 list-disc pl-5">
             <li>Never share your API keys or expose them in client-side code.</li>
             <li>Rotate your keys regularly if you suspect they have been compromised.</li>
             <li>Use separate keys for development and production environments.</li>
             <li>Your keys are prefixed with <code className="text-white/60">sk-utm-</code> for easier identification.</li>
           </ul>
        </div>
      </main>

      <footer className="py-8 text-white/10 text-[10px] text-center uppercase tracking-widest border-t border-white/5">
        Uttam Vara Console • Key Management
      </footer>
    </div>
  );
}
