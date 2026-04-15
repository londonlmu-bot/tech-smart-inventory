"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Importing Framer Motion for cinematic component transitions
import { motion } from 'framer-motion';
// Importing SweetAlert2 for professional high-fidelity notifications
import Swal from 'sweetalert2';

/**
 * RegisterPage Component
 * Handles MSI System Enrollment with validation and secure API integration.
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Logic to process personnel registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Protocol Check: Password synchronization
    if (formData.password !== confirmPassword) {
      setError("SECURITY ALERT: PASSWORDS DO NOT MATCH.");
      return;
    }

    // Protocol Check: Strength validation
    if (formData.password.length < 6) {
      setError("SECURITY ALERT: PASSWORD LENGTH INSUFFICIENT.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Dispatching data to MSI Personnel Registry API
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // SUCCESS ALERT: Custom SweetAlert2 for high-end UI feel
        Swal.fire({
          title: 'REGISTRY INITIALIZED',
          text: 'Redirecting to secure login terminal.',
          icon: 'success',
          background: '#0a0a0a',
          color: '#fff',
          confirmButtonColor: '#dc2626',
          iconColor: '#dc2626',
          customClass: {
            popup: 'rounded-[2rem] border border-white/10 shadow-2xl font-sans'
          }
        }).then(() => {
          router.push('/login'); 
        });
      } else {
        setError(data.error || "REGISTRY FAILED: USER ALREADY LOGGED.");
      }
    } catch (err) {
      setError("SYSTEM OFFLINE: REGISTRY SERVER UNREACHABLE.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation Variants for the form elements
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans selection:bg-red-600 relative overflow-hidden">
      
      {/* --- CINEMATIC AMBIANCE ELEMENTS --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-red-600/10">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-current blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-current blur-[130px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-gray-900/80 backdrop-blur-3xl p-10 md:p-12 rounded-[2.5rem] border border-white/10 shadow-[0_0_60px_rgba(220,38,38,0.1)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>

          {/* Identity Protocol Header */}
          <div className="mb-12 text-center">
            <motion.div variants={itemVariants} className="inline-block px-4 py-1 rounded-full border border-red-600/30 bg-red-600/5 mb-4">
               <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em]">TECH Enrollment Protocol</p>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              CREATE <span className="text-red-600 shadow-red-600/50">ACCOUNT</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Initialize your Genesis Identity
            </motion.p>
          </div>

          {/* Feedback Display */}
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-950/40 border border-red-600/50 text-red-500 p-4 rounded-2xl text-[9px] mb-8 text-center font-black uppercase tracking-widest shadow-lg shadow-red-950/20"
            >
               ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1 italic">Full Identity Name</label>
              <input 
                type="text" required
                placeholder="Name"
                className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1 italic">Email</label>
              <input 
                type="email" required
                placeholder="user@system.com"
                className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1 italic">Password</label>
                <input 
                  type="password" required
                  placeholder="••••••"
                  className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1 italic">Verify Password</label>
                <input 
                  type="password" required
                  placeholder="••••••"
                  className="w-full bg-gray-900 border border-white/10 p-5 rounded-2xl focus:border-red-600 outline-none transition-all text-sm font-medium text-white shadow-inner"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </motion.div>
            </div>
            
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-2xl transition-all duration-500 uppercase text-[10px] tracking-[0.5em] shadow-[0_15px_40px_rgba(220,38,38,0.25)] disabled:opacity-30 group relative overflow-hidden mt-4"
            >
              <span className="relative z-10">{isSubmitting ? 'SYNCING DATA...' : 'INITIALIZE REGISTRY'}</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/10 text-center">
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
               Already Verified? <Link href="/login" className="text-red-500 hover:text-white transition-colors ml-2 underline underline-offset-8 decoration-red-600/30 italic font-black">Authorize Login</Link>
             </p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-10 text-center opacity-40">
           <p className="text-[8px] text-white font-black uppercase tracking-[1em]">TECH Intelligence OS</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
