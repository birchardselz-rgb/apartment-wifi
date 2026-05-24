'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Users, Wifi, Settings, Plus, Edit3, Trash2, Check, X, Download } from 'lucide-react';
import { ensureInit, getStaff, addStaff, updateStaff, resetAllData, PACKAGES } from '@/lib/mock-data';
import { exportAllToExcel } from '@/lib/excel';
import type { Staff } from '@/types';

export default function SystemPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tab, setTab] = useState<'staff' | 'packages' | 'settings'>('staff');
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'sales' as Staff['role'] });

  useEffect(() => {
    ensureInit().then(() => {
      setStaff(getStaff());
      setReady(true);
    });
  }, []);

  const handleAdd = async () => {
    if (!newStaff.name || !newStaff.phone) return;
    const id = (newStaff.role === 'sales' ? 'S' : newStaff.role === 'maintenance' ? 'M' : newStaff.role === 'admin' ? 'A' : 'SU') +
      String(staff.filter(s => s.role === newStaff.role).length + 1).padStart(3, '0');
    await addStaff({ id, name: newStaff.name, phone: newStaff.phone, role: newStaff.role, status: 'active', joinDate: new Date().toISOString().slice(0, 10) });
    setStaff(getStaff());
    setShowAdd(false);
    setNewStaff({ name: '', phone: '', role: 'sales' });
  };

  const toggleStatus = async (id: string) => {
    const s = staff.find(m => m.id === id);
    if (s) {
      await updateStaff(id, { status: s.status === 'active' ? 'inactive' : 'active' });
      setStaff(getStaff());
    }
  };

  const handleReset = async () => {
    if (confirm('⚠️ 确认重置所有数据？\n所有客户、订单、线索、工单将恢复为初始演示数据。此操作不可撤销！')) {
      await resetAllData();
      setStaff(getStaff());
      window.location.reload();
    }
  };

  if (!ready) {
    return <div className="max-w-md mx-auto min-h-screen bg-[#0B0F19] flex items-center justify-center text-gray-500 text-sm">加载中...</div>;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0B0F19] pb-20">
      <header className="sticky top-0 z-40 bg-[#0F1524]/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center">
        <button onClick={() => router.push('/')} className="text-gray-400 mr-3"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="font-bold text-white text-base">系统管理</h1><p className="text-[10px] text-gray-500">员工 · 套餐 · 配置</p></div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-4">
        {[
          { k: 'staff', l: '员工管理', icon: Users },
          { k: 'packages', l: '套餐配置', icon: Wifi },
          { k: 'settings', l: '系统设置', icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
              className={`flex items-center space-x-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === t.k ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent'}`}>
              <Icon className="w-4 h-4" /><span>{t.l}</span>
            </button>
          );
        })}
      </div>

      {tab === 'staff' && (
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">共 {staff.length} 名员工</span>
            <button onClick={() => setShowAdd(true)} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-full flex items-center space-x-1">
              <Plus className="w-3 h-3" /><span>添加员工</span>
            </button>
          </div>

          {(['super_admin', 'admin', 'sales', 'maintenance'] as const).map(role => {
            const members = staff.filter(s => s.role === role);
            if (!members.length) return null;
            const roleLabel = { super_admin: '系统管理员', admin: '运营管理', sales: '销售团队', maintenance: '维护团队' }[role];
            return (
              <div key={role}>
                <div className="text-xs text-gray-500 font-bold mb-2">{roleLabel}</div>
                {members.map(m => (
                  <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#131B2E] border border-gray-800 rounded-xl p-3 flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${m.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-600'}`}>
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="text-white text-sm font-bold">{m.name}</div>
                        <div className="text-gray-500 text-[10px]">{m.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>{m.status === 'active' ? '在职' : '离职'}</span>
                      <button onClick={() => toggleStatus(m.id)} className={`text-xs px-2 py-1 rounded-lg ${m.status === 'active' ? 'text-red-400 bg-red-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                        {m.status === 'active' ? '禁用' : '启用'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'packages' && (
        <div className="p-4 space-y-3">
          <div className="text-xs text-gray-500 mb-1">当前宽带套餐配置</div>
          {PACKAGES.map(p => (
            <div key={p.id} className="bg-[#131B2E] border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-white font-bold">{p.name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-800 text-cyan-400 rounded border border-gray-700">{p.speed}</span>
                    <span className="text-[10px] text-gray-500">{p.durationMonths} 个月</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white font-mono">¥{p.price}</div>
                  <div className="text-[10px] text-gray-500">安装费 ¥{p.installationFee}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.features.map(f => (
                  <span key={f} className="text-[10px] bg-gray-800/60 text-gray-400 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 text-xs text-amber-300">
            ⚠️ 套餐修改功能开发中，当前仅支持查看
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="p-4 space-y-3">
          <button onClick={exportAllToExcel} className="w-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl py-3 text-sm font-bold flex items-center justify-center space-x-2 hover:bg-emerald-950/60 transition-colors">
            <Download className="w-4 h-4" /><span>导出全部数据到 Excel</span>
          </button>
          <div className="bg-[#131B2E] border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div><div className="text-white text-sm font-bold">平台名称</div><div className="text-gray-500 text-xs">达维斯网络</div></div>
              <span className="text-[10px] text-gray-600">v2.0</span>
            </div>
            <div className="border-t border-gray-800/60 pt-4">
              <div className="text-white text-sm font-bold mb-2">系统信息</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">运行环境</span><span className="text-gray-300">微信浏览器 / Web</span></div>
                <div className="flex justify-between"><span className="text-gray-500">数据状态</span><span className="text-emerald-400">演示模式</span></div>
                <div className="flex justify-between"><span className="text-gray-500">员工数量</span><span className="text-gray-300">{staff.length} 人</span></div>
                <div className="flex justify-between"><span className="text-gray-500">套餐数量</span><span className="text-gray-300">{PACKAGES.length} 个</span></div>
              </div>
            </div>
            <div className="border-t border-gray-800/60 pt-4">
              <div className="text-white text-sm font-bold mb-2">操作日志</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>2026-05-23 系统管理员 登录系统</div>
                <div>2026-05-22 赵经理 查看营收报表</div>
                <div>2026-05-22 陈师傅 完成工单 TK004</div>
                <div>2026-05-21 李明 新增销售线索</div>
              </div>
            </div>
            <div className="border-t border-gray-800/60 pt-4 space-y-3">
              <button onClick={handleReset} className="w-full bg-red-950/40 border border-red-800/40 text-red-400 rounded-xl py-3 text-sm font-bold hover:bg-red-950/60 transition-colors">
                🗑 重置所有数据（恢复演示数据）
              </button>
              <p className="text-[10px] text-gray-600 text-center">数据保存在浏览器 localStorage，清除浏览器缓存会丢失</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-md bg-[#1A1D2E] rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
              <h2 className="text-lg font-bold text-white mb-4">添加员工</h2>
              <div className="space-y-3">
                <input value={newStaff.name} onChange={e => setNewStaff(f => ({ ...f, name: e.target.value }))} placeholder="姓名 *" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
                <input value={newStaff.phone} onChange={e => setNewStaff(f => ({ ...f, phone: e.target.value }))} placeholder="手机号 *" maxLength={11} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none" />
                <select value={newStaff.role} onChange={e => setNewStaff(f => ({ ...f, role: e.target.value as Staff['role'] }))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none">
                  <option value="sales">销售</option>
                  <option value="maintenance">维护</option>
                  <option value="admin">运营管理</option>
                  <option value="super_admin">系统管理员</option>
                </select>
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl text-gray-400 border border-gray-700 text-sm">取消</button>
                <button onClick={handleAdd} disabled={!newStaff.name || !newStaff.phone} className="flex-1 bg-cyan-500 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40">添加</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
