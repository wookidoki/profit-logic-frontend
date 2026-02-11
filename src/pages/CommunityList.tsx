import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { communityApi } from '../api/communityApi';
import { useAuthStore } from '../store/authStore';
import type { BoardPost, Page } from '../types';

export default function CommunityList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<BoardPost> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await communityApi.getPosts(p, 10);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return (
    <Container>
      <Header>
        <PageTitle>커뮤니티</PageTitle>
        {isAuthenticated && (
          <WriteBtn onClick={() => navigate('/community/new')}>글쓰기</WriteBtn>
        )}
      </Header>

      {loading ? (
        <LoadingText>불러오는 중...</LoadingText>
      ) : !data || data.content.length === 0 ? (
        <EmptyState>아직 게시글이 없습니다.</EmptyState>
      ) : (
        <>
          <PostTable>
            <thead>
              <tr>
                <Th style={{ width: '50%' }}>제목</Th>
                <Th>작성자</Th>
                <Th>조회</Th>
                <Th>댓글</Th>
                <Th>작성일</Th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((post) => (
                <PostRow key={post.id} onClick={() => navigate(`/community/${post.id}`)}>
                  <Td>
                    <PostTitle>{post.title}</PostTitle>
                  </Td>
                  <Td>{post.author_nickname}</Td>
                  <Td>{post.view_count}</Td>
                  <Td>{post.comment_count}</Td>
                  <Td>{new Date(post.created_at).toLocaleDateString('ko-KR')}</Td>
                </PostRow>
              ))}
            </tbody>
          </PostTable>

          <Pagination>
            <PageBtn
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </PageBtn>
            <PageInfo>
              {data.number + 1} / {data.total_pages || 1}
            </PageInfo>
            <PageBtn
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </PageBtn>
          </Pagination>
        </>
      )}
    </Container>
  );
}

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const WriteBtn = styled.button`
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const PostTable = styled.table`
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const PostRow = styled.tr`
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f8f9fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1a1a2e;
`;

const PostTitle = styled.span`
  font-weight: 500;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PageBtn = styled.button`
  padding: 0.5rem 1rem;
  background: #fff;
  color: #4361ee;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #eef0ff;
    border-color: #4361ee;
  }

  &:disabled {
    color: #adb5bd;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background: #fff;
  border-radius: 12px;
  color: #6c757d;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
`;
