const express = require('express');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 3456;
const DATA_DIR = path.join(__dirname, '..', '数据');

app.use(express.json({ limit: '50mb' }));

// ============================================================
// 种子数据
// ============================================================
const SEED = {
  clients: [
    { id: 'C001', name: '陈先生', phone: '13800138001', address: '天河星界公寓 B栋 403', roomNo: 'B-403', packageId: 'pkg-year-500', status: 'active', installDate: '2026-01-15', expiryDate: '2027-01-15', createdAt: '2026-01-10', salesPersonId: 'S001' },
    { id: 'C002', name: '李女士', phone: '13900139002', address: '天河星界公寓 A栋 205', roomNo: 'A-205', packageId: 'pkg-half-500', status: 'active', installDate: '2026-03-01', expiryDate: '2026-09-01', createdAt: '2026-02-28', salesPersonId: 'S001' },
    { id: 'C003', name: '张先生', phone: '13700137003', address: '珠江新城公寓 C栋 1201', roomNo: 'C-1201', packageId: 'pkg-year-500', status: 'active', installDate: '2025-12-01', expiryDate: '2026-12-01', createdAt: '2025-11-28', salesPersonId: 'S002' },
    { id: 'C004', name: '王同学', phone: '13600136004', address: '天河星界公寓 B栋 510', roomNo: 'B-510', packageId: 'pkg-half-500', status: 'expired', installDate: '2025-10-01', expiryDate: '2026-04-01', createdAt: '2025-09-28', salesPersonId: 'S001' },
    { id: 'C005', name: '赵先生', phone: '13500135005', address: '棠下小区 3栋 202', roomNo: '3-202', packageId: 'pkg-year-500', status: 'pending_install', createdAt: '2026-05-20', salesPersonId: 'S002' },
  ],
  orders: [
    { id: 'ORD001', clientId: 'C001', clientName: '陈先生', phone: '13800138001', packageId: 'pkg-year-500', packageName: '一年 500M 超值版', amount: 990, installationFee: 200, totalAmount: 1190, status: 'active', createdAt: '2026-01-10', paidAt: '2026-01-10', salesPersonId: 'S001' },
    { id: 'ORD002', clientId: 'C002', clientName: '李女士', phone: '13900139002', packageId: 'pkg-half-500', packageName: '半年 500M 极速版', amount: 499, installationFee: 200, totalAmount: 699, status: 'active', createdAt: '2026-02-28', paidAt: '2026-02-28', salesPersonId: 'S001' },
    { id: 'ORD003', clientId: 'C003', clientName: '张先生', phone: '13700137003', packageId: 'pkg-year-500', packageName: '一年 500M 超值版', amount: 990, installationFee: 200, totalAmount: 1190, status: 'active', createdAt: '2025-11-28', paidAt: '2025-11-29', salesPersonId: 'S002' },
    { id: 'ORD004', clientId: 'C004', clientName: '王同学', phone: '13600136004', packageId: 'pkg-half-500', packageName: '半年 500M 极速版', amount: 499, installationFee: 200, totalAmount: 699, status: 'active', createdAt: '2025-09-28', paidAt: '2025-09-29', salesPersonId: 'S001' },
    { id: 'ORD005', clientId: 'C005', clientName: '赵先生', phone: '13500135005', packageId: 'pkg-year-500', packageName: '一年 500M 超值版', amount: 990, installationFee: 200, totalAmount: 1190, status: 'pending_payment', createdAt: '2026-05-20', salesPersonId: 'S002' },
  ],
  leads: [
    { id: 'L001', name: '刘先生', phone: '13400134006', address: '棠下小区 5栋 303', source: 'online', status: 'new', notes: '咨询半年套餐', assignedTo: 'S001', createdAt: '2026-05-21', updatedAt: '2026-05-21' },
    { id: 'L002', name: '黄女士', phone: '13300133007', address: '天河星界公寓 C栋 805', source: 'referral', status: 'contacted', notes: '朋友介绍，对一年套餐感兴趣', assignedTo: 'S001', createdAt: '2026-05-19', updatedAt: '2026-05-20' },
    { id: 'L003', name: '周同学', phone: '13200132008', source: 'self_visit', status: 'negotiating', notes: '学生，想要半年套餐，纠结安装费', assignedTo: 'S002', createdAt: '2026-05-18', updatedAt: '2026-05-22' },
    { id: 'L004', name: '吴先生', phone: '13100131009', address: '珠江新城公寓 A栋 1502', source: 'walk_in', status: 'converted', notes: '已签约一年套餐，等待安装', assignedTo: 'S002', createdAt: '2026-05-15', updatedAt: '2026-05-22' },
    { id: 'L005', name: '林小姐', phone: '13000130010', source: 'online', status: 'lost', notes: '价格敏感，暂时不考虑', assignedTo: 'S001', createdAt: '2026-05-10', updatedAt: '2026-05-16' },
  ],
  tickets: [
    { id: 'TK001', clientId: 'C001', clientName: '陈先生', phone: '13800138001', address: '天河星界公寓 B栋 403', issueType: 'no_connection', description: '完全无法上网，光猫 LOS 红灯闪烁', priority: 'urgent', status: 'in_progress', assignedTo: 'M001', createdAt: '2026-05-22' },
    { id: 'TK002', clientId: 'C002', clientName: '李女士', phone: '13900139002', address: '天河星界公寓 A栋 205', issueType: 'slow_speed', description: '晚上测速只有 50M，离 500M 差很远', priority: 'medium', status: 'assigned', assignedTo: 'M002', createdAt: '2026-05-21' },
    { id: 'TK003', clientId: 'C003', clientName: '张先生', phone: '13700137003', address: '珠江新城公寓 C栋 1201', issueType: 'equipment_fault', description: '路由器频繁重启，怀疑电源适配器坏了', priority: 'high', status: 'pending', createdAt: '2026-05-23' },
    { id: 'TK004', clientId: 'C005', clientName: '赵先生', phone: '13500135005', address: '棠下小区 3栋 202', issueType: 'installation', description: '预约本周五安装，确认时间', priority: 'low', status: 'resolved', assignedTo: 'M001', createdAt: '2026-05-20', resolvedAt: '2026-05-22', resolution: '已联系客户，周五下午安装' },
    { id: 'TK005', clientId: 'C004', clientName: '王同学', phone: '13600136004', address: '天河星界公寓 B栋 510', issueType: 'other', description: '需要迁移宽带到同栋 608 房', priority: 'medium', status: 'closed', assignedTo: 'M002', createdAt: '2026-05-15', resolvedAt: '2026-05-17', resolution: '已完成移机' },
  ],
  staff: [
    { id: 'S001', name: '李明', phone: '18800010001', role: 'sales', status: 'active', joinDate: '2025-06-01' },
    { id: 'S002', name: '王芳', phone: '18800010002', role: 'sales', status: 'active', joinDate: '2025-08-15' },
    { id: 'M001', name: '陈师傅', phone: '18800020001', role: 'maintenance', status: 'active', joinDate: '2025-06-01' },
    { id: 'M002', name: '张师傅', phone: '18800020002', role: 'maintenance', status: 'active', joinDate: '2025-07-01' },
    { id: 'A001', name: '赵经理', phone: '18800030001', role: 'admin', status: 'active', joinDate: '2025-01-01' },
    { id: 'SU001', name: '系统管理员', phone: '18800000001', role: 'super_admin', status: 'active', joinDate: '2025-01-01' },
  ],
};

