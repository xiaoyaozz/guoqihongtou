'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Order } from '@/types';
import { FileText, ArrowLeft, Users, ShoppingCart, TrendingUp, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders'>('dashboard');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json() as { user: User };
      if (!data.user.is_admin) {
        router.push('/');
        return;
      }
      setUser(data.user);
      loadData();
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/orders'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json() as { stats: any };
        setStats(statsData.stats);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json() as { users: User[] };
        setUsers(usersData.users);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json() as { orders: Order[] };
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="hover:opacity-80">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <FileText className="w-8 h-8" />
              <h1 className="text-xl font-bold">管理后台</h1>
            </div>
            <button onClick={handleLogout} className="hover:opacity-80">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            仪表盘
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            用户管理
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'orders'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            订单管理
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalUsers}</div>
              <div className="text-gray-600">总用户数</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.paidUsers}</div>
              <div className="text-gray-600">付费用户</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gold mb-2">¥{stats.totalRevenue.toFixed(2)}</div>
              <div className="text-gray-600">总收入</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalOrders}</div>
              <div className="text-gray-600">总订单数</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">用户列表</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">邮箱</th>
                    <th className="text-left py-3 px-4">会员类型</th>
                    <th className="text-left py-3 px-4">已验证</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-3 px-4">{u.id}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.member_type}
                          onChange={(e) => handleUpdateUser(u.id, { member_type: e.target.value as any })}
                          className="input-field py-1 px-2"
                        >
                          <option value="free">免费</option>
                          <option value="monthly">月卡</option>
                          <option value="lifetime">终身</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.is_verified ? '是' : '否'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleUpdateUser(u.id, { is_verified: !u.is_verified })}
                          className="text-primary font-bold"
                        >
                          {u.is_verified ? '取消验证' : '验证'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">订单列表</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">订单号</th>
                    <th className="text-left py-3 px-4">用户ID</th>
                    <th className="text-left py-3 px-4">套餐</th>
                    <th className="text-left py-3 px-4">金额</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="py-3 px-4">{o.order_no}</td>
                      <td className="py-3 px-4">{o.user_id}</td>
                      <td className="py-3 px-4">
                        {o.package_type === 'monthly' ? '月卡' : '终身'}
                      </td>
                      <td className="py-3 px-4">¥{o.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          o.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : o.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {o.status === 'paid' ? '已支付' : o.status === 'pending' ? '待支付' : '已取消'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
