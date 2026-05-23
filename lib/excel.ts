import * as XLSX from 'xlsx';
import { getPackages, getStoreData, importStoreData, type StoreData } from './mock-data';
import type { Client, Order, SalesLead, Ticket, Staff, BroadbandPackage } from '@/types';

// ============================================================
// Excel 导出 — 全部数据导出为一个多 Sheet 工作簿
// ============================================================
export function exportAllToExcel(): void {
  const data = getStoreData();

  const wb = XLSX.utils.book_new();

  // Sheet 1: 客户信息
  const clientsSheet = XLSX.utils.json_to_sheet(formatClients(data.clients));
  XLSX.utils.book_append_sheet(wb, clientsSheet, '客户信息');

  // Sheet 2: 订单记录
  const ordersSheet = XLSX.utils.json_to_sheet(data.orders);
  XLSX.utils.book_append_sheet(wb, ordersSheet, '订单记录');

  // Sheet 3: 销售线索
  const leadsSheet = XLSX.utils.json_to_sheet(formatLeads(data.leads));
  XLSX.utils.book_append_sheet(wb, leadsSheet, '销售线索');

  // Sheet 4: 维护工单
  const ticketsSheet = XLSX.utils.json_to_sheet(formatTickets(data.tickets));
  XLSX.utils.book_append_sheet(wb, ticketsSheet, '维护工单');

  // Sheet 5: 员工信息
  const staffSheet = XLSX.utils.json_to_sheet(formatStaff(data.staff));
  XLSX.utils.book_append_sheet(wb, staffSheet, '员工信息');

  // Sheet 6: 套餐配置
  const pkgSheet = XLSX.utils.json_to_sheet(formatPackages(getPackages()));
  XLSX.utils.book_append_sheet(wb, pkgSheet, '套餐配置');

  // 生成并下载
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `寓网数据_${dateStr}.xlsx`);
}

