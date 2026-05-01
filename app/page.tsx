'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { FileText, CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json() as { user: User };
        setUser(data.user);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white text-primary py-6 px-4 text-center border-b-2 border-primary">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-10 h-10" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">国企红头会议纪要生成器</h1>
                <p className="text-gold text-sm">专业、高效、规范</p>
              </div>
            </div>
            <div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">欢迎，{user.email}</span>
                  <button
                    onClick={() => router.push('/generator')}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primaryDark transition-colors"
                  >
                    开始使用
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primaryDark transition-colors"
                  >
                    注册
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            一键生成标准<span className="text-primary">国企红头</span>会议纪要
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            专业的国企会议纪要生成工具，支持党委、行政、项目例会等多种格式，
            自动排版，一键导出Word文档
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(user ? '/generator' : '/register')}
              className="btn-primary text-lg px-8 py-4"
            >
              立即开始
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">核心功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">多种会议纪要</h3>
              <p className="text-gray-600">党委、行政、项目例会等多种会议类型</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">标准格式</h3>
              <p className="text-gray-600">国企标准红头文件格式，自动排版</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">一键导出</h3>
              <p className="text-gray-600">一键导出Word文档，方便编辑</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">数据安全</h3>
              <p className="text-gray-600">不存储会议内容，保护机密</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-primary to-primaryDark text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">会员套餐</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">免费用户</h3>
                <div className="text-4xl font-bold mb-4">¥0</div>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 每日3次生成</li>
                  <li>✓ 1次Word导出</li>
                  <li>✓ 复制功能</li>
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-cream transition-colors"
                >
                  免费注册
                </button>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center border-2 border-gold">
                <div className="text-gold text-sm font-bold mb-2">推荐</div>
                <h3 className="text-2xl font-bold mb-2">月卡会员</h3>
                <div className="text-4xl font-bold mb-4">¥19.9<span className="text-lg">/月</span></div>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 无限生成</li>
                  <li>✓ 无限导出</li>
                  <li>✓ 全部功能</li>
                </ul>
                <button
                  onClick={() => router.push(user ? '/pricing' : '/register')}
                  className="w-full bg-gold text-primary px-6 py-3 rounded-lg font-bold hover:bg-gold/90 transition-colors"
                >
                  立即开通
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 国企红头会议纪要生成器. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
