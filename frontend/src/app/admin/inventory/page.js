"use client";
import React, { useEffect, useState } from 'react';
// Importing Framer Motion for smooth component transitions and modal effects
import { motion, AnimatePresence } from 'framer-motion';

/**
 * InventoryPage Component
 * Manages MSI Hardware Registry including adding, editing, searching, and deleting products.
 */
export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', stock_quantity: '', min_stock_level: '5', description: ''
  });
  
  // States for Image Handling (Add Mode)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // States for Image Handling (Edit Mode)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all hardware components from the Backend API
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
        setFilteredProducts(productList);
      })
      .catch(err => console.error("MSI Inventory Sync Error:", err));
  };

  useEffect(() => { fetchProducts(); }, []);

  // Live searching logic
  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle local image preview for new products
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle local image preview for editing existing products
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Initialize edit modal with selected product data
  const startEditing = (product) => {
    setEditingProduct(product);
    setEditPreviewUrl(product.image_url); 
    setEditFile(null); 
  };

  // Reset and close edit modal
  const cancelEditing = () => {
    setEditingProduct(null);
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  // Submit new product via FormData
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', parseFloat(newProduct.price));
    formData.append('stock_quantity', parseInt(newProduct.stock_quantity));
    formData.append('min_stock_level', parseInt(newProduct.min_stock_level));
    formData.append('description', newProduct.description);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewProduct({ name: '', price: '', stock_quantity: '', min_stock_level: '5', description: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchProducts();
      }
    } catch (error) {
      alert("Terminal Sync Failure: Could not reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update product via PUT request
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('price', parseFloat(editingProduct.price));
    formData.append('stock_quantity', parseInt(editingProduct.stock_quantity));
    formData.append('min_stock_level', parseInt(editingProduct.min_stock_level));
    if (editFile) formData.append('image', editFile);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        cancelEditing();
        fetchProducts();
      } else {
        alert("Failed to update product details.");
      }
    } catch (err) {
      console.error("Update request error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product from registry
  const handleDelete = async (id) => {
    if (window.confirm("CRITICAL WARNING: Terminate this item from MSI Inventory?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        if(response.ok) fetchProducts();
      } catch (err) { alert("Constraint Failure: Item is currently linked to orders."); }
    }
  };

  // Animation Variants for Page Content
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="p-8 space-y-12 bg-black min-h-screen text-white font-sans selection:bg-red-600"
    >
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900 pb-12">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter border-l-8 border-red-600 pl-6">
            Inventory <span className="text-red-600">Control</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-2 italic">Global TECH Hardware Registry</p>
        </motion.div>
        
        {/* --- LIVE SEARCH INTERFACE --- */}
        <motion.div whileHover={{ scale: 1.02 }} className="relative w-full md:w-80 group">
          <input 
            type="text" 
            placeholder="SEARCH PRODUCT ..." 
            className="w-full bg-gray-900 border-2 border-gray-800 p-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-red-600 transition-all placeholder:text-gray-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-4 text-gray-700 font-black">SEARCH</div>
        </motion.div>
      </div>
      
      {/* --- ADD NEW HARDWARE FORM --- */}
      <motion.div 
        whileHover={{ borderColor: 'rgba(220, 38, 38, 0.2)' }}
        className="bg-gray-900/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[100px] pointer-events-none"></div>
        <h2 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em] flex items-center">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-ping"></span> Register New TECH Hardware
        </h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <input type="text" placeholder="Component Name" required className="bg-black border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-600 transition" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
          <input type="number" placeholder="Unit Price (Rs.)" required className="bg-black border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-600 transition" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
          <input type="number" placeholder="Initial Units" required className="bg-black border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-600 transition" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
          
          <div className="flex items-center space-x-4 bg-black border border-gray-800 p-2 rounded-xl">
             <input type="file" accept="image/*" required className="hidden" id="fileInput" onChange={handleFileChange} />
             <label htmlFor="fileInput" className="bg-gray-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-red-600 transition">Upload Asset</label>
             {previewUrl && <motion.img initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-gray-700" />}
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isSubmitting}
            className="md:col-span-4 bg-red-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl shadow-red-900/10 disabled:opacity-50 disabled:cursor-wait"
          >
            {isSubmitting ? "Syncing Data Stream..." : "Authorize Registry Update"}
          </motion.button>
        </form>
      </motion.div>

      {/* --- MASTER INVENTORY DATA TABLE --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-gray-900 rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-gray-600 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
            <tr>
              <th className="p-8 text-center">Visualization</th>
              <th className="p-8">Hardware Specification</th>
              <th className="p-8">Market Price</th>
              <th className="p-8">Inventory Velocity</th>
              <th className="p-8 text-center">Protocol Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.03] transition-all group border-b border-transparent">
                <td className="p-8">
                  <div className="w-20 h-14 bg-transparent mx-auto rounded-xl overflow-hidden group-hover:scale-110 transition duration-500">
                    <img 
                      src={p.image_url || "/placeholder.jpg"} 
                      alt={p.name} 
                      className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition duration-500" 
                    />
                  </div>
                </td>
                <td className="p-8">
                    <div className="font-black text-sm uppercase italic tracking-tighter group-hover:text-red-500 transition-colors">{p.name}</div>
                    <div className="text-[9px] text-gray-700 font-bold uppercase mt-1 tracking-widest">Serial Verified</div>
                </td>
                <td className="p-8">
                    <div className="text-white font-black text-sm">Rs. {parseFloat(p.price).toLocaleString()}</div>
                    <div className="text-[8px] text-green-700 font-black uppercase">Tax Included</div>
                </td>
                <td className="p-8">
                  <div className={`inline-flex flex-col`}>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase border shadow-sm ${p.stock_quantity <= p.min_stock_level ? 'bg-red-950/40 text-red-500 border-red-900 animate-pulse shadow-red-900/20' : 'bg-green-900/20 text-green-500 border-green-900/20'}`}>
                        {p.stock_quantity} Units Fixed
                      </span>
                  </div>
                </td>
                <td className="p-8">
                    <div className="flex justify-center space-x-6">
                        <button onClick={() => startEditing(p)} className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition tracking-widest underline decoration-transparent hover:decoration-white">Override</button>
                        <button onClick={() => handleDelete(p.id)} className="text-[9px] font-black uppercase text-red-900 hover:text-red-500 transition tracking-widest underline decoration-transparent hover:decoration-red-500">Terminate</button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* --- EDIT MODAL TERMINAL --- */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border-2 border-gray-800 w-full max-w-2xl p-12 rounded-[2.5rem] shadow-3xl relative overflow-hidden selection:bg-red-600"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[100px] pointer-events-none"></div>
              <h2 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">Edit <span className="text-red-600">Product Info</span></h2>
              
              <form onSubmit={handleUpdateProduct} className="space-y-8">
                
                {/* IMAGE UPDATE SECTION */}
                <div className="flex flex-col items-center justify-center bg-black border border-gray-800 p-6 rounded-2xl space-y-4">
                    <motion.img 
                      key={editPreviewUrl}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={editPreviewUrl || "/placeholder.jpg"} 
                      alt="Current Visualization" 
                      className="w-40 h-28 object-contain rounded-xl shadow-xl"
                    />
                    <input type="file" accept="image/*" className="hidden" id="editFileInput" onChange={handleEditFileChange} />
                    <label htmlFor="editFileInput" className="bg-gray-800 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-red-600 transition-colors">
                        Change Component Image
                    </label>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest pl-1">Hardware Specification Name</label>
                  <input type="text" className="w-full bg-black border border-gray-800 p-5 rounded-2xl outline-none focus:border-red-600 font-bold text-sm" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest pl-1">Price (Rs.)</label>
                    <input type="number" className="w-full bg-black border border-gray-800 p-5 rounded-2xl font-bold" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest pl-1">Stock Units</label>
                    <input type="number" className="w-full bg-black border border-gray-800 p-5 rounded-2xl font-bold" value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})} />
                  </div>
                </div>
                <div className="flex space-x-6 pt-8 border-t border-gray-800">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl shadow-red-900/20 disabled:opacity-50"
                  >
                      {isSubmitting ? "Updating Mainframe..." : "Execute Changes"}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={cancelEditing} 
                    className="px-10 bg-gray-800 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 transition"
                  >
                      Abort
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}