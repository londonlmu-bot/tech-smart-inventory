"use client";
import React, { useEffect, useState } from 'react';

/**
 * OrdersPage Component (Admin View)
 * Functionality: Visualizes global transaction history and provides granular control
 * over order lifecycle management within the MSI Intelligence OS.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronizes administrative order logs from the backend
  const fetchOrders = () => {
    fetch('https://tech-smart-inventory-production.up.railway.app/api/orders')
      .then(res => {
        if (!res.ok) throw new Error("Failed to establish data stream");
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Order synchronization error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /**
   * Updates the operational status of a specific order log.
   * Progression mapping: Processing -> Shipped -> Delivered.
   */
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://tech-smart-inventory-production.up.railway.app/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh local data stream to reflect changes immediately
        fetchOrders();
      }
    } catch (err) {
      console.error("Critical: Order status update failed.", err);
    }
  };

  // Strategic color coding for order status visualization
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-950/20 text-green-500 border-green-900/30';
      case 'shipped': return 'bg-blue-950/20 text-blue-500 border-blue-900/30';
      case 'processing': return 'bg-red-950/20 text-red-500 border-red-900/30 animate-pulse';
      default: return 'bg-gray-800 text-gray-500 border-gray-700';
    }
  };

  return (
    <div className="p-4 space-y-10 animate-in fade-in duration-700">
      
      {/* --- ADMINISTRATIVE HEADER --- */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">
            Acquisition <span className="text-red-600">Archives</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] italic">
            Global MSI Hardware Transaction Logs
          </p>
        </div>
      </div>

      {/* --- MASTER ORDER TABLE --- */}
      <div className="bg-gray-950/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-gray-600 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
            <tr>
              <th className="p-8">Reference ID</th>
              <th className="p-8">Personnel Identity</th>
              <th className="p-8">Timestamp</th>
              <th className="p-8">Total Valuation</th>
              <th className="p-8 text-center">Status Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-32 text-center">
                  <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-6 text-[10px] font-black text-gray-700 uppercase tracking-[1em]">Scanning Core Logs...</p>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-32 text-center text-gray-800 italic font-black uppercase text-xs tracking-[1em]">
                  No transaction records detected in mainframe.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-all group relative">
                  <td className="p-8 font-mono text-gray-600 text-[11px] tracking-widest">
                    #ORD-{String(order.id).padStart(5, '0')}
                  </td>
                  <td className="p-8">
                    <div className="font-black text-white group-hover:text-red-500 transition-colors uppercase text-sm italic tracking-tight">
                      {order.customer_name || 'Unauthorized_User'}
                    </div>
                  </td>
                  <td className="p-8 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                    {new Date(order.order_date).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="p-8 font-black text-white text-base italic tracking-tighter">
                    Rs. {parseFloat(order.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-center space-y-4">
                      {/* Operational Status Label */}
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border shadow-2xl tracking-widest ${getStatusStyle(order.status)}`}>
                        {order.status || 'Offline'}
                      </span>
                      
                      {/* Quick Status Override Interface */}
                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {['Processing', 'Shipped', 'Delivered'].map(s => (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(order.id, s)}
                            className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${order.status === s ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-white'}`}
                          >
                            {s[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Technical Metadata Note */}
      <footer className="pt-10 text-center opacity-30 select-none">
        <p className="text-[8px] text-gray-500 font-black uppercase tracking-[1em]">MSI Personnel Registry v2.6 // Terminal_01</p>
      </footer>
    </div>
  );
}