// ============================================================
// Excel 导入 — 从上传的 Excel 文件恢复所有数据
// ============================================================
export function importFromExcel(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return reject('无法读取文件');

        const wb = XLSX.read(data, { type: 'array' });

        // 从各 Sheet 解析数据
        const rawClients = XLSX.utils.sheet_to_json<any>(wb.Sheets['客户信息'] || [], { defval: '' });
        const rawOrders = XLSX.utils.sheet_to_json<any>(wb.Sheets['订单记录'] || [], { defval: '' });
        const rawLeads = XLSX.utils.sheet_to_json<any>(wb.Sheets['销售线索'] || [], { defval: '' });
        const rawTickets = XLSX.utils.sheet_to_json<any>(wb.Sheets['维护工单'] || [], { defval: '' });
        const rawStaff = XLSX.utils.sheet_to_json<any>(wb.Sheets['员工信息'] || [], { defval: '' });

        // 还原中文表头 → 字段名
        const clients: Client[] = rawClients.map(r => ({
          id: r.id || '',
          name: r.客户姓名 || r.name || '',
          phone: String(r.手机号 || r.phone || ''),
          address: r.地址 || r.address || '',
          roomNo: r.房号 || r.roomNo || '',
          packageId: r.套餐ID || r.packageId || '',
          status: r.状态 || r.status || 'active',
          installDate: r.安装日期 || r.installDate || undefined,
          expiryDate: r.到期日期 || r.expiryDate || undefined,
          createdAt: r.创建日期 || r.createdAt || new Date().toISOString().slice(0, 10),
          salesPersonId: r.销售员ID || r.salesPersonId || undefined,
        }));

        const orders: Order[] = rawOrders.map(r => ({
          id: r.id || '',
          clientId: r.clientId || '',
          clientName: r.客户姓名 || r.clientName || '',
          phone: String(r.手机号 || r.phone || ''),
          packageId: r.packageId || '',
          packageName: r.套餐名称 || r.packageName || '',
          amount: Number(r.套餐金额 || r.amount || 0),
          installationFee: Number(r.安装费 || r.installationFee || 0),
          totalAmount: Number(r.合计金额 || r.totalAmount || 0),
          status: r.状态 || r.status || 'pending_payment',
          createdAt: r.下单日期 || r.createdAt || new Date().toISOString().slice(0, 10),
          paidAt: r.付款日期 || r.paidAt || undefined,
          salesPersonId: r.销售员ID || r.salesPersonId || undefined,
        }));

        const leads: SalesLead[] = rawLeads.map(r => ({
          id: r.id || '',
          name: r.客户姓名 || r.name || '',
          phone: String(r.手机号 || r.phone || ''),
          address: r.地址 || r.address || '',
          source: r.来源 || r.source || 'self_visit',
          status: r.跟进状态 || r.status || 'new',
          notes: r.备注 || r.notes || '',
          assignedTo: r.负责销售 || r.assignedTo || '',
          createdAt: r.创建日期 || r.createdAt || new Date().toISOString().slice(0, 10),
          updatedAt: r.更新日期 || r.updatedAt || new Date().toISOString().slice(0, 10),
        }));

        const tickets: Ticket[] = rawTickets.map(r => ({
          id: r.id || '',
          clientId: r.clientId || '',
          clientName: r.客户姓名 || r.clientName || '',
          phone: String(r.手机号 || r.phone || ''),
          address: r.地址 || r.address || '',
          issueType: r.故障类型 || r.issueType || 'other',
          description: r.故障描述 || r.description || '',
          priority: r.优先级 || r.priority || 'medium',
          status: r.处理状态 || r.status || 'pending',
          assignedTo: r.处理师傅 || r.assignedTo || undefined,
          createdAt: r.创建日期 || r.createdAt || new Date().toISOString().slice(0, 10),
          resolvedAt: r.解决日期 || r.resolvedAt || undefined,
          resolution: r.处理结果 || r.resolution || undefined,
        }));

        const staff: Staff[] = rawStaff.map(r => ({
          id: r.id || '',
          name: r.姓名 || r.name || '',
          phone: String(r.手机号 || r.phone || ''),
          role: r.角色 || r.role || 'sales',
          status: r.在职状态 || r.status || 'active',
          joinDate: r.入职日期 || r.joinDate || new Date().toISOString().slice(0, 10),
        }));

        // 统计导入情况
        const counts = {
          clients: clients.length,
          orders: orders.length,
          leads: leads.length,
          tickets: tickets.length,
          staff: staff.length,
        };

        // 写入 localStorage
        importStoreData({ clients, orders, leads, tickets, staff });

        resolve(`导入成功！\n客户 ${counts.clients} 条\n订单 ${counts.orders} 条\n线索 ${counts.leads} 条\n工单 ${counts.tickets} 条\n员工 ${counts.staff} 条`);
      } catch (err) {
        reject('文件解析失败：' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.onerror = () => reject('文件读取失败');
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// 格式化辅助函数（中文表头）
// ============================================================
function formatClients(clients: Client[]) {
  return clients.map(c => ({
    id: c.id,
    客户姓名: c.name,
    手机号: c.phone,
    地址: c.address,
    房号: c.roomNo,
    套餐: c.packageId === 'pkg-half-500' ? '半年500M' : '一年500M',
    状态: c.status === 'active' ? '正常' : c.status === 'expired' ? '已过期' : c.status === 'pending_install' ? '待安装' : '暂停',
    安装日期: c.installDate || '',
    到期日期: c.expiryDate || '',
    创建日期: c.createdAt,
  }));
}

function formatLeads(leads: SalesLead[]) {
  return leads.map(l => ({
    id: l.id,
    客户姓名: l.name,
    手机号: l.phone,
    地址: l.address || '',
    来源: l.source,
    跟进状态: l.status === 'new' ? '新线索' : l.status === 'contacted' ? '已联系' : l.status === 'negotiating' ? '洽谈中' : l.status === 'converted' ? '已成交' : '已流失',
    备注: l.notes,
    负责销售: l.assignedTo,
    创建日期: l.createdAt,
    更新日期: l.updatedAt,
  }));
}

function formatTickets(tickets: Ticket[]) {
  return tickets.map(t => ({
    id: t.id,
    客户姓名: t.clientName,
    手机号: t.phone,
    地址: t.address || '',
    故障类型: t.issueType === 'no_connection' ? '无法上网' : t.issueType === 'slow_speed' ? '网速慢' : t.issueType === 'equipment_fault' ? '设备故障' : t.issueType === 'installation' ? '安装服务' : '其他',
    故障描述: t.description,
    优先级: t.priority,
    处理状态: t.status,
    处理师傅: t.assignedTo || '',
    创建日期: t.createdAt,
    解决日期: t.resolvedAt || '',
    处理结果: t.resolution || '',
  }));
}

function formatStaff(staff: Staff[]) {
  return staff.map(s => ({
    id: s.id,
    姓名: s.name,
    手机号: s.phone,
    角色: s.role === 'sales' ? '销售' : s.role === 'maintenance' ? '维护' : s.role === 'admin' ? '管理' : '超管',
    在职状态: s.status === 'active' ? '在职' : '离职',
    入职日期: s.joinDate,
  }));
}

function formatPackages(pkgs: BroadbandPackage[]) {
  return pkgs.map(p => ({
    id: p.id,
    套餐名称: p.name,
    带宽: p.speed,
    时长月数: p.durationMonths,
    价格_元: p.price,
    安装费_元: p.installationFee,
    合计_元: p.totalPrice,
    特色: p.features.join('、'),
  }));
}
