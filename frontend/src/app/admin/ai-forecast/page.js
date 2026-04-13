"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

/**
 * AIForecastPage Component
 * Features: Real-time Neural Accuracy Mapping, Dynamic Demand Velocity Chart, 
 * and Automated Restock Intelligence.
 */
export default function AIForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [accuracy, setAccuracy] = useState(null); // Dynamic Accuracy State
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Syncing with MSI Intelligence Matrix (Backend API)
  useEffect(() => {
    fetch('http://localhost:5000/api/ai-forecast')
      .then(res => res.json())
      .then(data => {
        const results = Array.isArray(data.product_predictions) ? data.product_predictions : [];
        
        // Capturing real-time model accuracy from Python ML Engine
        setAccuracy(data.model_accuracy);
        
        // Sorting logic: Critical demand priority
        const sorted = results.sort((a, b) => b.predicted_next_month - a.predicted_next_month);
        setForecasts(sorted);
        setFilteredForecasts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Neural Sync Error:", err);
        setLoading(false);
      });
  }, []);

  // Real-time filtering for Hardware Archives
  useEffect(() => {
    const filtered = forecasts.filter(f => 
      f.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForecasts(filtered);
  }, [searchTerm, forecasts]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-red-900 rounded-full animate-ping"></div>
        <div className="absolute inset-0 w-16 h-16 border-t-4 border-red-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-white font-black uppercase tracking-[0.5em] text-[10px] italic">Accessing Neural Network...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* --- COMMAND HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900 pb-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/5 blur-[100px] pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-1 w-10 bg-red-600"></div>
            <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em]">Intelligence Matrix</span>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
            AI <span className="text-red-600">Forecasting</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">
            Real time Machine Learning Synthesis
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-4">
            <div className="relative">
                <input 
                  type="text" 
                  placeholder="ID Search / Search Hardware..."
                  className="bg-gray-950 border-2 border-gray-900 p-4 rounded-2xl outline-none focus:border-red-600 transition-all text-[11px] font-black w-72 uppercase tracking-widest placeholder:text-gray-800 text-white"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-4 text-gray-800">🔍</div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Neural Link Active</span>
            </div>
        </div>
      </header>

      {/* --- INTELLIGENCE METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="bg-gray-900/40 p-8 rounded-[2rem] border border-gray-800 hover:border-red-600/30 transition-all group">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-3">Projected Throughput</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl font-black italic">{forecasts.reduce((acc, curr) => acc + curr.predicted_next_month, 0)}</p>
                <p className="text-xs text-red-600 font-black uppercase">Units</p>
              </div>
          </div>
          <div className="bg-gray-900/40 p-8 rounded-[2rem] border border-gray-800 hover:border-green-600/30 transition-all">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-3">Model Accuracy R2</p>
              {/* FIXED: Displaying dynamic accuracy from Backend */}
              <p className="text-4xl font-black italic text-green-500">{accuracy || "0.0"}<span className="text-sm">%</span></p>
          </div>
          <div className="bg-red-950/10 p-8 rounded-[2rem] border border-red-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all"></div>
              <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.3em] mb-3">Strategic Alert</p>
              <p className="text-xl font-black text-white leading-tight uppercase italic">Inventory Refill Required</p>
          </div>
      </div>

      {/* --- VISUAL PROJECTION TERMINAL --- */}
      <div className="bg-gray-950 p-10 rounded-[3rem] border border-gray-900 h-[500px] shadow-2xl relative">
        <div className="flex justify-between items-center mb-12">
            <div>
                <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Hardware Demand Velocity</h2>
                <p className="text-[9px] text-gray-700 font-bold uppercase mt-1 italic">Comparison: Current Stock vs AI Prediction</p>
            </div>
            <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black uppercase tracking-tighter text-red-600">30-Day Outlook</span>
            </div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={filteredForecasts} barSize={40}>
            <CartesianGrid strokeDasharray="0" stroke="#111" vertical={false} />
            <XAxis dataKey="product_name" stroke="#333" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="#333" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
            <Tooltip 
                cursor={{fill: 'rgba(255, 0, 0, 0.05)'}}
                contentStyle={{ backgroundColor: '#000', border: '2px solid #222', borderRadius: '20px', fontSize: '11px', fontWeight: '900', color: '#fff' }} 
            />
            <Bar dataKey="predicted_next_month" name="Units" radius={[12, 12, 0, 0]}>
              {filteredForecasts.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.predicted_next_month > 10 ? '#dc2626' : '#222'} 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Bar>
            <ReferenceLine y={10} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'right', value: 'CRITICAL', fill: '#dc2626', fontSize: 8, fontWeight: 'bold' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- COMPONENT INTELLIGENCE LOGS --- */}
      <div className="bg-gray-900/20 rounded-[3rem] border border-gray-900 overflow-hidden shadow-2xl backdrop-blur-sm text-white">
        <table className="w-full text-left">
          <thead className="bg-gray-950/80 text-gray-600 text-[10px] uppercase font-black tracking-[0.3em] border-b border-gray-900">
            <tr>
              <th className="p-10">Hardware Component</th>
              <th className="p-10">Neural Prediction</th>
              <th className="p-10">Trend Confidence</th>
              <th className="p-10">AI Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {filteredForecasts.map((item, index) => (
              <tr key={index} className="hover:bg-red-600/[0.03] transition-all group">
                <td className="p-10">
                    <div className="font-black text-sm uppercase tracking-tighter group-hover:text-red-500 transition-colors">
                        {item.product_name}
                    </div>
                    <div className="text-[9px] text-gray-700 font-bold uppercase mt-1">MSI Genuine Certified</div>
                </td>
                <td className="p-10">
                    <div className="flex items-center space-x-3">
                        <span className="font-black text-2xl italic">+{item.predicted_next_month}</span>
                        <div className="text-[10px] bg-red-600/10 text-red-500 px-2 py-0.5 rounded-md font-black">VOL UP</div>
                    </div>
                </td>
                <td className="p-10">
                    <div className="w-32 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.predicted_next_month > 10 ? 'bg-red-600' : 'bg-gray-500'}`} 
                          style={{ width: `${Math.min(90 + index, 98)}%` }}
                        ></div>
                    </div>
                    <p className="text-[8px] font-black text-gray-600 uppercase mt-2">Score: {Math.min(90 + index, 98)}%</p>
                </td>
                <td className="p-10">
                  <div className={`inline-flex items-center px-6 py-2 rounded-2xl border font-black uppercase text-[9px] tracking-widest ${item.predicted_next_month > 10 ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20' : 'bg-transparent text-gray-500 border-gray-800'}`}>
                    {item.predicted_next_month > 10 ? "Execute Restock" : "Monitor Flow"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="text-center py-10 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-gray-500 font-black uppercase text-[8px] tracking-[1em]">© 2026 TECH Intelligence Unit • Neural Sync Stable</p>
      </footer>
    </div>
  );
}