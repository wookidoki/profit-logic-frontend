import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { projectApi } from '../api/projectApi';
import { chatApi } from '../api/chatApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { Project } from '../types';
import type { ChatMessage, ChatResponse } from '../types/chat';

const SUGGESTED_QUESTIONS = [
  '이 프로젝트 계속할 가치가 있을까?',
  '내 실질 시급은 얼마야?',
  '월 최소 몇 건 해야 본전이야?',
  '성장 가능성은 어때?',
];

function historyToMessages(history: ChatResponse[]): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  for (const h of history) {
    msgs.push({
      id: `h-q-${h.id}`,
      role: 'user',
      content: h.question,
      timestamp: new Date(h.created_at),
    });
    msgs.push({
      id: `h-a-${h.id}`,
      role: 'assistant',
      content: h.answer,
      timestamp: new Date(h.created_at),
    });
  }
  return msgs;
}

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 프로젝트 목록 로드
  useEffect(() => {
    projectApi.getAll()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setProjects(res.data.data);
        }
      })
      .catch(() => { /* 프로젝트 로드 실패 무시 */ });
  }, []);

  // 프로젝트 변경 시 히스토리 로드
  useEffect(() => {
    if (!selectedProjectId) {
      setMessages([]);
      return;
    }
    setLoadingHistory(true);
    chatApi.getHistory(selectedProjectId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          // 백엔드가 DESC로 반환하므로 reverse
          setMessages(historyToMessages([...res.data.data].reverse()));
        } else {
          setMessages([]);
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, [selectedProjectId]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedProjectId || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // textarea 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await chatApi.send({
        project_id: selectedProjectId,
        question: text.trim(),
      });
      if (res.data.success && res.data.data) {
        const assistantMsg: ChatMessage = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          role: 'assistant',
          content: res.data.data.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        addErrorMessage();
      }
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, '죄송합니다. 잠시 후 다시 시도해주세요.');
      addErrorMessage(errMsg);
    } finally {
      setSending(false);
    }
  }, [selectedProjectId, sending]);

  const addErrorMessage = (text = '죄송합니다. 잠시 후 다시 시도해주세요.') => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <Container>
      {/* 상단: 프로젝트 선택 */}
      <TopBar>
        <TopBarTitle>AI 상담</TopBarTitle>
        <ProjectSelect
          value={selectedProjectId ?? ''}
          onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">프로젝트를 선택하세요</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </ProjectSelect>
      </TopBar>

      {/* 중앙: 메시지 영역 */}
      <MessageArea>
        {!selectedProjectId ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyTitle>프로젝트를 선택해주세요</EmptyTitle>
            <EmptyDesc>프로젝트를 선택하면 해당 프로젝트의 재무 데이터를 바탕으로 AI가 맞춤 상담을 제공합니다.</EmptyDesc>
          </EmptyState>
        ) : loadingHistory ? (
          <EmptyState>
            <EmptyDesc>대화 기록을 불러오는 중...</EmptyDesc>
          </EmptyState>
        ) : (
          <>
            {/* 프로젝트 컨텍스트 안내 */}
            <ContextBanner>
              📊 <strong>{selectedProject?.title}</strong> 프로젝트에 대해 질문해보세요.
            </ContextBanner>

            {/* 추천 질문 칩 (메시지 없을 때) */}
            {messages.length === 0 && (
              <SuggestedSection>
                <SuggestedLabel>이런 질문을 해보세요</SuggestedLabel>
                <ChipList>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <Chip key={q} onClick={() => sendMessage(q)}>{q}</Chip>
                  ))}
                </ChipList>
              </SuggestedSection>
            )}

            {/* 메시지 목록 */}
            {messages.map((msg) => (
              <MessageRow key={msg.id} $role={msg.role}>
                <Bubble $role={msg.role}>
                  <BubbleContent>{msg.content}</BubbleContent>
                  <BubbleTime>
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </BubbleTime>
                </Bubble>
              </MessageRow>
            ))}

            {/* 타이핑 인디케이터 */}
            {sending && (
              <MessageRow $role="assistant">
                <Bubble $role="assistant">
                  <TypingDots>
                    <Dot $delay="0s" />
                    <Dot $delay="0.2s" />
                    <Dot $delay="0.4s" />
                  </TypingDots>
                </Bubble>
              </MessageRow>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </MessageArea>

      {/* 하단: 입력 영역 */}
      <InputBar>
        <InputWrapper>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={selectedProjectId ? '메시지를 입력하세요... (Shift+Enter: 줄바꿈)' : '프로젝트를 먼저 선택해주세요'}
            disabled={!selectedProjectId || sending}
            rows={1}
          />
          <SendButton
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || !selectedProjectId || sending}
          >
            전송
          </SendButton>
        </InputWrapper>
      </InputBar>
    </Container>
  );
}

/* ── Styled Components ── */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  max-width: 800px;
  margin: 0 auto;
  background: ${theme.colors.surface};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
`;

const TopBarTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.text};
  white-space: nowrap;
`;

const ProjectSelect = styled.select`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/* ── Empty State ── */

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  gap: 0.5rem;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const EmptyTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const EmptyDesc = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
  max-width: 320px;
  line-height: 1.5;
`;

/* ── Context Banner ── */

const ContextBanner = styled.div`
  padding: 0.625rem 0.875rem;
  background: #eef2ff;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: ${theme.colors.primary};
  text-align: center;
  flex-shrink: 0;
`;

/* ── Suggested Questions ── */

const SuggestedSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  flex: 1;
  justify-content: center;
`;

const SuggestedLabel = styled.span`
  font-size: 0.8125rem;
  color: ${theme.colors.textSecondary};
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 500px;
`;

const Chip = styled.button`
  padding: 0.5rem 0.875rem;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: 20px;
  font-size: 0.8125rem;
  color: ${theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.surface};
    border-color: ${theme.colors.primary};
  }
`;

/* ── Message Bubbles ── */

const MessageRow = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: ${({ $role }) =>
    $role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ $role }) => ($role === 'user' ? theme.colors.primary : '#f1f3f5')};
  color: ${({ $role }) => ($role === 'user' ? theme.colors.surface : theme.colors.text)};
`;

const BubbleContent = styled.div`
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const BubbleTime = styled.div`
  font-size: 0.6875rem;
  opacity: 0.6;
  margin-top: 0.375rem;
  text-align: right;
`;

/* ── Typing Indicator ── */

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 0.25rem 0;
`;

const Dot = styled.div<{ $delay: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #adb5bd;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

/* ── Input Bar ── */

const InputBar = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: ${theme.colors.surface};
  flex-shrink: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const Textarea = styled.textarea`
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  max-height: 120px;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }

  &:disabled {
    background: ${theme.colors.background};
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;
