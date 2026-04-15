"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  /**
   * Synchronizes and prioritizes the personnel registry.
   * Admins are sorted to the top for immediate oversight.
   */
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // --- LOGIC: Sort Admins to the top ---
        const sortedUsers = data.sort((a, b) => {
          if (a.role === 'admin' && b.role !== 'admin') return -1;
          if (a.role !== 'admin' && b.role === 'admin') return 1;
          return 0;
        });
        setUsers(sortedUsers);
      } else {
        setUsers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("User sync error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // DELETE USER PROTOCOL
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'TERMINATE USER?',
      text: "This action will revoke all access for this personnel.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0a0a0a',
      color: '#fff',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#333',
      confirmButtonText: 'YES, TERMINATE'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          Swal.fire({ title: 'TERMINATED', icon: 'success', background: '#0a0a0a', color: '#fff' });
          fetchUsers();
        }
      }
    });
  };

  // UPDATE USER PROTOCOL
  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingUser.name, email: editingUser.email, role: editingUser.role })
    });

    if (res.ok) {
      setEditingUser(null);
      Swal.fire({ title: 'REGISTRY UPDATED', icon: 'success', background: '#0a0a0a', color: '#fff' });
      fetchUsers();
    }
  };

  if (loading) return <div className="text-red-600 font-black text-center py-20 animate-pulse uppercase tracking-[0.5em]">Scanning Personnel Registry...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <header className="border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Personnel <span className="text-red-600">Registry</span></h1>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-2 italic">Global User Authority Control</p>
      </header>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black text-gray-600 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
            <tr>
              <th className="p-8">Identity Name</th>
              <th className="p-8">Digital Mail</th>
              <th className="p-8">Authority Role</th>
              <th className="p-8 text-center">Protocol Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="p-8 font-black uppercase text-sm italic tracking-tight group-hover:text-red-500 transition-colors">{u.name}</td>
                <td className="p-8 text-xs text-gray-500">{u.email}</td>
                <td className="p-8">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${u.role === 'admin' ? 'bg-red-600/10 text-red-500 border-red-600/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-gray-800 text-gray-500 border-white/5'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex justify-center space-x-4">
                    <button onClick={() => setEditingUser(u)} className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition tracking-widest">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-[9px] font-black uppercase text-red-900 hover:text-red-500 transition tracking-widest">Terminate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-950 border border-white/10 p-12 rounded-[3rem] w-full max-w-lg relative overflow-hidden">
              <h2 className="text-2xl font-black uppercase italic mb-8">Edit <span className="text-red-600">Personnel</span></h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-widest">Full Name</label>
                  <input type="text" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-600 text-sm" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-widest">Email Address</label>
                  <input type="email" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-600 text-sm" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-500 block mb-2 tracking-widest">Role Selection</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-600 text-sm" value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-red-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">Save Changes</button>
                  <button type="button" onClick={() => setEditingUser(null)} className="px-8 bg-gray-900 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
