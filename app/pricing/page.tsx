'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Order } from '@/types';
import { FileText, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [polling, setPolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (order && order.status === 'pending' && polling) {
      interval = setInterval(() => {
        queryOrder();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [order, polling]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json() as { user: User };
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (packageType: 'monthly' | 'lifetime') => {
    setCreatingOrder(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType }),
      });

      const data = await res.json() as { error?: string; order: Order };
      if (!res.ok) throw new Error(data.error || '');

      setOrder(data.order);
      setPolling(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  const queryOrder = async () => {
    if (!order) return;
    try {
      const res = await fetch('/api/payment/query-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo: order.order_no }),
      });

      const data = await res.json() as { error?: string; order: Order };
      if (!res.ok) throw new Error(data.error || '');

      setOrder(data.order);
      if (data.order.status === 'paid') {
        setPolling(false);
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json() as { user: User };
        setUser(meData.user);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const cancelOrder = () => {
    setOrder(null);
    setPolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const isMember = user?.member_type === 'monthly' || user?.member_type === 'lifetime';
  const membershipValid = user?.member_type === 'lifetime' || 
    (user?.member_expires_at && new Date(user.member_expires_at) > new Date());

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="header-red">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/generator')} className="hover:opacity-80">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <FileText className="w-8 h-8" />
            <h1 className="text-xl font-bold">会员套餐</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {order ? (
          <div className="card text-center">
            {order.status === 'paid' ? (
              <div>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">支付成功</h2>
                <p className="text-gray-600 mb-8">您已成功开通会员，畅享无限次生成和导出</p>
                <button
                  onClick={() => router.push('/generator')}
                  className="btn-primary"
                >
                  开始使用
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">请扫码支付</h2>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl mb-6">
                  {order.qr_code ? (
                    <img src={order.qr_code} alt="支付二维码" className="w-64 h-64" />
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">二维码生成中...</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary mb-4">
                  ¥{order.amount.toFixed(2)}
                </div>
                <p className="text-gray-600 mb-6">订单号：{order.order_no}</p>
                <div className="flex items-center justify-center text-gray-500 mb-8">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  正在等待支付...
                </div>
                <button
                  onClick={cancelOrder}
                  className="btn-secondary"
                >
                  取消支付
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {isMember && membershipValid ? (
              <div className="card text-center">
                <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-gold text-4xl">✓</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  您已是{user?.member_type === 'lifetime' ? '终身' : 'VIP'}会员
                </h2>
                <p className="text-gray-600 mb-8">畅享无限次会议纪要生成和Word导出</p>
                <button
                  onClick={() => router.push('/generator')}
                  className="btn-primary"
                >
                  开始使用
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card text-center">
                  <h3 className="text-2xl font-bold mb-2">月卡会员</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ¥19.9<span className="text-lg text-gray-400">/月</span>
                  </div>
                  <ul className="text-left space-y-3 my-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      无限次会议纪要生成
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      无限次Word导出
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      全部会议类型
                    </li>
                  </ul>
                  <button
                    onClick={() => createOrder('monthly')}
                    disabled={creatingOrder}
                    className="btn-primary w-full"
                  >
                    {creatingOrder ? '创建订单中...' : '立即开通'}
                  </button>
                </div>

                <div className="card text-center border-2 border-gold relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary px-4 py-1 rounded-full text-sm font-bold">
                    最划算
                  </div>
                  <h3 className="text-2xl font-bold mb-2">终身会员</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ¥199<span className="text-lg text-gray-400">/永久</span>
                  </div>
                  <ul className="text-left space-y-3 my-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      无限次会议纪要生成
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      无限次Word导出
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      全部会议类型
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      永久使用，无需续费
                    </li>
                  </ul>
                  <button
                    onClick={() => createOrder('lifetime')}
                    disabled={creatingOrder}
                    className="btn-primary w-full bg-gold text-primary hover:bg-gold/90"
                  >
                    {creatingOrder ? '创建订单中...' : '立即开通'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
