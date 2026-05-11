"use client"

import React from 'react';
import { AIChatInput } from '@/components/ui/ai-chat-input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

import { Footer7 } from "@/components/ui/footer-7";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();
  
  const tags = [
    "Talk with Uttam",
    "Research",
    "API Platform",
    "Stories",
    "More"
  ];

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-white/10 overflow-hidden flex flex-col items-center font-body">
      {/* Navigation */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-50 animate-fade-in absolute top-0">
        <div className="text-xl font-bold tracking-tighter">
          Frenix Labs
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-white/5 transition-colors">Research</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4 min-w-[150px] bg-black border border-white/10 shadow-lg">
                <ul className="grid gap-2 text-sm">
                  <li><Link href="#" className="block py-1 hover:underline text-white">Overview</Link></li>
                  <li><Link href="#" className="block py-1 hover:underline text-white">Index</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-white/5 transition-colors">Products</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4 min-w-[150px] bg-black border border-white/10 shadow-lg">
                <ul className="grid gap-2 text-sm">
                  <li><Link href="https://uttamai.in" className="block py-1 hover:underline text-white">Uttam</Link></li>
                  <li><Link href="#" className="block py-1 hover:underline text-white">DALL·E 3</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="#" className="bg-transparent hover:bg-white/5 transition-colors text-white">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex gap-4 items-center">
          {!isSignedIn ? (
            <Link href="/sign-in" className="text-sm font-medium hover:underline flex items-center">Log in</Link>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:underline flex items-center">Dashboard</Link>
            </>
          )}
          <Link href="https://uttamai.in" className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center">
            Try Uttam
          </Link>
        </div>
      </header>

      {/* Hero: Content Center */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center w-full max-w-4xl px-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium tracking-tight mb-8 animate-fade-in delay-1 text-center text-white">
          What can I help with?
        </h1>

        <div className="w-full animate-fade-in delay-2">
          <AIChatInput />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in delay-3">
          {tags.map((tag) => (
            <button 
              key={tag}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/70"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Featured Article/Update */}
      <section className="w-full max-w-6xl px-6 py-24 animate-fade-in delay-3">
        <div className="group cursor-pointer">
          {/* Feature Card */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900 mb-8 border border-white/5 transition-transform duration-500 ease-out group-hover:scale-[1.01]">
            <img 
              src="/images/feature-bg.png" 
              alt="Uttam Vara Feature" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Feature Info */}
          <div className="space-y-4">
            <h3 className="text-3xl md:text-5xl font-heading font-medium text-white tracking-tight">
              Introducing Uttam Vara 1.0
            </h3>
            <div className="flex items-center gap-4 text-sm font-medium text-white/40">
              <span className="uppercase tracking-widest">Product</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>18 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Call to Action (Boxed) */}
      <section className="w-full max-w-6xl px-6 py-24 animate-fade-in delay-3">
        <div className="w-full bg-[#1A1A1A] rounded-[2.5rem] py-24 flex flex-col items-center text-center space-y-10 border border-white/5 shadow-2xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-white tracking-tight">
            Get started with Uttam
          </h2>
          <button className="px-6 py-2 bg-[#333333] text-white rounded-full text-sm font-medium hover:bg-[#444444] transition-colors border border-white/5">
            Download
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <Footer7 />
    </main>
  );
}
