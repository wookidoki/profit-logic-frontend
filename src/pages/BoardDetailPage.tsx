import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { communityApi } from '../api/communityApi';
import { useAuthStore } from '../store/authStore';
import { extractErrorMessage } from '../api/errorUtils';
import { BackButton, ErrorBanner, ErrorState } from '../styles/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import type { BoardPost, Comment } from '../types/community';

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = Number(id);
  const { nickname, isAuthenticated } = useAuthStore();

  const [post, setPost] = useState<BoardPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!postId) return;
    communityApi.getPost(postId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setPost(res.data.data);
        } else {
          setError('게시글을 찾을 수 없습니다.');
        }
      })
      .catch(() => setError('게시글을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const loadComments = useCallback(() => {
    communityApi.getComments(postId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setComments(res.data.data);
        }
      })
      .catch(() => { /* ignore */ });
  }, [postId]);

  useEffect(() => {
    if (postId) loadComments();
  }, [postId, loadComments]);

  const handleDeletePost = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await communityApi.deletePost(postId);
      navigate('/board');
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await communityApi.createComment(postId, { content: commentText.trim() });
      if (res.data.success && res.data.data) {
        setComments((prev) => [...prev, res.data.data!]);
        setCommentText('');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '댓글 작성에 실패했습니다.'));
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
      setError('댓글 삭제에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !post) return <ErrorState>{error}</ErrorState>;
  if (!post) return <ErrorState>게시글을 찾을 수 없습니다.</ErrorState>;

  const isAuthor = nickname === post.author_nickname;

  return (
    <Container>
      <BackButton onClick={() => navigate('/board')}>← 목록</BackButton>

      <PostCard>
        <PostHeader>
          <PostTitle>{post.title}</PostTitle>
          {isAuthor && (
            <DeleteButton onClick={handleDeletePost}>삭제</DeleteButton>
          )}
        </PostHeader>
        <PostMeta>
          <Author>{post.author_nickname}</Author>
          <Separator />
          <MetaText>{new Date(post.created_at).toLocaleDateString('ko-KR')}</MetaText>
          <Separator />
          <MetaText>조회 {post.view_count}</MetaText>
        </PostMeta>
        <PostBody>{post.content}</PostBody>
      </PostCard>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <CommentSection>
        <CommentTitle>댓글 {comments.length}개</CommentTitle>

        {comments.map((c) => (
          <CommentItem key={c.id}>
            <CommentHeader>
              <CommentAuthor>{c.author_nickname}</CommentAuthor>
              <CommentDate>
                {new Date(c.created_at).toLocaleDateString('ko-KR')}
              </CommentDate>
              {nickname === c.author_nickname && (
                <CommentDeleteBtn onClick={() => handleDeleteComment(c.id)}>
                  삭제
                </CommentDeleteBtn>
              )}
            </CommentHeader>
            <CommentBody>{c.content}</CommentBody>
          </CommentItem>
        ))}

        {isAuthenticated ? (
          <CommentForm onSubmit={handleSubmitComment}>
            <CommentInput
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              maxLength={1000}
            />
            <CommentSubmit type="submit" disabled={submitting || !commentText.trim()}>
              {submitting ? '등록 중...' : '등록'}
            </CommentSubmit>
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
  margin: 1.5rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PostCard = styled.div`
  background: ${theme.colors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const PostTitle = styled.h1`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
  margin-right: 1rem;
`;

const DeleteButton = styled.button`
  padding: 0.25rem 0.625rem;
  background: transparent;
  color: ${theme.colors.danger};
  border: 1px solid ${theme.colors.danger};
  border-radius: 6px;
  font-size: 0.75rem;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.danger};
    color: ${theme.colors.surface};
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f3f5;
`;

const Author = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${theme.colors.text};
`;

const Separator = styled.span`
  width: 3px;
  height: 3px;
  background: #adb5bd;
  border-radius: 50%;
`;

const MetaText = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.textSecondary};
`;

const PostBody = styled.div`
  font-size: 0.9375rem;
  line-height: 1.8;
  color: ${theme.colors.text};
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommentSection = styled.div`
  background: ${theme.colors.surface};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CommentTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const CommentItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f5;

  &:last-of-type {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
`;

const CommentAuthor = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const CommentDate = styled.span`
  font-size: 0.6875rem;
  color: #adb5bd;
`;

const CommentDeleteBtn = styled.button`
  margin-left: auto;
  padding: 0.125rem 0.375rem;
  background: transparent;
  color: ${theme.colors.danger};
  border: 1px solid ${theme.colors.danger};
  border-radius: 4px;
  font-size: 0.6875rem;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.danger};
    color: ${theme.colors.surface};
  }
`;

const CommentBody = styled.div`
  font-size: 0.8125rem;
  color: ${theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.8125rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const CommentSubmit = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${theme.colors.textSecondary};
  font-size: 0.8125rem;
  background: ${theme.colors.background};
  border-radius: 8px;
`;
