export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        
        {/* Soft blue glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_60%)]" />
  
        <div className="relative w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
          {children}
        </div>
      </div>
    );
  }