import { NextRequest, NextResponse } from 'next/server';

// 环境变量会在Cloudflare Pages Functions中自动注入
export function middleware(request: NextRequest) {
  // 这里可以处理全局中间件逻辑
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有API路由
     */
    '/api/:path*',
  ],
};
