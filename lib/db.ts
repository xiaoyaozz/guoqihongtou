import { User, Order } from '@/types';
import { localDb } from './localDb';

// 环境检测
const isLocal = process.env.NODE_ENV !== 'production' || !process.env.CF_PAGES;

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ALIPAY_APP_ID: string;
  ALIPAY_PRIVATE_KEY: string;
  ALIPAY_PUBLIC_KEY: string;
  ALIPAY_GATEWAY: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  ADMIN_EMAIL: string;
}

// 获取环境对象（Cloudflare Pages专用）
async function getEnv(): Promise<Env> {
  if (isLocal) {
    return {} as Env;
  }
  // 在Cloudflare Pages中，env会通过函数context传递
  return {} as Env;
}

// 本地开发模式使用模拟数据库
export async function getUserByEmail(env: Env, email: string): Promise<User | null> {
  if (isLocal) {
    return localDb.getUserByEmail(email) as User | null;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  return result as User | null;
}

export async function getUserById(env: Env, id: number): Promise<User | null> {
  if (isLocal) {
    return localDb.getUserById(id) as User | null;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return result as User | null;
}

export async function createUser(env: Env, email: string, hashedPassword: string): Promise<User> {
  if (isLocal) {
    return localDb.createUser(email, hashedPassword) as User;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare(
    'INSERT INTO users (email, password) VALUES (?, ?) RETURNING *'
  ).bind(email, hashedPassword).first();
  return result as User;
}

export async function updateUser(env: Env, id: number, updates: Partial<User>): Promise<User | null> {
  if (isLocal) {
    return localDb.updateUser(id, updates) as User | null;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const setClauses: string[] = [];
  const values: any[] = [];
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  });
  values.push(id);
  const result = await db.prepare(
    `UPDATE users SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`
  ).bind(...values).first();
  return result as User | null;
}

export async function createOrder(env: Env, orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
  if (isLocal) {
    return localDb.createOrder(orderData) as Order;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare(
    'INSERT INTO orders (order_no, user_id, package_type, amount, status, qr_code) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(orderData.order_no, orderData.user_id, orderData.package_type, orderData.amount, 'pending', orderData.qr_code).first();
  return result as Order;
}

export async function getOrderByOrderNo(env: Env, orderNo: string): Promise<Order | null> {
  if (isLocal) {
    return localDb.getOrderByOrderNo(orderNo) as Order | null;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare('SELECT * FROM orders WHERE order_no = ?').bind(orderNo).first();
  return result as Order | null;
}

export async function updateOrder(env: Env, orderNo: string, updates: Partial<Order>): Promise<Order | null> {
  if (isLocal) {
    return localDb.updateOrder(orderNo, updates) as Order | null;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const setClauses: string[] = [];
  const values: any[] = [];
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  });
  values.push(orderNo);
  const result = await db.prepare(
    `UPDATE orders SET ${setClauses.join(', ')} WHERE order_no = ? RETURNING *`
  ).bind(...values).first();
  return result as Order | null;
}

export async function checkIpRegistration(env: Env, ip: string, date: string): Promise<boolean> {
  if (isLocal) {
    return localDb.checkIpRegistration(ip, date);
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare(
    'SELECT COUNT(*) as count FROM ip_registrations WHERE ip_address = ? AND registration_date = ?'
  ).bind(ip, date).first() as { count: number };
  return (result?.count || 0) > 0;
}

export async function recordIpRegistration(env: Env, ip: string, date: string): Promise<void> {
  if (isLocal) {
    localDb.recordIpRegistration(ip, date);
    return;
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  await db.prepare(
    'INSERT INTO ip_registrations (ip_address, registration_date) VALUES (?, ?)'
  ).bind(ip, date).run();
}

export async function checkRateLimit(env: Env, ip: string, endpoint: string, windowMinutes: number = 5, maxRequests: number = 100): Promise<boolean> {
  // 本地开发不进行速率限制
  if (isLocal) return true;
  
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const result = await db.prepare(
    'SELECT COUNT(*) as count FROM request_logs WHERE ip_address = ? AND endpoint = ? AND created_at > ?'
  ).bind(ip, endpoint, since).first() as { count: number };
  const count = result?.count || 0;
  
  if (count >= maxRequests) {
    return false;
  }
  
  await db.prepare(
    'INSERT INTO request_logs (ip_address, endpoint) VALUES (?, ?)'
  ).bind(ip, endpoint).run();
  
  return true;
}

export async function getAllUsers(env: Env, limit: number = 100, offset: number = 0): Promise<User[]> {
  if (isLocal) {
    return localDb.getAllUsers(limit, offset) as User[];
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return result.results as User[];
}

export async function getAllOrders(env: Env, limit: number = 100, offset: number = 0): Promise<Order[]> {
  if (isLocal) {
    return localDb.getAllOrders(limit, offset) as Order[];
  }
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  const result = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return result.results as Order[];
}

export async function getStatistics(env: Env): Promise<{
  totalUsers: number;
  paidUsers: number;
  totalRevenue: number;
  totalOrders: number;
}> {
  if (isLocal) {
    return localDb.getStatistics();
  }
  
  const db = (globalThis as any).__env?.DB || env?.DB;
  if (!db) throw new Error('Database not available');
  
  const [usersResult, ordersResult] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number },
    db.prepare('SELECT COUNT(*) as count, SUM(CASE WHEN status = "paid" THEN amount ELSE 0 END) as revenue FROM orders').first() as { count: number; revenue: number },
  ]);
  
  const paidUsersResult = await db.prepare(
    'SELECT COUNT(*) as count FROM users WHERE member_type IN ("monthly", "lifetime")'
  ).first() as { count: number };
  
  return {
    totalUsers: usersResult?.count || 0,
    paidUsers: paidUsersResult?.count || 0,
    totalRevenue: ordersResult?.revenue || 0,
    totalOrders: ordersResult?.count || 0,
  };
}
