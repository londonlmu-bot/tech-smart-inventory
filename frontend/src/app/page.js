"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Importing Framer Motion for cinematic UI transitions and interaction effects
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HomePage Component
 * Features: High-end "Genesis" UI, Role-based Cart Visibility, 
 * Real-time Product Filtering, and Secure Add-to-Cart Protocol.
 */
export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]); // Wishlist state added
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Initialize session data and fetch inventory on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        fetchWishlist(parsedUser.id);
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    fetchProducts();
  }, []);

  // Live filtering logic for search and category toggles
  useEffect(() => {
    let results = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategory === "High-End") {
      results = results.filter(p => parseFloat(p.price) >= 200000);
    } else if (selectedCategory === "Budget") {
      results = results.filter(p => parseFloat(p.price) < 200000);
    }
    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  // Fetch product catalog from backend API
  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setFilteredProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data Stream Error:", err);
        setLoading(false);
      });
  };

  // Fetch user's wishlist from database (FIXED LOGIC)
  const fetchWishlist = (userId) => {
    fetch(`http://localhost:5000/api/wishlist/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Validation logic to ensure data is a valid array before mapping
        if (Array.isArray(data)) {
            setWishlist(data.map(item => item.id));
        } else {
            setWishlist([]);
        }
      })
      .catch(err => {
        console.error("Wishlist Sync Error:", err);
        setWishlist([]);
      });
  };

  // Toggle wishlist status
  const toggleWishlist = async (productId) => {
    if (!user) {
        alert("SECURITY: Sign in to sync wishlist.");
        return;
    }

    const isExisting = wishlist.includes(productId);
    const method = isExisting ? 'DELETE' : 'POST';
    const url = isExisting 
        ? `http://localhost:5000/api/wishlist/${user.id}/${productId}`
        : 'http://localhost:5000/api/wishlist';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: isExisting ? null : JSON.stringify({ user_id: user.id, product_id: productId })
        });

        if (response.ok) {
            setWishlist(prev => isExisting ? prev.filter(id => id !== productId) : [...prev, productId]);
            setMessage(isExisting ? "UNLINKED FROM WISHLIST" : "SYNCED TO WISHLIST");
            setTimeout(() => setMessage(""), 2000);
        }
    } catch (err) { console.error("Wishlist Operation Failed:", err); }
  };

  /**
   * Secure Add to Cart Protocol
   * Validates user authentication before allowing hardware acquisition.
   */
  const addToCart = (product) => {
    if (!user) {
      alert("SECURITY ACCESS DENIED: Please sign in to acquire gear.");
      router.push('/login');
      return;
    }

    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setMessage(`+ ${product.name} LOCKED`);
    setTimeout(() => setMessage(""), 2000);
  };

  // Clear local storage and reset session
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Helper to scroll to inventory section
  const scrollToProducts = () => {
    document.getElementById('tactical-inventory').scrollIntoView({ behavior: 'smooth' });
  };

  // Animation Variants for UI Orchestration
  const heroTextVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const productContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const productItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 overflow-x-hidden">
      
      {/* --- ULTRA-MODERN NAVIGATION --- */}
      <nav className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl sticky top-0 z-[100] transition-all">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 group cursor-pointer" 
          onClick={() => router.push('/')}
        >
           <div className="w-2 h-8 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:h-12 transition-all duration-500"></div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">TECH <span className="text-red-600">SMART</span></h1>
        </motion.div>
        
        <div className="flex items-center space-x-8">
          {/* CART: Visible only to authenticated users */}
          {user && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Link href="/cart" className="flex items-center space-x-3 bg-red-600/10 px-5 py-2 rounded-full border border-red-600/30 hover:bg-red-600 transition-all duration-300">
                <span className="text-lg">🛒</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{cart.length} UNITS</span>
              </Link>
            </motion.div>
          )}

          {user ? (
            <div className="flex items-center space-x-6 border-l border-white/10 pl-8">
              {/* Profile access */}
              <Link href="/profile" className="flex flex-col text-right group cursor-pointer">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-red-500 transition-colors">AUTHORIZED AS</span>
                <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">{user.name}</span>
              </Link>
              
              <button onClick={handleLogout} className="group flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl hover:bg-red-600 transition-all shadow-inner">
                <span className="text-xl group-hover:scale-110 transition-transform">⏻</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-red-600 px-8 py-3 rounded-full text-white font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all">INITIALIZE</Link>
          )}
        </div>
      </nav>

      {/* --- THE GENESIS HERO SECTION --- */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[150px]"
        ></motion.div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 blur-[150px] animate-pulse delay-700"></div>
        
        <div className="relative text-center space-y-6 px-6 -mt-16">
            <motion.div variants={heroTextVariants} initial="hidden" animate="visible">
                <p className="text-red-600 font-black uppercase tracking-[0.8em] text-[11px]">
                  Engineering the Future
                </p>
            </motion.div>
            <motion.h2 
              initial={{ letterSpacing: "-0.05em", opacity: 0 }}
              animate={{ letterSpacing: "-0.02em", opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-7xl md:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.85] select-none"
            >
                THE NEXT <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-white">GENESIS.</span>
            </motion.h2>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-12 flex flex-col md:flex-row items-center justify-center gap-4"
            >
                <button 
                  onClick={scrollToProducts}
                  className="w-64 bg-red-600 text-white py-5 rounded-full font-black uppercase text-[11px] tracking-[0.4em] hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 shadow-xl shadow-red-900/20"
                >
                  ACQUIRE GEAR
                </button>
                <button 
                  onClick={scrollToProducts}
                  className="w-64 bg-white text-black py-5 rounded-full font-black uppercase text-[11px] tracking-[0.4em] hover:bg-red-600 hover:text-white hover:scale-105 transition-all duration-500 shadow-xl shadow-white/10"
                >
                  PRODUCTS
                </button>
            </motion.div>
        </div>
      </section>

      {/* --- DISCOVERY INTERFACE --- */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 mt-10"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="relative w-full md:w-3/5">
            <input 
                type="text" 
                placeholder="SEARCH COMPONENT ARCHIVE..." 
                className="w-full bg-black border border-white/20 p-6 rounded-2xl focus:border-red-600 outline-none transition-all text-xs font-black uppercase tracking-[0.2em] text-white placeholder:opacity-30"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-6 text-red-600 font-black uppercase tracking-tighter italic select-none">Searching...</div>
          </div>
          <div className="flex bg-black p-2 rounded-2xl border border-white/5">
            {["All", "High-End", "Budget"].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${selectedCategory === cat ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]' : 'text-white/30 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* HUD NOTIFICATION */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300]">
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white text-black px-12 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.5em] shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
                SYSTEM: {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- TACTICAL INVENTORY --- */}
      <main id="tactical-inventory" className="max-w-7xl mx-auto px-6 py-32">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center space-x-6 mb-20"
        >
            <div className="w-12 h-[2px] bg-red-600"></div>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter italic">Tactical <span className="text-white/20">Inventory</span></h3>
        </motion.div>
        
        {loading ? (
          <div className="text-center py-40 animate-pulse text-red-600 font-black uppercase tracking-[1.5em] text-[12px] italic">STREAMING DATA...</div>
        ) : (
          <motion.div 
            variants={productContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            {filteredProducts.map((product) => (
              <motion.div 
                variants={productItemVariants}
                key={product.id} 
                className="group relative bg-black rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-700 hover:border-red-600/40 hover:translate-y-[-10px]"
              >
                <div className="h-80 bg-[#050505] relative overflow-hidden flex items-center justify-center p-16">
                  
                  {/* --- ❤️ WISHLIST TOGGLE --- */}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-6 right-6 z-30 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all shadow-xl"
                  >
                    <span className={`text-lg transition-transform duration-300 ${wishlist.includes(product.id) ? 'text-white scale-125' : 'text-gray-500 group-hover:text-white'}`}>
                        {wishlist.includes(product.id) ? '❤️' : '🤍'}
                    </span>
                  </motion.button>

                  <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-all duration-700"></div>
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    src={product.image_url || 'https://via.placeholder.com/600x400/111/fff?text=MSI+GEAR'} 
                    alt={product.name} 
                    className="w-full h-full object-contain relative z-10"
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
                    <span className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-600 shadow-[0_0_10px_#dc2626]'}`}></span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">{product.stock_quantity > 0 ? 'UNIT READY' : 'OFFLINE'}</span>
                  </div>
                </div>

                <div className="p-12 space-y-8">
                  <div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-red-500 transition-colors duration-500">{product.name}</h4>
                    <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em] mt-3 italic">TECH Hardware Protocol</p>
                  </div>
                  <div className="flex justify-between items-center py-8 border-y border-white/5">
                    <div>
                        <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-2">Value</p>
                        <p className="text-2xl font-black text-white">Rs. {parseFloat(product.price).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-2">Availability</p>
                        <p className="text-xs font-black text-white/60">{product.stock_quantity} Units</p>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)} 
                    disabled={product.stock_quantity <= 0}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.5em] transition-all duration-500 ${
                      product.stock_quantity > 0 
                      ? 'bg-transparent text-white border border-white/10 hover:bg-red-600 hover:border-red-600 hover:shadow-[0_15px_40px_rgba(220,38,38,0.3)]' 
                      : 'bg-white/5 text-white/10 cursor-not-allowed border-none'
                    }`}
                  >
                    {product.stock_quantity > 0 ? "ADD TO CART" : "OUT OF STOCK"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="py-32 border-t border-white/5 bg-black relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-12">
            <h2 className="text-6xl font-black italic tracking-widest opacity-5 select-none">GENESIS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                <span className="hover:text-red-600 cursor-pointer transition-all text-center">Global Portal</span>
                <span className="hover:text-red-600 cursor-pointer transition-all text-center">Tech Specs</span>
                <span className="hover:text-red-600 cursor-pointer transition-all text-center">TECH Care</span>
                <span className="hover:text-red-600 cursor-pointer transition-all text-center">Terminal</span>
            </div>
            <p className="text-white/10 text-[9px] font-black uppercase tracking-[1.5em] pt-12">Finalization Protocol 2026 - TECH Smart Store</p>
        </div>
      </footer>
    </div>
  );
}
