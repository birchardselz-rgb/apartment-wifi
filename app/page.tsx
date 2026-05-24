'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wifi, TrendingUp, Wrench, BarChart3, Shield } from 'lucide-react';

const ROLES = [
  { id: 'client',      label: '客户端',     desc: '套餐浏览 · 在线续费 · 故障报修',   icon: Wifi,      color: 'from-cyan-500 to-blue-600',     gradient: 'from-cyan-950/30 to-blue-950/30' },
  { id: 'sales',       label: '销售端',     desc: '线索管理 · 客户跟进 · 业绩统计',   icon: TrendingUp, color: 'from-emerald-500 to-teal-600',  gradient: 'from-emerald-950/30 to-teal-950/30' },
  { id: 'maintenance', label: '维护端',     desc: '工单处理 · 故障诊断 · 设备巡检',   icon: Wrench,     color: 'from-amber-500 to-orange-600',  gradient: 'from-amber-950/30 to-orange-950/30' },
  { id: 'admin',       label: '后台数据端', desc: '营收看板 · 数据统计 · 趋势分析',   icon: BarChart3,  color: 'from-purple-500 to-pink-600',   gradient: 'from-purple-950/30 to-pink-950/30' },
  { id: 'system',      label: '系统管理',   desc: '员工管理 · 套餐配置 · 权限控制',   icon: Shield,     color: 'from-red-500 to-rose-600',      gradient: 'from-red-950/30 to-rose-950/30' },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0B0F19] pb-8">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4">
          <Wifi className="w-9 h-9 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">达维斯网络</h1>
        <p className="text-gray-500 text-sm mt-1">全链路数字化运营管理平台</p>
      </header>

      {/* Role Grid */}
      <div className="px-4 space-y-3">
        {ROLES.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => router.push(`/${role.id}`)}
              className={`w-full text-left bg-gradient-to-r ${role.gradient} border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex items-center space-x-4 transition-all duration-200 active:scale-[0.98]`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-base">{role.label}</div>
                <div className="text-gray-500 text-xs mt-0.5 truncate">{role.desc}</div>
              </div>
              <div className="text-gray-600 text-lg">{'>'}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Info */}
      <p className="text-center text-[10px] text-gray-700 mt-8 px-4">达维斯网络 v2.0 · 微信端管理平台 · 数据仅供演示</p>
    </div>
  );
}
