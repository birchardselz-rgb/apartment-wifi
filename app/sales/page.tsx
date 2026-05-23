'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, User, MapPin, Plus, Search, Filter, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, Users } from 'lucide-react';
import { ensureInit, getLeads, getClients, getStaffByRole, addLead, updateLead, genId } from '@/lib/mock-data';
import type { SalesLead } from '@/types';

const STATUS_LABELS: Record<string, string> = { new: '新线索', contacted: '已联系', negotiating: '洽谈中', converted: '已成交', lost: '已流失' };
const STATUS_COLORS: Record<string, string> = { new: 'bg-cyan-950/50 text-cyan-400', contacted: 'bg-blue-950/50 text-blue-400', negotiating: 'bg-amber-950/50 text-amber-400', converted: 'bg-emerald-950/50 text-emerald-400', lost: 'bg-red-950/50 text-red-400' };

export default function SalesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [tab, setTab] = useState<'leads' | 'stats'>('leads');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', address: '', notes: '' });

  useEffect(() => {
    ensureInit().then(() => {
      setLeads(getLeads());
      setClientsCount(getClients().length);
      setReady(true);
    });
  }, []);

  const salesStaff = ready ? getStaffByRole('sales') : [];
  const filtered = leads.filter(l => l.name.includes(search) || l.phone.includes(search));
  const activeLeads = leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const conversionRate = leads.length ? Math.round(converted / leads.length * 100) : 0;

  const handleAdd = async () => {
    if (!newLead.name || !newLead.phone) return;
    await addLead({
      id: genId('lead'),
      name: newLead.name,
      phone: newLead.phone,
      address: newLead.address || undefined,
      source: 'self_visit',
      status: 'new',
      notes: newLead.notes,
      assignedTo: salesStaff[0]?.id || 'S001',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setLeads(getLeads());
    setShowModal(false);
    setNewLead({ name: '', phone: '', address: '', notes: '' });
  };

  const handleStatus = async (id: string, status: SalesLead['status']) => {
    if (status === 'converted') {
      // Convert lead to client
      const lead = leads.find(l => l.id === id);
      if (lead) {
        alert(`🎉 已将 ${lead.name} 转为正式客户！\n客户手机：${lead.phone}`);
      }
    }
    await updateLead(id, { status, updatedAt: new Date().toISOString().slice(0, 10) });
    setLeads(getLeads());
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0B0F19] pb-20">
      <header className="sticky top-0 z-40 bg-[#0F1524]/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center">
        <button onClick={() => router.push('/')} className="text-gray-400 mr-3"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="font-bold text-white text-base">销售端</h1><p className="text-[10px] text-gray-500">线索管理 · 客户跟进</p></div>
        <button onClick={() => setShowModal(true)} className="ml-auto bg-cyan-500 text-white p-2 rounded-xl"><Plus className="w-5 h-5" /></button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-4">
        <button onClick={() => setTab('leads')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'leads' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent'}`}>销售线索</button>
        <button onClick={() => setTab('stats')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'stats' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent'}`}>业绩统计</button>
      </div>

      {tab === 'leads' && (
        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索客户姓名或手机号..." className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
          </div>

          {/* Stats bar */}
          <div className="flex space-x-3 text-xs">
            <div className="bg-[#131B2E] border border-gray-800 rounded-xl px-3 py-2 flex-1 text-center"><div className="text-gray-400">待跟进</div><div className="text-cyan-400 font-bold text-lg">{activeLeads}</div></div>
            <div className="bg-[#131B2E] border border-gray-800 rounded-xl px-3 py-2 flex-1 text-center"><div className="text-gray-400">本月成交</div><div className="text-emerald-400 font-bold text-lg">{converted}</div></div>
            <div className="bg-[#131B2E] border border-gray-800 rounded-xl px-3 py-2 flex-1 text-center"><div className="text-gray-400">转化率</div><div className="text-amber-400 font-bold text-lg">{conversionRate}%</div></div>
          </div>

          {/* Leads */}
          <AnimatePresence>
            {filtered.map(lead => (
              <motion.div key={lead.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#131B2E] border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-bold text-sm flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-gray-500" />{lead.name}</div>
                    <div className="text-gray-500 text-xs flex items-center mt-0.5"><Phone className="w-3 h-3 mr-1" />{lead.phone}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                </div>
                {lead.address && <div className="text-gray-500 text-xs flex items-center"><MapPin className="w-3 h-3 mr-1" />{lead.address}</div>}
                {lead.notes && <div className="text-gray-400 text-xs bg-gray-900/50 rounded-lg p-2">{lead.notes}</div>}
                <div className="flex space-x-2 pt-1">
                  {lead.status === 'new' && <button onClick={() => handleStatus(lead.id, 'contacted')} className="flex-1 text-xs bg-blue-950/50 text-blue-400 border border-blue-800/30 rounded-lg py-1.5">标记已联系</button>}
                  {lead.status === 'contacted' && <button onClick={() => handleStatus(lead.id, 'negotiating')} className="flex-1 text-xs bg-amber-950/50 text-amber-400 border border-amber-800/30 rounded-lg py-1.5">进入洽谈</button>}
                  {lead.status === 'negotiating' && (
                    <>
                      <button onClick={() => handleStatus(lead.id, 'converted')} className="flex-1 text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 rounded-lg py-1.5">成交</button>
                      <button onClick={() => handleStatus(lead.id, 'lost')} className="flex-1 text-xs bg-red-950/50 text-red-400 border border-red-800/30 rounded-lg py-1.5">流失</button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {tab === 'stats' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[#131B2E] to-[#0F1524] border border-gray-800 rounded-xl p-4">
              <Users className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-white">{clientsCount}</div>
              <div className="text-xs text-gray-500">总客户数</div>
            </div>
            <div className="bg-gradient-to-br from-[#131B2E] to-[#0F1524] border border-gray-800 rounded-xl p-4">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">{converted}</div>
              <div className="text-xs text-gray-500">累计成交</div>
            </div>
            <div className="bg-gradient-to-br from-[#131B2E] to-[#0F1524] border border-gray-800 rounded-xl p-4">
              <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white">{conversionRate}%</div>
              <div className="text-xs text-gray-500">转化率</div>
            </div>
            <div className="bg-gradient-to-br from-[#131B2E] to-[#0F1524] border border-gray-800 rounded-xl p-4">
              <Clock className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">{activeLeads}</div>
              <div className="text-xs text-gray-500">跟进中</div>
            </div>
          </div>

          <div className="bg-[#131B2E] border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">销售人员业绩</h3>
            {salesStaff.map(s => {
              const myLeads = leads.filter(l => l.assignedTo === s.id);
              const myConverted = myLeads.filter(l => l.status === 'converted').length;
              return (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-800/60 last:border-0">
                  <div><div className="text-white text-sm">{s.name}</div><div className="text-gray-500 text-[10px]">{myLeads.length} 条线索</div></div>
                  <div className="text-emerald-400 font-bold">{myConverted} 成交</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setShowModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-md bg-[#1A1D2E] rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
              <h2 className="text-lg font-bold text-white mb-4">新增销售线索</h2>
              <div className="space-y-3">
                <input value={newLead.name} onChange={e => setNewLead(f => ({ ...f, name: e.target.value }))} placeholder="客户姓名 *" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
                <input value={newLead.phone} onChange={e => setNewLead(f => ({ ...f, phone: e.target.value }))} placeholder="手机号 *" maxLength={11} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
                <input value={newLead.address} onChange={e => setNewLead(f => ({ ...f, address: e.target.value }))} placeholder="地址" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
                <textarea value={newLead.notes} onChange={e => setNewLead(f => ({ ...f, notes: e.target.value }))} placeholder="备注信息" rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none resize-none" />
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-gray-400 border border-gray-700 text-sm">取消</button>
                <button onClick={handleAdd} disabled={!newLead.name || !newLead.phone} className="flex-1 bg-cyan-500 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">添加线索</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