const PACKAGES = [
  { id: 'pkg-half-500', name: '半年 500M 极速版', speed: '500M', durationMonths: 6, price: 499, installationFee: 200, totalPrice: 699, features: ['500M 光纤接入', '公网 IP', '千兆光猫', '7×12 售后'] },
  { id: 'pkg-year-500', name: '一年 500M 超值版', speed: '500M', durationMonths: 12, price: 990, installationFee: 200, totalPrice: 1190, features: ['500M 光纤接入', '公网 IP', '千兆光猫', '7×24 售后', '送 WiFi 6 路由器'] },
];

// ============================================================
// Excel 数据读写
// ============================================================
function excelFilePath(name) {
  return path.join(DATA_DIR, `${name}.xlsx`);
}

// 从 Excel 读取一个表
function readSheet(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

// 写入一个表到 Excel
function writeSheet(filePath, data, columns) {
  const ws = XLSX.utils.json_to_sheet(data, { header: columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
}

// 初始化数据：如果 Excel 文件不存在，从种子数据创建
function ensureDataInitialized() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const files = [
    { name: '客户信息', data: SEED.clients, cols: ['id', 'name', 'phone', 'address', 'roomNo', 'packageId', 'status', 'installDate', 'expiryDate', 'createdAt', 'salesPersonId'] },
    { name: '订单记录', data: SEED.orders, cols: ['id', 'clientId', 'clientName', 'phone', 'packageId', 'packageName', 'amount', 'installationFee', 'totalAmount', 'status', 'createdAt', 'paidAt', 'salesPersonId'] },
    { name: '销售线索', data: SEED.leads, cols: ['id', 'name', 'phone', 'address', 'source', 'status', 'notes', 'assignedTo', 'createdAt', 'updatedAt'] },
    { name: '维护工单', data: SEED.tickets, cols: ['id', 'clientId', 'clientName', 'phone', 'address', 'issueType', 'description', 'priority', 'status', 'assignedTo', 'createdAt', 'resolvedAt', 'resolution'] },
    { name: '员工信息', data: SEED.staff, cols: ['id', 'name', 'phone', 'role', 'status', 'joinDate'] },
  ];

  for (const f of files) {
    const fp = excelFilePath(f.name);
    if (!fs.existsSync(fp)) {
      writeSheet(fp, f.data, f.cols);
      console.log(`  ✓ 创建 ${f.name}.xlsx (${f.data.length} 条)`);
    }
  }
}

// 从所有 Excel 读取全部数据
function readAllData() {
  const clients = readSheet(excelFilePath('客户信息')) || [];
  const orders = readSheet(excelFilePath('订单记录')) || [];
  const leads = readSheet(excelFilePath('销售线索')) || [];
  const tickets = readSheet(excelFilePath('维护工单')) || [];
  const staff = readSheet(excelFilePath('员工信息')) || [];

  // 类型整理
  const fixNum = (v) => { const n = Number(v); return isNaN(n) ? v : n; };
  return {
    clients: clients.map(c => ({ ...c, amount: fixNum(c.amount), installationFee: fixNum(c.installationFee), totalAmount: fixNum(c.totalAmount) })),
    orders: orders.map(o => ({ ...o, amount: fixNum(o.amount), installationFee: fixNum(o.installationFee), totalAmount: fixNum(o.totalAmount) })),
    leads: leads.map(l => ({ ...l })),
    tickets: tickets.map(t => ({ ...t })),
    staff: staff.map(s => ({ ...s })),
  };
}

// 写入全部数据到 Excel
function writeAllData(data) {
  const fileDefs = [
    { name: '客户信息', data: data.clients, cols: ['id', 'name', 'phone', 'address', 'roomNo', 'packageId', 'status', 'installDate', 'expiryDate', 'createdAt', 'salesPersonId'] },
    { name: '订单记录', data: data.orders, cols: ['id', 'clientId', 'clientName', 'phone', 'packageId', 'packageName', 'amount', 'installationFee', 'totalAmount', 'status', 'createdAt', 'paidAt', 'salesPersonId'] },
    { name: '销售线索', data: data.leads, cols: ['id', 'name', 'phone', 'address', 'source', 'status', 'notes', 'assignedTo', 'createdAt', 'updatedAt'] },
    { name: '维护工单', data: data.tickets, cols: ['id', 'clientId', 'clientName', 'phone', 'address', 'issueType', 'description', 'priority', 'status', 'assignedTo', 'createdAt', 'resolvedAt', 'resolution'] },
    { name: '员工信息', data: data.staff, cols: ['id', 'name', 'phone', 'role', 'status', 'joinDate'] },
  ];
  for (const f of fileDefs) {
    writeSheet(excelFilePath(f.name), f.data, f.cols);
  }
}

// ============================================================
// API 路由
// ============================================================

// 获取全部数据
app.get('/api/data', (req, res) => {
  try {
    const data = readAllData();
    res.json({ success: true, data, packages: PACKAGES });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 保存全部数据
app.post('/api/data', (req, res) => {
  try {
    writeAllData(req.body);
    res.json({ success: true, message: '数据已保存到 Excel' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 重置数据
app.post('/api/reset', (req, res) => {
  try {
    writeAllData(SEED);
    res.json({ success: true, message: '数据已重置为初始演示数据' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// 静态文件服务（前端 dist）
// ============================================================
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============================================================
// 启动
// ============================================================
console.log('达维斯网络 — 本地服务启动中...');
console.log(`数据目录: ${DATA_DIR}`);
ensureDataInitialized();
console.log('');

app.listen(PORT, () => {
  console.log(`✓ 服务已启动！
  ─────────────────────────────
  本地访问: http://localhost:${PORT}
  数据目录: ${DATA_DIR}
  ─────────────────────────────
  打开 Excel 文件直接修改数据，
  修改后刷新网页即可生效。`);
});
