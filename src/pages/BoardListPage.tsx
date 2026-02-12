import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoadingState } from '../styles/shared';
import { communityApi } from '../api/communityApi';
import { useAuthStore } from '../store/authStore';
import type { BoardPost } from '../types/community';

export default function BoardListPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    communityApi.getPosts(page)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          setPosts(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
        }
      })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  return (
    <Container>
      <Header>
        <Title>커뮤니티</Title>
        {isAuthenticated && (
          <WriteButton onClick={() => navigate('/board/write')}>
            글쓰기
          </WriteButton>
        )}
      </Header>

      {loading ? (
        <LoadingState>불러오는 중...</LoadingState>
      ) : posts.length === 0 ? (
        <EmptyState>
          아직 게시글이 없습니다. 첫 글을 작성해보세요!
        </EmptyState>
      ) : (
        <>
          <PostTable>
            <thead>
              <tr>
                <Th $width="50%">제목</Th>
                <Th>작성자</Th>
                <Th>조회</Th>
                <Th>댓글</Th>
                <Th>작성일</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <PostRow key={post.id} onClick={() => navigate(`/board/${post.id}`)}>
                  <TdTitle>{post.title}</TdTitle>
                  <Td>{post.author_nickname}</Td>
                  <Td>{post.view_count}</Td>
                  <Td>{post.comment_count}</Td>
                  <Td>{new Date(post.created_at).toLocaleDateString('ko-KR')}</Td>
                </PostRow>
              ))}
            </tbody>
          </PostTable>

          {totalPages > 1 && (
            <Pagination>
              <PageBtn disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                이전
              </PageBtn>
              <PageInfo>{page + 1} / {totalPages}</PageInfo>
              <PageBtn disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                다음
              </PageBtn>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const WriteButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 4rem 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PostTable = styled.table`
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-collapse: collapse;
  overflow: hidden;
`;

const Th = styled.th<{ $width?: string }>`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 1px solid #e9ecef;
  width: ${({ $width }) => $width || 'auto'};
  white-space: nowrap;
`;

const PostRow = styled.tr`
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f8f9fa;
  }

  &:not(:last-child) td {
    border-bottom: 1px solid #f1f3f5;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: #6c757d;
  white-space: nowrap;
`;

const TdTitle = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
`;

const PageBtn = styled.button`
  padding: 0.375rem 0.75rem;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #4361ee;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #4361ee;
    color: #fff;
    border-color: #4361ee;
  }

  &:disabled {
    color: #adb5bd;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.8125rem;
  color: #6c757d;
`;
