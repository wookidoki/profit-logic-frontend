import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { myPageApi } from '../api/myPageApi';
import { extractErrorMessage } from '../api/errorUtils';
import { ErrorBanner } from '../styles/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import type { UserProfile, DailyLog } from '../types/mypage';

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

const BIZ_TYPE_LABELS: Record<string, string> = {
  CREATOR: '크리에이터',
  SELLER: '셀러',
  DEVELOPER: '개발자',
};

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  const [memoSaving, setMemoSaving] = useState(false);
  const [error, setError] = useState('');
  const [memoMsg, setMemoMsg] = useState('');

  // Load profile + recent logs on mount
  useEffect(() => {
    let cancelled = false;
    const end = todayString();
    const start = addDays(end, -30);

    Promise.all([myPageApi.getProfile(), myPageApi.getDailyLogs(start, end)])
      .then(([profileRes, logsRes]) => {
        if (cancelled) return;
        if (profileRes.data.success && profileRes.data.data) {
          setProfile(profileRes.data.data);
        }
        if (logsRes.data.success && logsRes.data.data) {
          setRecentLogs(logsRes.data.data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(extractErrorMessage(err, '데이터를 불러올 수 없습니다.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Load daily log when date changes
  useEffect(() => {
    let cancelled = false;
    setLogLoading(true);
    setDailyLog(null);
    setMemoMsg('');

    myPageApi.getDailyLog(selectedDate)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          setDailyLog(res.data.data);
          setMemo(res.data.data.personal_memo ?? '');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(extractErrorMessage(err, '기록을 불러올 수 없습니다.'));
      })
      .finally(() => { if (!cancelled) setLogLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const handleSaveMemo = async () => {
    setMemoSaving(true);
    setMemoMsg('');
    try {
      const res = await myPageApi.updateMemo(selectedDate, { personal_memo: memo });
      if (res.data.success && res.data.data) {
        setDailyLog(res.data.data);
        setMemoMsg('저장되었습니다.');
        setTimeout(() => setMemoMsg(''), 2000);
      }
    } catch (err: unknown) {
      setMemoMsg(extractErrorMessage(err, '메모 저장에 실패했습니다.'));
    } finally {
      setMemoSaving(false);
    }
  };

  const goToPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goToNext = () => {
    const next = addDays(selectedDate, 1);
    if (next <= todayString()) setSelectedDate(next);
  };

  if (loading) return <LoadingSpinner />;

  const summaries = dailyLog ? [
    { label: '프로젝트 활동', icon: '\uD83D\uDCC1', content: dailyLog.project_summary },
    { label: '비용 기록', icon: '\uD83D\uDCB0', content: dailyLog.cost_summary },
    { label: '작업시간', icon: '\u23F1', content: dailyLog.time_log_summary },
    { label: 'AI 상담', icon: '\uD83D\uDCAC', content: dailyLog.chat_summary },
    { label: '커뮤니티 활동', icon: '\uD83D\uDCDD', content: dailyLog.community_summary },
  ] : [];

  const hasActivity = summaries.some((s) => s.content);

  return (
    <Container>
      <Title>마이페이지</Title>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Profile Card */}
      {profile && (
        <ProfileCard>
          <ProfileHeader>
            <AvatarCircle>{profile.nickname.charAt(0)}</AvatarCircle>
            <ProfileInfo>
              <ProfileName>{profile.nickname}</ProfileName>
              <ProfileEmail>{profile.email}</ProfileEmail>
              {profile.biz_type && (
                <BizBadge>{BIZ_TYPE_LABELS[profile.biz_type] ?? profile.biz_type}</BizBadge>
              )}
            </ProfileInfo>
          </ProfileHeader>
          <StatsRow>
            <StatItem>
              <StatNum>{profile.project_count}</StatNum>
              <StatLabel>프로젝트</StatLabel>
            </StatItem>
            <StatItem>
              <StatNum>{profile.total_chat_count}</StatNum>
              <StatLabel>AI 상담</StatLabel>
            </StatItem>
            <StatItem>
              <StatNum>{profile.total_post_count}</StatNum>
              <StatLabel>게시글</StatLabel>
            </StatItem>
            <StatItem>
              <StatNum>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                  : '-'}
              </StatNum>
              <StatLabel>가입일</StatLabel>
            </StatItem>
          </StatsRow>
        </ProfileCard>
      )}

      {/* Date Navigator */}
      <DateNav>
        <DateBtn onClick={goToPrev}>&larr;</DateBtn>
        <DateDisplay>{formatDate(selectedDate)}</DateDisplay>
        <DateBtn onClick={goToNext} disabled={addDays(selectedDate, 1) > todayString()}>&rarr;</DateBtn>
      </DateNav>

      {/* Daily Log */}
      {logLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {hasActivity ? (
            <SummaryGrid>
              {summaries
                .filter((s) => s.content)
                .map((s) => (
                  <SummaryCard key={s.label}>
                    <SummaryTitle>{s.icon} {s.label}</SummaryTitle>
                    <SummaryContent>{s.content}</SummaryContent>
                  </SummaryCard>
                ))}
            </SummaryGrid>
          ) : (
            <EmptyCard>이 날의 활동 기록이 없습니다.</EmptyCard>
          )}

          {/* Personal Memo */}
          <MemoSection>
            <MemoTitle>개인 메모</MemoTitle>
            <MemoTextarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘의 생각이나 할 일을 기록하세요..."
              maxLength={2000}
            />
            <MemoFooter>
              <CharCount>{memo.length}/2000</CharCount>
              <MemoActions>
                {memoMsg && <MemoMsg $success={memoMsg === '저장되었습니다.'}>{memoMsg}</MemoMsg>}
                <SaveBtn onClick={handleSaveMemo} disabled={memoSaving}>
                  {memoSaving ? '저장 중...' : '저장'}
                </SaveBtn>
              </MemoActions>
            </MemoFooter>
          </MemoSection>
        </>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <RecentSection>
          <SectionTitle>최근 기록</SectionTitle>
          <RecentList>
            {recentLogs.map((log) => {
              const hasSummary = log.project_summary || log.cost_summary
                || log.time_log_summary || log.chat_summary || log.community_summary;
              return (
                <RecentItem
                  key={log.id}
                  $active={log.log_date === selectedDate}
                  onClick={() => setSelectedDate(log.log_date)}
                >
                  <RecentDate>{formatDate(log.log_date)}</RecentDate>
                  <RecentStatus>
                    {hasSummary && <ActivityDot />}
                    {log.personal_memo && <MemoDot />}
                    {!hasSummary && !log.personal_memo && <span style={{ color: theme.colors.textSecondary, fontSize: '0.75rem' }}>기록 없음</span>}
                  </RecentStatus>
                </RecentItem>
              );
            })}
          </RecentList>
        </RecentSection>
      )}
    </Container>
  );
}

// ── Styled Components ──

const Container = styled.div`
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 0 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

// Profile
const ProfileCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${theme.shadow.md};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

const AvatarCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProfileName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const ProfileEmail = styled.div`
  font-size: 0.8125rem;
  color: ${theme.colors.textSecondary};
`;

const BizBadge = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  width: fit-content;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  border-top: 1px solid ${theme.colors.border};
  padding-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNum = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.125rem;
`;

// Date Navigator
const DateNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const DateBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  box-shadow: ${theme.shadow.sm};
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primary};
    color: ${theme.colors.surface};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const DateDisplay = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text};
  min-width: 200px;
  text-align: center;
`;

// Summary Cards
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
`;

const SummaryCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: ${theme.shadow.sm};
`;

const SummaryTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const SummaryContent = styled.pre`
  font-family: inherit;
  font-size: 0.8125rem;
  color: ${theme.colors.text};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  line-height: 1.6;
`;

const EmptyCard = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  background: ${theme.colors.surface};
  border-radius: 12px;
  color: ${theme.colors.textSecondary};
  font-size: 0.875rem;
  box-shadow: ${theme.shadow.sm};
`;

// Memo
const MemoSection = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: ${theme.shadow.sm};
`;

const MemoTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 0.75rem;
`;

const MemoTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.6;
  resize: vertical;
  color: ${theme.colors.text};
  background: ${theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const MemoFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const CharCount = styled.span`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
`;

const MemoActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MemoMsg = styled.span<{ $success: boolean }>`
  font-size: 0.75rem;
  color: ${({ $success }) => ($success ? theme.colors.success : theme.colors.danger)};
`;

const SaveBtn = styled.button`
  padding: 0.375rem 1rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Recent Logs
const RecentSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 0.75rem;
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const RecentItem = styled.button<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  background: ${({ $active }) => ($active ? `${theme.colors.primary}10` : theme.colors.surface)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  border-radius: 8px;
  text-align: left;
  transition: all 0.15s;

  &:hover {
    background: ${theme.colors.primary}08;
  }
`;

const RecentDate = styled.span`
  font-size: 0.8125rem;
  color: ${theme.colors.text};
`;

const RecentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const ActivityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.primary};
`;

const MemoDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.success};
`;
