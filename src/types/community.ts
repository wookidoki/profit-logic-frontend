export interface BoardPost {
  id: number;
  title: string;
  content: string;
  author_nickname: string;
  author_id: number;
  project_id: number | null;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface BoardPostCreateRequest {
  title: string;
  content: string;
  project_id?: number;
}

export interface Comment {
  id: number;
  content: string;
  author_nickname: string;
  author_id: number;
  created_at: string;
}

export interface CommentCreateRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
