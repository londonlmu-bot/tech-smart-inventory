"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * CartPage Component
 * Functionality: Allows users to review selected hardware, remove items, 
 * and finalize the acquisition protocol by syncing with the backend.
 */
export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Synchronize session and local cart data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  /**
   * Removes a specific hardware component from the local cart stream.
   * @param {number} index - The index of the item to be decoupled.
   */
  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Aggregating total valuation of selected hardware
  const totalAmount = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);

  /**
   * Finalizes the transaction protocol.
   * Dispatches each item to the checkout API and clears the local session.
   */
  const handleFinalCheckout = async () => {
    // Security Guard: Ensure user is authorized
    if (!user) return alert("SECURITY: Please login to finalize acquisition.");
    // Stream Check: Ensure cart is not null
    if (cart.length === 0) return alert("EMPTY_STREAM: No hardware detected in cart.");

    setIsProcessing(true);
    try {
      // Iterative processing of each hardware component
      for (const item of cart) {
        await fetch('https://tech-smart-inventory-production.up.railway.app/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: item.id,
            quantity: 1,
            price: item.price,
            user_id: user.id
          })
        });
      }
      
      alert("ACQUISITION COMPLETE: Your MSI components are being deployed.");
      
      // Post-transaction cleanup
      setCart([]);
      localStorage.removeItem('cart');
      router.push('/profile'); // Redirect to profile to track order status
    } catch (err) {
      alert("CORE_ERROR: Transaction synchronization failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8 md:p-20 selection:bg-red-600">
      
      {/* --- ACQUISITION HEADER --- */}
      <header className="max-w-4xl mx-auto mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Cart <span className="text-red-600">Review</span>
          </h1>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
            Finalize your hardware selection protocol
          </p>
        </div>
        <Link href="/" className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-all tracking-widest underline underline-offset-8 decoration-red-900/30">
          Return to Store
        </Link>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* --- HARDWARE SELECTION LIST --- */}
        <div className="lg:col-span-2 space-y-6">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between group hover:border-red-600/30 transition-all duration-500 shadow-xl">
                <div className="flex items-center space-x-8">
                  <div className="w-24 h-16 bg-black rounded-2xl overflow-hidden p-3 border border-white/5 group-hover:border-red-900/30 transition-colors">
                    <img src={item.image_url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic tracking-tight group-hover:text-red-500 transition-colors">{item.name}</h4>
                    <p className="text-red-600 font-black text-xs mt-1.5 tracking-wider">Rs. {parseFloat(item.price).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="text-[9px] font-black text-gray-700 hover:text-red-600 uppercase tracking-widest transition-all duration-300 border-b border-transparent hover:border-red-600 pb-1"
                >
                  Decouple
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-900 font-black py-32 text-center uppercase tracking-[1.5em] text-2xl opacity-20 select-none italic">
              CART_EMPTY
            </div>
          )}
        </div>

        {/* --- ACQUISITION SUMMARY (STATIONARY) --- */}
        <div className="bg-gray-950 p-10 rounded-[2.5rem] border border-white/5 h-fit sticky top-32 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none"></div>
          
          <h3 className="text-[10px] font-black uppercase text-gray-500 mb-10 tracking-[0.4em]">Final Summary</h3>
          <div className="space-y-8">
            <div className="flex justify-between border-b border-white/5 pb-5">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Hardware Units</span>
              <span className="font-black italic text-red-600">{cart.length}</span>
            </div>
            
            <div className="space-y-2">
               <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Total Valuation</span>
               <div className="text-3xl font-black text-white italic tracking-tighter">
                  Rs. {totalAmount.toLocaleString()}
               </div>
            </div>
            
            <button 
              onClick={handleFinalCheckout}
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 shadow-2xl shadow-red-900/20 disabled:opacity-20 group relative overflow-hidden"
            >
              <span className="relative z-10">{isProcessing ? "SYNCING..." : "CONFIRM ACQUISITION"}</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
            
            <p className="text-[8px] text-center text-gray-700 font-black uppercase tracking-widest pt-4">
               TECH SECURE CHECKOUT PROTOCOL 
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}