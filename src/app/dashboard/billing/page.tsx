"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { CreditCard, Zap, Check, ArrowUpRight, BarChart3 } from 'lucide-react';
import { getUserStats, getUserCredits } from '@/services/tracking';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchStats();
    }
  }, [isLoaded, user]);

  const fetchStats = async () => {
    try {
      const [statsData, creditsData] = await Promise.all([
        getUserStats(user?.id || ''),
        getUserCredits(user?.id || '')
      ]);
      setStats(statsData);
      setBalance(creditsData);
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputTokens = stats.reduce((acc, curr) => acc + (curr.promptTokens || 0), 0);
  const outputTokens = stats.reduce((acc, curr) => acc + (curr.completionTokens || 0), 0);
  const totalTokens = inputTokens + outputTokens;
  
  // Pricing: $2.5/1M input, $17.5/1M output
  const spentCredits = (inputTokens / 1000000) * 2.5 + (outputTokens / 1000000) * 17.5;
  const initialCredits = 5.00;
  const remainingCredits = Math.max(0, initialCredits - spentCredits);

  const plans = [
    {
      name: "PAYG",
      price: "Usage-based",
      description: "Pay only for what you consume.",
      features: ["$2.50 / 1M Input", "$17.50 / 1M Output", "No monthly fee", "Unlimited keys"],
      current: true
    },
    {
      name: "Pro",
      price: "$29",
      description: "For developers building production apps.",
      features: ["500k monthly tokens", "Priority email support", "Unlimited API Keys", "Low latency global edge"],
      current: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For high-scale platform needs.",
      features: ["Unlimited tokens", "24/7 dedicated support", "Custom SLA", "Single-tenant deployment"],
      current: false
    }
  ];

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Initializing Console...</div>;
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
            <Link href="/dashboard/billing" className="text-white underline decoration-white/20 underline-offset-4">Billing</Link>
            <Link href="/dashboard/settings" className="hover:text-white transition-colors">Settings</Link>
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
          <h1 className="text-4xl font-heading font-medium tracking-tight mb-2">Billing & Usage</h1>
          <p className="text-white/40 text-sm">Manage your subscription and monitor your consumption costs.</p>
        </div>

        {/* Current Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {loading ? (
            <>
              <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-[2rem] p-8 space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-16 w-48 bg-white/5" />
                </div>
                <Skeleton className="h-2 w-full bg-white/5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                </div>
              </div>
              <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 space-y-8">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-12 w-32 bg-white/5" />
                <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-white/40 mb-6">
                    <BarChart3 size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Available Balance</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-6xl font-medium tracking-tighter">${balance.toFixed(2)}</span>
                    <span className="text-white/20 text-xl font-medium mb-2">USD</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                    <div 
                      className="h-full bg-white transition-all duration-1000" 
                      style={{ width: `${Math.min((balance / 5) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-white/60 italic mb-2">
                    <span>Usage Breakdown:</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Input Tokens ({ (inputTokens / 1000).toFixed(1) }k)</span>
                    <span className="font-mono text-white/60">-${((inputTokens / 1000000) * 2.5).toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Output Tokens ({ (outputTokens / 1000).toFixed(1) }k)</span>
                    <span className="font-mono text-white/60">-${((outputTokens / 1000000) * 17.5).toFixed(4)}</span>
                  </div>
                  <div className="h-px bg-white/5 w-full my-2" />
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-white">Total Spent</span>
                    <span className="font-mono text-white underline decoration-white/20 underline-offset-4">${spentCredits.toFixed(4)} USD</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group">
                <div className="flex items-center gap-3 text-white/40 mb-6">
                  <CreditCard size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Current Plan</span>
                </div>
                <div>
                  <div className="text-3xl font-medium mb-1">PAYG Tier</div>
                  <div className="text-white/40 text-xs mb-8">Pay-As-You-Go active</div>
                </div>
                <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  Upgrade
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Plans Selection */}
        <h2 className="text-2xl font-heading font-medium mb-8">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative p-8 rounded-[2rem] border transition-all ${plan.current ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
              {plan.current && (
                <div className="absolute top-8 right-8 px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded">Current</div>
              )}
              <h3 className="text-xl font-medium mb-1">{plan.name}</h3>
              <div className="text-3xl font-medium mb-4">{plan.price}<span className="text-sm text-white/40 font-normal">/mo</span></div>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">{plan.description}</p>
              
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                    <Check size={14} className="text-white/40" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button disabled={plan.current} className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${plan.current ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {plan.current ? 'Active' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center">
                 <Zap size={24} className="text-white/40" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Need higher limits?</h3>
                <p className="text-white/40 text-sm">Contact our sales team for custom volume and enterprise SLAs.</p>
              </div>
           </div>
           <button className="px-8 py-3 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors">
              Talk to Sales
           </button>
        </div>
      </main>

      <footer className="py-8 text-white/10 text-[10px] text-center uppercase tracking-widest border-t border-white/5">
        Uttam Vara Console • Billing & Consumption
      </footer>
    </div>
  );
}
