'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', captcha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || '');

      router.push('/generator');
    } catch (err: any) {
      setError(err.message);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const refreshCaptcha = () => setCaptchaKey(k => k + 1);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回首页
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">登录账号</h1>
          <p className="text-gray-600 mt-2">欢迎回来</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field pr-12"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="请输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">验证码</label>
            <div className="flex space-x-4">
              <input
                type="text"
                required
                className="input-field flex-1"
                value={form.captcha}
                onChange={(e) => setForm({ ...form, captcha: e.target.value })}
                placeholder="请输入验证码"
                maxLength={4}
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="w-32 h-12 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
              >
                <img
                  key={captchaKey}
                  src="/api/captcha"
                  alt="验证码"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            还没有账号？
            <button
              onClick={() => router.push('/register')}
              className="text-primary font-bold ml-1 hover:underline"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
