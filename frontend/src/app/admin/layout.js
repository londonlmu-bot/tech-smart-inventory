"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Importing Framer Motion for sidebar transitions and content orchestration
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AdminLayout Component
 * Functionality: Orchestrates the administrative workspace, enforces security protocols,
 * and manages cross-module navigation within the MSI Mainframe.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // Security Handshake: Validate personnel credentials and authorization level
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser) {
      // Access Denied: Redirect to authentication terminal
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      // Privilege Escalation Check: Verify administrative access level
      if (user.role !== 'admin') {
        router.push('/'); // Redirect unauthorized personnel to the public interface
      } else {
        setAuthorized(true); // Grant access to secure modules
      }
    } catch (error) {
      console.error("Authorization Synchronization Failure:", error);
      router.push('/login');
    }
  }, [router]);

  /**
   * Secure Session Termination
   * Clears operational cache and forces a hard reload for security compliance.
   */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  // Tactical Navigation modules (Updated with Users Registry)
  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Orders History', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' }, // ADDED: Access link for Personnel Registry
    { name: 'AI Forecast', path: '/admin/ai-forecast' }, 
  ];

  // Initializing Security Screen
  if (!authorized) {
    return (
      <div className="bg-black min-h-screen text-red-600 flex items-center justify-center font-black uppercase italic animate-pulse tracking-[0.4em] text-xs">
        Verifying Security Protocols...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* --- 🛡️ MSI INTELLIGENCE SIDEBAR --- */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-72 border-r border-white/5 bg-gray-950 flex flex-col h-full shadow-2xl z-50 relative"
      >
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/20 to-transparent"></div>
        
        {/* Unit Branding Container */}
        <div className="p-12">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic border-l-4 border-red-600 pl-4">
            TECH <span className="text-red-600">Admin</span>
          </h2>
          <p className="text-[9px] text-gray-600 font-bold uppercase mt-3 tracking-[0.4em] leading-loose opacity-60">
            Central Command Unit
          </p>
        </div>
        
        {/* Module Navigation Stream */}
        <nav className="flex-1 px-6 space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
              >
                <motion.div 
                  whileHover={{ x: 5 }} // Subtle slide effect on hover
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-500 border border-transparent cursor-pointer ${
                    isActive 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-900/30 border-red-500' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-white hover:border-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></motion.div>}
                    <span>{item.name}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* 🔴 SECURE PROTOCOL TERMINATION */}
        <div className="p-8 border-t border-white/5 bg-black/60">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 bg-gray-900 hover:bg-red-600 hover:text-white text-gray-400 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all duration-500 border border-white/5 group shadow-lg"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span>Secure Logout</span>
          </motion.button>
          <div className="mt-8 text-center opacity-30 group">
             <p className="text-[8px] text-gray-500 uppercase tracking-[0.5em] font-black group-hover:text-red-600 transition-colors">
               TECH Intelligence OS 
             </p>
          </div>
        </div>
      </motion.aside>

      {/* --- 💻 COMMAND WORKSPACE (MAIN CONTENT) --- */}
      <main className="flex-1 overflow-y-auto bg-black scrollbar-hide relative">
        {/* Ambient Glow Background Overlay */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={pathname} // Triggers animation on route change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto p-12 relative z-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
