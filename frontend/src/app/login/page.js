"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * LoginPage Component
 * Functionality: Authenticates users and establishes secure sessions.
 * Redirects personnel based on their authorization level (Admin/Customer).
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  /**
   * Handles the authentication handshake with the MSI Backend API.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Dispatching credentials to the secure login endpoint
      const response = await fetch('https://tech-smart-inventory-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Securely store token and user identity metadata
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Strategic redirection based on role privilege
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/'; 
        }
      } else {
        setError(data.error || "Access Denied: Invalid Credentials.");
      }
    } catch (err) {
      setError("System Offline: Core connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans selection:bg-red-600 relative overflow-hidden">
      
      {/* --- CINEMATIC BACKGROUND ELEMENTS --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-red-600/15 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in duration-1000">
        <div className="bg-gray-900/80 backdrop-blur-3xl p-10 md:p-12 rounded-[2.5rem] border border-white/10 shadow-[0_0_60px_rgba(220,38,38,0.15)] relative overflow-hidden">
          
          {/* Top Decorative Border Gradient */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70"></div>

          {/* Terminal Branding Section */}
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/10 mb-5">
               <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em]">Secure Access Terminal</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-3 leading-none text-white">
              INITIATE <span className="text-red-600 shadow-red-600/50">LOGIN</span>
            </h2>
            <div className="flex items-center justify-center space-x-2.5 pt-2">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-ping shadow-[0_0_10px_#dc2626]"></div>
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
                 Waiting for authorized credentials...
               </p>
            </div>
          </div>

          {/* Dynamic Error Feedback Display */}
          {error && (
            <div className="bg-red-950/40 border border-red-600/50 text-red-500 p-5 rounded-2xl text-[10px] mb-10 text-center font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-red-950/30">
              <span className="mr-2.5">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-9">
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1 italic">Email</label>
              <input 
                type="email" required
                placeholder="user@system.com"
                className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner placeholder:text-gray-700"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1 italic">Password</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner placeholder:text-gray-700"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Symmetrical Auth Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-2xl transition-all duration-500 uppercase text-[11px] tracking-[0.5em] shadow-[0_15px_40px_rgba(220,38,38,0.3)] disabled:opacity-30 disabled:cursor-wait group relative overflow-hidden"
            >
              <span className="relative z-10">{isSubmitting ? 'ESTABLISHING LINK...' : 'AUTHORIZE LOGIN'}</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </form>

          {/* Footer Navigation Overlay */}
          <div className="mt-14 pt-10 border-t border-white/10 text-center">
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
               New Personnel? <Link href="/register" className="text-red-500 hover:text-white transition-colors ml-2 underline underline-offset-8 decoration-red-600/50 font-black italic">Initialize Account</Link>
             </p>
          </div>
        </div>

        {/* Technical Specification Label */}
        <div className="mt-10 text-center opacity-40">
           <p className="text-[8px] text-white font-black uppercase tracking-[1em]">TECH Intelligence OS</p>
        </div>
      </div>
    </div>
  );
}