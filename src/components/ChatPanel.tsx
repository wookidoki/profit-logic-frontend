import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { chatApi } from '../api/chatApi';
import type { ChatMessage } from '../types';

interface Props {
  projectId: number;
}

export default function ChatPanel({ projectId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatApi.getHistory(projectId);
        if (res.data.success && res.data.data) {
          // API returns desc order, reverse for display
          setMessages([...res.data.data].reverse());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending) return;

    setInput('');
    setSending(true);
    try {
      const res = await chatApi.send({ project_id: projectId, question });
      if (res.data.success && res.data.data) {
        setMessages((prev) => [...prev, res.data.data!]);
      }
    } catch {
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <LoadingText>대화 내역 불러오는 중...</LoadingText>;

  return (
    <Container>
      <MessageArea>
        {messages.length === 0 && (
          <EmptyChat>프로젝트에 대해 궁금한 점을 질문해보세요.</EmptyChat>
        )}
        {messages.map((msg) => (
          <MessageGroup key={msg.id}>
            <UserBubble>{msg.question}</UserBubble>
            <AiBubble>{msg.answer}</AiBubble>
          </MessageGroup>
        ))}
        <div ref={bottomRef} />
      </MessageArea>

      <InputArea>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요..."
          disabled={sending}
        />
        <SendBtn onClick={handleSend} disabled={sending || !input.trim()}>
          {sending ? '...' : '전송'}
        </SendBtn>
      </InputArea>
    </Container>
  );
}

const Container = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  height: 500px;
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyChat = styled.div`
  text-align: center;
  color: #adb5bd;
  font-size: 0.875rem;
  margin-top: 4rem;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UserBubble = styled.div`
  align-self: flex-end;
  background: #4361ee;
  color: #fff;
  padding: 0.625rem 1rem;
  border-radius: 12px 12px 4px 12px;
  max-width: 75%;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const AiBubble = styled.div`
  align-self: flex-start;
  background: #f0f1ff;
  color: #1a1a2e;
  padding: 0.625rem 1rem;
  border-radius: 12px 12px 12px 4px;
  max-width: 75%;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const InputArea = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e9ecef;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

const SendBtn = styled.button`
  padding: 0.625rem 1rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 56px;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
  font-size: 0.875rem;
`;
