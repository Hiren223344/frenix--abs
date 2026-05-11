import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="text-2xl font-bold tracking-tighter text-white mb-2">Frenix Labs</div>
          <p className="text-white/40 text-sm">Sign in to continue to Uttam</p>
        </div>
        
        <SignIn 
          path="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-white text-black hover:bg-zinc-200 text-sm normal-case',
              card: 'bg-zinc-900 border border-white/5 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/40',
              socialButtonsBlockButton: 'bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-white/10',
              dividerText: 'text-white/20',
              formFieldLabel: 'text-white/60',
              formFieldInput: 'bg-zinc-800 border border-white/10 text-white focus:ring-1 focus:ring-white/20',
              footerActionText: 'text-white/40',
              footerActionLink: 'text-white hover:text-white/80 transition-colors',
              identityPreviewText: 'text-white',
              identityPreviewEditButtonIcon: 'text-white/40'
            }
          }}
        />
      </div>
    </div>
  );
}
