export interface User {
  id: number;
  email: string;
  password?: string;
  is_verified: boolean;
  is_admin: boolean;
  member_type: 'free' | 'monthly' | 'lifetime';
  member_expires_at: string | null;
  daily_generations: number;
  last_generation_date: string | null;
  has_used_export: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  package_type: 'monthly' | 'lifetime';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  alipay_trade_no: string | null;
  qr_code: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface MeetingMinutesData {
  title: string;
  documentNumber: string;
  meetingType: 'party' | 'admin' | 'project';
  date: string;
  attendees: string;
  location: string;
  content: string;
  resolutions: string;
  todos: Array<{
    task: string;
    responsible: string;
    deadline: string;
    status: string;
  }>;
  issuer: string;
  cc: string;
}
