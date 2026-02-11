import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { communityApi } from '../api/communityApi';
import { useAuthStore } from '../store/authStore';
import type { BoardPost, Comment } from '../types';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = Number(id);
  const { isAuthenticated, email } = useAuthStore();

  const [post, setPost] = useState<BoardPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          communityApi.getPost(postId),
          communityApi.getComments(postId),
        ]);
        if (postRes.data.success && postRes.data.data) {
          setPost(postRes.data.data);
        }
        if (commentRes.data.success && commentRes.data.data) {
          setComments(commentRes.data.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await communityApi.deletePost(postId);
      navigate('/community');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleAddComment = async () => {
    const content = commentInput.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      const res = await communityApi.createComment(postId, { content });
      if (res.data.success && res.data.data) {
        setComments((prev) => [...prev, res.data.data!]);
        setCommentInput('');
      }
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await communityApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <LoadingText>불러오는 중...</LoadingText>;
  if (!post) return <ErrorText>게시글을 찾을 수 없습니다.</ErrorText>;

  return (
    <Container>
      <BackBtn onClick={() => navigate('/community')}>← 목록으로</BackBtn>

      <PostCard>
        <PostHeader>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <Author>{post.author_nickname}</Author>
            <MetaDivider>|</MetaDivider>
            <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
            <MetaDivider>|</MetaDivider>
            <span>조회 {post.view_count}</span>
          </PostMeta>
        </PostHeader>
        <PostContent>{post.content}</PostContent>
        {isAuthenticated && post.author_nickname === email?.split('@')[0] && (
          <DeletePostBtn onClick={handleDeletePost}>게시글 삭제</DeletePostBtn>
        )}
      </PostCard>

      <CommentSection>
        <CommentTitle>댓글 {comments.length}개</CommentTitle>

        {comments.map((c) => (
          <CommentItem key={c.id}>
            <CommentHeader>
              <CommentAuthor>{c.author_nickname}</CommentAuthor>
              <CommentDate>
                {new Date(c.created_at).toLocaleString('ko-KR')}
              </CommentDate>
              {isAuthenticated && (
                <CommentDeleteBtn onClick={() => handleDeleteComment(c.id)}>
                  삭제
                </CommentDeleteBtn>
              )}
            </CommentHeader>
            <CommentBody>{c.content}</CommentBody>
          </CommentItem>
        ))}

        {isAuthenticated ? (
          <CommentForm>
            <CommentInput
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={3}
            />
            <CommentSubmitBtn
              onClick={handleAddComment}
              disabled={submitting || !commentInput.trim()}
            >
              {submitting ? '등록 중...' : '댓글 등록'}
            </CommentSubmitBtn>
          </CommentForm>
        ) : (
          <LoginPrompt>댓글을 작성하려면 로그인이 필요합니다.</LoginPrompt>
        )}
      </CommentSection>
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const BackBtn = styled.button`
  padding: 0.375rem 0.625rem;
  background: #fff;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background: #f8f9fa;
  }
`;

const PostCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const PostHeader = styled.div`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
`;

const PostTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #6c757d;
`;

const Author = styled.span`
  font-weight: 500;
`;

const MetaDivider = styled.span`
  color: #dee2e6;
`;

const PostContent = styled.div`
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #1a1a2e;
  white-space: pre-wrap;
`;

const DeletePostBtn = styled.button`
  margin-top: 1.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

const CommentSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const CommentTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
`;

const CommentItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const CommentAuthor = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const CommentDate = styled.span`
  font-size: 0.75rem;
  color: #adb5bd;
`;

const CommentDeleteBtn = styled.button`
  margin-left: auto;
  font-size: 0.6875rem;
  color: #ef476f;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const CommentBody = styled.p`
  font-size: 0.875rem;
  color: #1a1a2e;
  line-height: 1.6;
`;

const CommentForm = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CommentInput = styled.textarea`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

const CommentSubmitBtn = styled.button`
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoginPrompt = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #6c757d;
  padding: 1rem 0;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #ef476f;
`;
