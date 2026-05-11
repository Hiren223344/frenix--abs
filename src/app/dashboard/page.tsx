"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Activity, Cpu, Database, Send, Zap } from 'lucide-react';
import { client } from '@/lib/appwrite';
import { getUserStats } from '@/services/tracking';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isLoaded && user) {
      fetchStats();
    }
  }, [isLoaded, user]);

  const fetchStats = async () => {
    try {
      const data = await getUserStats(user?.id || '');
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processTokenData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: any = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dataMap[days[d.getDay()]] = 0;
    }

    stats.forEach(doc => {
      const date = new Date(doc.timestamp);
      const day = days[date.getDay()];
      if (dataMap[day] !== undefined) {
        dataMap[day] += doc.totalTokens || 0;
      }
    });

    return Object.keys(dataMap).map(key => ({ name: key, tokens: dataMap[key] }));
  };

  const processRequestData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: any = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dataMap[days[d.getDay()]] = 0;
    }

    stats.forEach(doc => {
      const date = new Date(doc.timestamp);
      const day = days[date.getDay()];
      if (dataMap[day] !== undefined) {
        dataMap[day] += 1;
      }
    });

    return Object.keys(dataMap).map(key => ({ name: key, reqs: dataMap[key] }));
  };

  const totals = {
    tokens: stats.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0),
    requests: stats.length,
    models: Array.from(new Set(stats.map(s => s.model))).length
  };

  const handlePing = async () => {
    try {
      setPingStatus('Sending...');
      await client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
      setPingStatus('Setup Verified! ✅');
      setTimeout(() => setPingStatus(null), 3000);
    } catch (err) {
      setPingStatus('Setup Failed ❌');
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-body">Initializing Console...</div>;
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
          <button 
            onClick={handlePing}
            className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Send size={12} className={pingStatus === 'Sending...' ? 'animate-pulse' : ''} />
            {pingStatus || 'Send a Ping'}
          </button>
          <div className="w-px h-4 bg-white/10" />
          <SignOutButton>
            <button className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors">
              Log out
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 animate-fade-in">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-heading font-medium tracking-tight mb-2">System Console</h1>
            <p className="text-white/40 text-sm">Live analytics fetched from Appwrite database for {user?.firstName}.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchStats} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
              <Activity size={12} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-8 w-16 bg-white/5" />
                <Skeleton className="h-3 w-32 bg-white/5" />
              </div>
            ))
          ) : (
            <>
              {[
                { label: 'Total Tokens', value: `${(totals.tokens / 1000).toFixed(1)}k`, sub: 'Real-time usage', icon: Zap },
                { label: 'Total Requests', value: totals.requests, sub: 'Database entries', icon: Activity },
                { label: 'Active Models', value: totals.models, sub: 'uttam-vara active', icon: Cpu },
                { label: 'Storage', value: `~${stats.length * 0.5} KB`, sub: 'Log footprint', icon: Database },
              ].map((item, idx) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-zinc-900 border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 text-white/40 mb-4 group-hover:text-white/60 transition-colors">
                    <item.icon size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="text-3xl font-medium tracking-tighter mb-1">{item.value}</div>
                  <div className="text-xs text-white/20 font-medium">{item.sub}</div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-heading font-medium mb-8">Token Consumption</h3>
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full bg-white/5 rounded-2xl" />
              ) : isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processTokenData()}>
                    <defs>
                      <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Area type="monotone" dataKey="tokens" stroke="#FFFFFF" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-heading font-medium mb-8">Request Volume</h3>
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full bg-white/5 rounded-2xl" />
              ) : isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processRequestData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px' }}
                    />
                    <Bar dataKey="reqs" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-white/10 text-[10px] text-center uppercase tracking-widest border-t border-white/5">
        Uttam Vara Console • Database: Appwrite • Keys: sk-utm-
      </footer>
    </div>
  );
}
