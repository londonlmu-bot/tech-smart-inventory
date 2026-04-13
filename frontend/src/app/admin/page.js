"use client";
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
// --- REPORT GENERATION LIBRARIES ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [aiForecast, setAiForecast] = useState(null);
  const [alerts, setAlerts] = useState([]); // State for Critical Stock Alerts
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes, aiRes, ordersRes, alertRes] = await Promise.all([
        fetch('https://tech-smart-inventory-production.up.railway.app/api/admin-stats'),
        fetch('https://tech-smart-inventory-production.up.railway.app/api/sales-stats'),
        fetch('https://tech-smart-inventory-production.up.railway.app/api/ai-forecast'),
        fetch('https://tech-smart-inventory-production.up.railway.app/api/orders'),
        fetch('https://tech-smart-inventory-production.up.railway.app/api/inventory/alerts') // Fetching low stock alerts
      ]);

      setStats(await statsRes.json());
      setSalesData(await salesRes.json());
      setOrders(await ordersRes.json());
      setAlerts(await alertRes.json());
      if (aiRes.ok) setAiForecast(await aiRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- PDF REPORT GENERATION LOGIC ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // 1. Header Section
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // MSI Red
    doc.text("MSI SMART INVENTORY", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("STRATEGIC OPERATIONAL INTELLIGENCE REPORT", 14, 28);
    doc.text(`GENERATED: ${timestamp}`, 145, 28);

    // 2. Executive Summary Metrics
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Executive Summary", 14, 55);

    const summaryTable = [
      ["Metric", "Current Intelligence Value"],
      ["Total Revenue", `Rs. ${stats?.revenue?.toLocaleString() || '0'}`],
      ["AI Predicted Growth", aiForecast?.growth_rate || 'N/A'],
      ["Global Orders", stats?.orders?.toString() || '0'],
      ["Low Stock Alerts", `${alerts.length} Critical Units`]
    ];

    autoTable(doc, {
      startY: 60,
      head: [summaryTable[0]],
      body: summaryTable.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // 3. Acquisition Registry Table
    doc.setFontSize(14);
    doc.text("Acquisition Registry (Recent Orders)", 14, doc.lastAutoTable.finalY + 15);

    const orderRows = orders.map(order => [
      `#ORD-${String(order.id).padStart(5, '0')}`,
      order.customer_name,
      `Rs. ${parseFloat(order.total_amount).toLocaleString()}`,
      order.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Order ID", "Personnel Name", "Transaction Value", "Deployment Status"]],
      body: orderRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      styles: { fontSize: 9 }
    });

    // 4. Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`CONFIDENTIAL - MSI INTEL-LINK SYSTEM | Page ${i} of ${pageCount}`, 14, 285);
    }

    doc.save(`MSI_Intelligence_Report_${new Date().getTime()}.pdf`);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`https://tech-smart-inventory-production.up.railway.app/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData(); 
    } catch (err) { console.error("Status Update Failed:", err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black animate-pulse tracking-[0.5em]">
      INITIALIZING COMMAND CENTER...
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            System <span className="text-red-600">Overview</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-2 italic">
            Operational Intelligence Terminal
          </p>
        </div>
        
        <div className="flex gap-3 text-white">
          <Link href="/admin/inventory" className="bg-white/5 border border-gray-800 hover:border-red-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            + New Stock
          </Link>
          <button 
            onClick={generatePDF}
            className="bg-red-600 hover:bg-white hover:text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20"
          >
            Generate Report
          </button>
        </div>
      </header>

      {/* --- 🚨 CRITICAL STOCK ALERTS PANEL --- */}
      {alerts.length > 0 && (
        <div className="bg-red-600/10 border border-red-600/30 p-6 rounded-[2.5rem] relative overflow-hidden animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
             <h2 className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">Critical Reorder Alerts Detected</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((item) => (
              <div key={item.id} className="bg-black/60 p-4 rounded-xl border border-red-600/20 flex justify-between items-center group hover:border-red-600 transition-all">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-white">{item.name}</p>
                  <p className="text-[8px] text-red-500 font-bold uppercase">Stock: {item.stock_quantity} / Min: {item.min_stock_level}</p>
                </div>
                <Link href="/admin/inventory" className="text-[8px] font-black bg-red-600 px-3 py-1 rounded-md text-white uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all">Restock</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
        <StatCard title="Total Revenue" value={`Rs. ${stats?.revenue?.toLocaleString()}`} color="text-white" />
        <StatCard title="AI Forecast (May)" value={aiForecast ? `Rs. ${aiForecast.next_month_prediction?.toLocaleString()}` : "Calculating..."} color="text-red-500" isAI={true} />
        <StatCard title="Global Orders" value={stats?.orders} color="text-white" />
        <StatCard title="Stock Status" value={`${alerts.length} Alerts`} color={alerts.length > 0 ? "text-red-600" : "text-green-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- REVENUE PERFORMANCE CHART --- */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Revenue Performance Trend</h2>
            <div className="flex items-center space-x-4 text-[8px] font-bold uppercase text-gray-400">
               <span className="flex items-center"><div className="w-2 h-0.5 bg-red-600 mr-2"></div>Actual</span>
               <span className="flex items-center"><div className="w-2 h-0.5 bg-blue-500 mr-2 border-t border-dashed"></div>AI Forecast</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="month" stroke="#444" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px', color: '#fff' }} />
                <Area type="monotone" dataKey={(d) => d.isForecast ? null : d.revenue} stroke="#dc2626" strokeWidth={4} fill="url(#colorRev)" name="Actual Revenue" connectNulls={false} />
                <Area type="monotone" dataKey={(d) => d.isForecast || salesData[salesData.indexOf(d)+1]?.isForecast ? d.revenue : null} stroke="#3b82f6" strokeDasharray="8 5" strokeWidth={4} fill="url(#colorForecast)" name="AI Prediction" dot={(p) => p.payload.isForecast ? <circle cx={p.cx} cy={p.cy} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} /> : null} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- AI INSIGHTS --- */}
        <div className="bg-red-950/5 border border-red-900/20 p-10 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center space-x-2 mb-8">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
               <h2 className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em]">AI Strategic Advice</h2>
            </div>
            {aiForecast ? (
              <div className="space-y-6 text-white">
                <div><p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Growth Velocity</p><p className="text-4xl font-black">{aiForecast.growth_rate}</p></div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 italic text-sm text-gray-300">"{aiForecast.recommendation}"</div>
              </div>
            ) : <p className="text-gray-600 italic text-xs uppercase tracking-widest">Computing market trends...</p>}
          </div>
          <div className="pt-6 border-t border-red-900/20 mt-6 text-white"><p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.5em]">TECH Intel Link</p></div>
        </div>
      </div>

      {/* --- ACQUISITION REGISTRY --- */}
      <div className="bg-gray-900/30 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <h2 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-widest">Acquisition Registry</h2>
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <p className="text-center py-10 text-gray-700 text-[10px] font-black uppercase tracking-widest">No active deployments detected.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-black/40 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-center group hover:border-red-600/30 transition-all gap-4">
                  <div className="flex items-center space-x-6 text-white text-left">
                    <div>
                      <p className="text-[9px] text-gray-600 font-black mb-1">REF: #ORD-{String(order.id).padStart(5, '0')}</p>
                      <p className="text-xs font-bold uppercase tracking-tight">{order.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-10 text-white">
                    <p className="text-sm font-black text-red-600">Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
                    <div className="flex items-center bg-black border border-gray-800 rounded-xl overflow-hidden">
                       {['Processing', 'Shipped', 'Delivered'].map((s) => (
                         <button 
                           key={s} 
                           onClick={() => updateStatus(order.id, s)}
                           className={`px-4 py-2 text-[8px] font-black uppercase transition-all ${order.status === s ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, isAI }) {
  return (
    <div className={`bg-gray-900/50 p-8 rounded-3xl border border-gray-800 shadow-xl group hover:border-red-600/50 transition-all relative overflow-hidden`}>
      {isAI && <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 rounded-full blur-2xl"></div>}
      <p className="text-[9px] font-black text-gray-500 uppercase mb-3 tracking-widest text-left">{title}</p>
      <p className={`text-2xl font-black tracking-tighter text-left ${color}`}>{value || '0'}</p>
    </div>
  );
}
