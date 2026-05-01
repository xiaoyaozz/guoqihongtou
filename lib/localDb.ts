// 本地模拟数据库 - 用于本地开发

interface User {
  id: number;
  email: string;
  password: string;
  is_verified: boolean;
  is_admin: boolean;
  member_type: string;
  member_expires_at: string | null;
  daily_generations: number;
  last_generation_date: string | null;
  has_used_export: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  package_type: string;
  amount: number;
  status: string;
  alipay_trade_no: string | null;
  qr_code: string | null;
  paid_at: string | null;
  created_at: string;
}

interface IpRegistration {
  id: number;
  ip_address: string;
  registration_date: string;
  created_at: string;
}

interface RequestLog {
  id: number;
  ip_address: string;
  endpoint: string;
  created_at: string;
}

class LocalDatabase {
  users: User[] = [];
  orders: Order[] = [];
  ipRegistrations: IpRegistration[] = [];
  requestLogs: RequestLog[] = [];
  nextUserId = 1;
  nextOrderId = 1;
  nextIpRegistrationId = 1;
  nextRequestLogId = 1;

  // 用户操作
  getUserByEmail(email: string): User | null {
    return this.users.find(u => u.email === email) || null;
  }

  getUserById(id: number): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  createUser(email: string, password: string): User {
    const now = new Date().toISOString();
    const user: User = {
      id: this.nextUserId++,
      email,
      password,
      is_verified: false,
      is_admin: false,
      member_type: 'free',
      member_expires_at: null,
      daily_generations: 0,
      last_generation_date: null,
      has_used_export: false,
      created_at: now,
      updated_at: now,
    };
    this.users.push(user);
    return user;
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.users[index];
  }

  // 订单操作
  createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Order {
    const order: Order = {
      id: this.nextOrderId++,
      ...orderData,
      created_at: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }

  getOrderByOrderNo(orderNo: string): Order | null {
    return this.orders.find(o => o.order_no === orderNo) || null;
  }

  updateOrder(orderNo: string, updates: Partial<Order>): Order | null {
    const index = this.orders.findIndex(o => o.order_no === orderNo);
    if (index === -1) return null;
    this.orders[index] = {
      ...this.orders[index],
      ...updates,
    };
    return this.orders[index];
  }

  // IP注册检查
  checkIpRegistration(ip: string, date: string): boolean {
    return this.ipRegistrations.some(r => r.ip_address === ip && r.registration_date === date);
  }

  recordIpRegistration(ip: string, date: string): void {
    this.ipRegistrations.push({
      id: this.nextIpRegistrationId++,
      ip_address: ip,
      registration_date: date,
      created_at: new Date().toISOString(),
    });
  }

  // 其他操作
  getAllUsers(limit = 100, offset = 0): User[] {
    return this.users
      .slice(offset, offset + limit);
  }

  getAllOrders(limit = 100, offset = 0): Order[] {
    return this.orders
      .slice(offset, offset + limit);
  }

  getStatistics(): {
    totalUsers: number;
    paidUsers: number;
    totalRevenue: number;
    totalOrders: number;
  } {
    const totalUsers = this.users.length;
    const paidUsers = this.users.filter(u => u.member_type === 'monthly' || u.member_type === 'lifetime').length;
    const totalRevenue = this.orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = this.orders.length;

    return { totalUsers, paidUsers, totalRevenue, totalOrders };
  }
}

export const localDb = new LocalDatabase();
