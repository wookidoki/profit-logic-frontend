export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  biz_type: string | null;
  role: string;
  created_at: string;
  project_count: number;
  total_chat_count: number;
  total_post_count: number;
}

export interface DailyLog {
  id: number;
  log_date: string;
  project_summary: string | null;
  cost_summary: string | null;
  time_log_summary: string | null;
  chat_summary: string | null;
  community_summary: string | null;
  personal_memo: string | null;
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyLogMemoRequest {
  personal_memo: string;
}
