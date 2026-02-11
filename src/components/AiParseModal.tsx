import { useState } from 'react';
import styled from 'styled-components';
import { projectApi } from '../api/projectApi';
import type { CalculateRequest } from '../types/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: CalculateRequest) => void;
}

export default function AiParseModal({ isOpen, onClose, onParsed }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await projectApi.aiParse(text);
      if (response.data.success && response.data.data) {
        onParsed(response.data.data);
        setText('');
      } else {
        setError(response.data.message ?? '파싱에 실패했습니다.');
      }
    } catch {
      setError('AI 파싱 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <ModalTitle>AI 자동 입력</ModalTitle>
        <Description>
          사업 내용을 자유롭게 입력하세요. AI가 판매가, 비용 등을 자동으로 추출합니다.
        </Description>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 핸드메이드 양초를 개당 15,000원에 판매합니다. 재료비는 개당 5,000원이고, 월 임대료와 전기세 등 고정비가 50만원입니다. 하루 8시간씩 20일 일하고, 시급 9,860원 기준으로 월 200만원 이익을 목표로 합니다."
          rows={6}
          disabled={loading}
        />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <ButtonRow>
          <CancelButton type="button" onClick={onClose} disabled={loading}>
            취소
          </CancelButton>
          <ParseButton type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? '분석 중...' : '분석하기'}
          </ParseButton>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9375rem;
  resize: vertical;
  line-height: 1.6;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const ErrorMsg = styled.p`
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #ef476f;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  color: #6c757d;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }
`;

const ParseButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #7209b7, #4361ee);
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
