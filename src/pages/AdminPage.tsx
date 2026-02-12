import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { adminApi } from '../api/adminApi';
import { extractErrorMessage } from '../api/errorUtils';
import { ErrorBanner } from '../styles/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import type { AdminStats, AdminUser } from '../api/adminApi';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.getStats(), adminApi.getUsers()])
      .then(([statsRes, usersRes]) => {
        if (cancelled) return;
        if (statsRes.data.success && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
        if (usersRes.data.success && usersRes.data.data) {
          setUsers(usersRes.data.data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(extractErrorMessage(err, '관리자 데이터를 불러올 수 없습니다.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDeleteUser = async (userId: number, nickname: string) => {
    if (!confirm(`정말 "${nickname}" 사용자를 삭제하시겠습니까? 모든 데이터가 삭제됩니다.`)) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (stats) {
        setStats({ ...stats, user_count: stats.user_count - 1 });
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '사용자 삭제에 실패했습니다.'));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Title>관리자 대시보드</Title>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {stats && (
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.user_count}</StatValue>
            <StatLabel>전체 사용자</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.project_count}</StatValue>
            <StatLabel>프로젝트</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.post_count}</StatValue>
            <StatLabel>게시글</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.comment_count}</StatValue>
            <StatLabel>댓글</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.report_count}</StatValue>
            <StatLabel>리포트</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.chat_count}</StatValue>
            <StatLabel>AI 채팅</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      <SectionTitle>사용자 관리</SectionTitle>
      <UserTable>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>이메일</Th>
            <Th>닉네임</Th>
            <Th>역할</Th>
            <Th>유형</Th>
            <Th>프로젝트</Th>
            <Th>가입일</Th>
            <Th>관리</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.email}</Td>
              <Td>{user.nickname}</Td>
              <RoleTd $isAdmin={user.role === 'ROLE_ADMIN'}>
                {user.role === 'ROLE_ADMIN' ? '관리자' : '사용자'}
              </RoleTd>
              <Td>{user.biz_type ?? '-'}</Td>
              <Td>{user.project_count}</Td>
              <Td>{user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}</Td>
              <Td>
                {user.role !== 'ROLE_ADMIN' && (
                  <DeleteBtn onClick={() => handleDeleteUser(user.id, user.nickname)}>
                    삭제
                  </DeleteBtn>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </UserTable>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1100px;
  margin: 1.5rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-top: 0.5rem;
`;

const UserTable = styled.table`
  width: 100%;
  background: ${theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-collapse: collapse;
  overflow: hidden;
  font-size: 0.8125rem;
`;

const Th = styled.th`
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  color: ${theme.colors.text};
  border-bottom: 1px solid #f1f3f5;
  white-space: nowrap;
`;

const RoleTd = styled(Td)<{ $isAdmin: boolean }>`
  color: ${({ $isAdmin }) => ($isAdmin ? theme.colors.primary : theme.colors.textSecondary)};
  font-weight: ${({ $isAdmin }) => ($isAdmin ? '600' : '400')};
`;

const DeleteBtn = styled.button`
  padding: 0.25rem 0.5rem;
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
