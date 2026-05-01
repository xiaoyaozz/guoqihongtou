'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MeetingMinutesData } from '@/types';
import { FileText, Copy, Download, ArrowLeft, LogOut, Plus, Trash2 } from 'lucide-react';

export default function GeneratorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generatedMinutes, setGeneratedMinutes] = useState('');
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState<MeetingMinutesData>({
    title: '',
    documentNumber: `[${new Date().getFullYear()}]第${Math.floor(Math.random() * 100)}号`,
    meetingType: 'party',
    date: new Date().toISOString().split('T')[0],
    attendees: '',
    location: '',
    content: '',
    resolutions: '',
    todos: [{ task: '', responsible: '', deadline: '', status: '' }],
    issuer: '各部门、各下属单位',
    cc: '公司领导',
  });

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
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleGenerate = async () => {
    if (!form.content) {
      alert('请输入会议内容');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/meeting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { error?: string; minutes: string };
      if (!res.ok) throw new Error(data.error || '');

      setGeneratedMinutes(data.minutes);
      setShowResult(true);

      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json() as { user: User };
        setUser(meData.user);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMinutes);
      alert('已复制到剪贴板');
    } catch (err) {
      alert('复制失败');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/meeting/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || '');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '会议纪要.docx';
      a.click();
      window.URL.revokeObjectURL(url);

      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json() as { user: User };
        setUser(meData.user);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  const addTodo = () => {
    setForm({
      ...form,
      todos: [...form.todos, { task: '', responsible: '', deadline: '', status: '' }],
    });
  };

  const removeTodo = (index: number) => {
    setForm({
      ...form,
      todos: form.todos.filter((_, i) => i !== index),
    });
  };

  const updateTodo = (index: number, field: string, value: string) => {
    const newTodos = [...form.todos];
    newTodos[index] = { ...newTodos[index], [field]: value };
    setForm({ ...form, todos: newTodos });
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="hover:opacity-80">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <FileText className="w-8 h-8" />
              <h1 className="text-xl font-bold">会议纪要生成器</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm">
                  {!isMember || !membershipValid ? (
                    <div className="flex items-center space-x-2">
                      <span>今日剩余：{3 - (user.daily_generations || 0)}次</span>
                      <button
                        onClick={() => router.push('/pricing')}
                        className="bg-gold text-primary px-3 py-1 rounded text-xs font-bold"
                      >
                        升级会员
                      </button>
                    </div>
                  ) : (
                    <span className="text-gold">
                      {user.member_type === 'lifetime' ? '终身会员' : '月卡会员'}
                    </span>
                  )}
                </div>
              )}
              <button onClick={handleLogout} className="text-white/80 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {showResult ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowResult(false)}
                className="btn-secondary"
              >
                返回编辑
              </button>
              <div className="flex space-x-4">
                <button onClick={handleCopy} className="btn-secondary flex items-center">
                  <Copy className="w-5 h-5 mr-2" />
                  复制
                </button>
                {((!isMember || !membershipValid) && !user?.has_used_export) || (isMember && membershipValid) ? (
                  <button onClick={handleExport} disabled={exporting} className="btn-primary flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    {exporting ? '导出中...' : '导出Word'}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="card">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedMinutes}</pre>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">基本信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">会议类型</label>
                    <select
                      className="input-field"
                      value={form.meetingType}
                      onChange={(e) => setForm({ ...form, meetingType: e.target.value as any })}
                    >
                      <option value="party">党委会议</option>
                      <option value="admin">行政办公会议</option>
                      <option value="project">项目例会</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="请输入会议纪要标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">文号</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.documentNumber}
                      onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">日期</label>
                      <input
                        type="date"
                        className="input-field"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">地点</label>
                      <input
                        type="text"
                        className="input-field"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="会议室"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">出席人员</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.attendees}
                      onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                      placeholder="姓名、姓名..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">主送</label>
                      <input
                        type="text"
                        className="input-field"
                        value={form.issuer}
                        onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">抄送</label>
                      <input
                        type="text"
                        className="input-field"
                        value={form.cc}
                        onChange={(e) => setForm({ ...form, cc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">待办事项</h2>
                  <button onClick={addTodo} className="text-primary font-bold flex items-center">
                    <Plus className="w-5 h-5 mr-1" />
                    添加
                  </button>
                </div>
                <div className="space-y-4">
                  {form.todos.map((todo, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bold">事项 {index + 1}</span>
                        {form.todos.length > 1 && (
                          <button
                            onClick={() => removeTodo(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="input-field"
                          value={todo.task}
                          onChange={(e) => updateTodo(index, 'task', e.target.value)}
                          placeholder="任务内容"
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            className="input-field"
                            value={todo.responsible}
                            onChange={(e) => updateTodo(index, 'responsible', e.target.value)}
                            placeholder="负责人"
                          />
                          <input
                            type="date"
                            className="input-field"
                            value={todo.deadline}
                            onChange={(e) => updateTodo(index, 'deadline', e.target.value)}
                          />
                          <input
                            type="text"
                            className="input-field"
                            value={todo.status}
                            onChange={(e) => updateTodo(index, 'status', e.target.value)}
                            placeholder="状态"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">会议内容</h2>
                <textarea
                  className="input-field h-48"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="请粘贴或输入会议内容..."
                />
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">会议决议</h2>
                <textarea
                  className="input-field h-32"
                  value={form.resolutions}
                  onChange={(e) => setForm({ ...form, resolutions: e.target.value })}
                  placeholder="请输入会议决议..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary w-full py-4 text-lg"
              >
                {generating ? '生成中...' : '生成会议纪要'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
