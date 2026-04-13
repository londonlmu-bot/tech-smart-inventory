"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * ProfilePage Component
 * Features: Secure order tracking, robust wishlist management with array validation,
 * and cinematic "Genesis" UI aesthetics.
 */
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validate user session and initialize data synchronization
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    const fetchData = async () => {
      try {
        // Parallel fetching for optimal terminal performance
        const [ordersRes, wishlistRes, newRes] = await Promise.all([
          fetch(`http://localhost:5000/api/user-orders/${userData.id}`),
          fetch(`http://localhost:5000/api/wishlist/${userData.id}`),
          fetch(`http://localhost:5000/api/products/new`)
        ]);

        // Safety Protocol: Ensure we only parse if response is valid JSON
        const ordersData = ordersRes.ok ? await ordersRes.json() : [];
        const wishlistData = wishlistRes.ok ? await wishlistRes.json() : [];
        const newArrivalsData = newRes.ok ? await newRes.json() : [];

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
        setNewArrivals(Array.isArray(newArrivalsData) ? newArrivalsData : []);
        
      } catch (err) {
        console.error("Critical System Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  /**
   * Decouples a hardware component from the personnel's wishlist.
   */
  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/wishlist/${user.id}/${productId}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        setWishlist(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error("Wishlist modification failed:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-20">
      
      {/* --- TACTICAL NAVIGATION --- */}
      <nav className="p-8 border-b border-white/5 flex justify-between items-center backdrop-blur-2xl sticky top-0 z-50 bg-black/60">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-1.5 h-6 bg-red-600 group-hover:h-8 transition-all shadow-[0_0_10px_#dc2626]"></div>
          <span className="text-2xl font-black tracking-tighter italic uppercase">
            MSI <span className="text-red-600">INTEL</span>
          </span>
        </Link>
        <Link href="/" className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] hover:text-red-500 transition-all border border-white/10 px-6 py-2 rounded-full">
          Exit to Mainframe
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto py-16 px-6 space-y-20">
        
        {/* --- 👤 USER PROFILE MODULE --- */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-transparent rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-gray-950 p-10 md:p-14 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center md:space-x-12 shadow-2xl overflow-hidden">
            <div className="w-32 h-32 bg-red-600 rounded-2xl flex items-center justify-center text-5xl font-black rotate-3 shadow-2xl shadow-red-900/40 border-4 border-black mb-8 md:mb-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-5xl font-black uppercase italic tracking-tighter">{user.name}</h1>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em]">{user.role} // ACCESS LEVEL VERIFIED</p>
              <p className="text-sm text-gray-500 font-medium opacity-60 tracking-wider">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* --- 📦 ACQUISITION LOGS --- */}
          <div className="lg:col-span-2 space-y-10">
            <h2 className="text-xl font-black uppercase tracking-[0.2em] flex items-center">
              <span className="w-8 h-[2px] bg-red-600 mr-4 shadow-[0_0_10px_#dc2626]"></span> Acquisition Logs
            </h2>
            
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 animate-pulse text-gray-700 text-[10px] font-black uppercase tracking-[1em] italic">Scanning PURCHASE HISTORY...</div>
              ) : orders.length === 0 ? (
                <div className="p-16 border border-dashed border-white/10 rounded-[2rem] text-center opacity-30 italic text-xs uppercase tracking-[0.5em]">No transaction logs detected.</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-white/5 group hover:border-red-600/40 transition-all duration-500 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1 tracking-widest">Log REF: #ORD-{String(order.id).padStart(5, '0')}</p>
                        <h4 className="text-lg font-black italic uppercase tracking-tight">
                          {new Date(order.order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-5 py-2 rounded-full border shadow-sm tracking-widest ${
                        order.status === 'Delivered' ? 'bg-green-950/20 text-green-500 border-green-900/40' : 
                        order.status === 'Shipped' ? 'bg-blue-950/20 text-blue-500 border-blue-900/40' :
                        'bg-red-950/20 text-red-500 border-red-900/40 animate-pulse'
                      }`}>
                        STATUS: {order.status}
                      </span>
                    </div>
                    <div className="space-y-3 border-t border-white/5 pt-8">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                          <span>{item.name} <span className="text-gray-700 mx-2">//</span> <span className="text-red-600">x{item.qty}</span></span>
                          <span className="text-white">Rs. {order.total_amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* --- 🛠️ TACTICAL SIDEBAR --- */}
          <div className="space-y-16">
            
            {/* WISHLIST SECTION (ARRAY PROTECTED) */}
            <div className="space-y-8 bg-white/[0.01] p-6 rounded-[2rem] border border-white/5 shadow-inner">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 border-b border-red-900/20 pb-4">Saved Hardware</h3>
              <div className="space-y-4">
                {Array.isArray(wishlist) && wishlist.length > 0 ? (
                  wishlist.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-red-600/20 transition-all">
                      <div className="flex items-center space-x-4">
                        <img src={item.image_url} alt="" className="w-10 h-10 object-contain opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase truncate w-24 tracking-tight group-hover:text-white">{item.name}</span>
                      </div>
                      <button onClick={() => removeFromWishlist(item.id)} className="text-[8px] text-gray-700 hover:text-red-500 font-black tracking-tighter transition-colors uppercase">Decouple</button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-800 uppercase font-black tracking-widest italic py-4 text-center">Wishlist Empty</p>
                )}
              </div>
            </div>

            {/* WHAT'S NEW (ARRAY PROTECTED) */}
            <div className="bg-red-600/5 p-8 rounded-[2.5rem] border border-red-900/20 space-y-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 blur-3xl rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 relative z-10">What's New</h3>
              {Array.isArray(newArrivals) && newArrivals.slice(0, 2).map(item => (
                <Link href="/" key={item.id} className="block group/item relative z-10">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 group-hover/item:border-red-600/30 transition-all shadow-lg">
                    <img src={item.image_url} alt="" className="w-full h-24 object-contain mb-4 group-hover/item:scale-110 transition duration-700" />
                    <p className="text-[10px] font-black uppercase italic tracking-tighter group-hover/item:text-red-500 transition-colors truncate">{item.name}</p>
                    <p className="text-white font-black text-[9px] mt-2 opacity-30 tracking-[0.2em]">Deploy Now</p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}