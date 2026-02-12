export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  project_id: number;
  question: string;
}

export interface ChatResponse {
  id: number;
  question: string;
  answer: string;
  tokens_used: number;
  created_at: string;
}
