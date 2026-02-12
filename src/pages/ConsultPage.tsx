import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { projectApi } from '../api/projectApi';
import { useAuthStore } from '../store/authStore';
import { formatKRW } from '../utils/formatNumber';
import type { CalculateRequest, CalculateResponse } from '../types/finance';
import { CATEGORIES } from '../constants/categories';
import type { CategoryConfig } from '../constants/categories';
import {
  Container,
  ChatArea,
  MessageRow,
  BotAvatar,
  Bubble,
  CategorySection,
  CategoryGrid,
  CategoryCard,
  CatIcon,
  CatInfo,
  CatName,
  CatDesc,
  FreeInputBtn,
  ResultCard,
  ResultGrid,
  ResultItem,
  ResultLabel,
  ResultValue,
  ViabilityBadge,
  SaveSection,
  SaveText,
  SaveButton,
  SavedSection,
  SavedText,
  SavedActions,
  ActionBtn,
  TypingDots,
  Dot,
  InputArea,
  InputField,
  SendBtn,
} from './styles/ConsultPage.styles';

/* ── Message Types ── */

type MessageType = 'text' | 'categories' | 'results' | 'save-prompt' | 'saved';
type Phase = 'greeting' | 'collecting' | 'free-input' | 'analyzing' | 'results' | 'saving' | 'complete';

interface ConsultMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type: MessageType;
  resultData?: CalculateResponse;
  projectId?: number;
}

/* ── Main Component ── */

export default function ConsultPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('greeting');
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<Partial<CalculateRequest>>({});
  const [analysisResult, setAnalysisResult] = useState<CalculateResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Initial greeting
  useEffect(() => {
    setMessages([
      { id: 'g1', role: 'assistant', content: '안녕하세요! Profit Logic 수익성 분석 전문 상담사입니다.\n어떤 유형의 크리에이터신가요?', type: 'text' },
      { id: 'g2', role: 'assistant', content: '', type: 'categories' },
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (phase === 'collecting' || phase === 'free-input') {
      inputRef.current?.focus();
    }
  }, [phase, currentQuestionIndex]);

  const addMsg = useCallback((msg: Omit<ConsultMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString(36) + Math.random().toString(36).substring(2) }]);
  }, []);

  const addDelayed = useCallback((msg: Omit<ConsultMessage, 'id'>, delay = 500) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { ...msg, id: Date.now().toString(36) + Math.random().toString(36).substring(2) }]);
        resolve();
      }, delay);
    });
  }, []);

  /* ── Category Selection ── */
  const handleCategorySelect = useCallback(async (cat: CategoryConfig) => {
    setSelectedCategory(cat);
    addMsg({ role: 'user', content: cat.name, type: 'text' });

    await addDelayed({ role: 'assistant', content: cat.greeting, type: 'text' }, 400);
    await addDelayed({ role: 'assistant', content: cat.questions[0].text, type: 'text' }, 600);

    setCurrentQuestionIndex(0);
    setPhase('collecting');
  }, [addMsg, addDelayed]);

  /* ── Free Input ── */
  const handleFreeInput = useCallback(async () => {
    addMsg({ role: 'user', content: '직접 설명할게요', type: 'text' });
    await addDelayed({
      role: 'assistant',
      content: '좋습니다! 하시는 프로젝트에 대해 자유롭게 설명해주세요.\n예: "나는 웹소설 작가야. 화당 3000원 받고, 고정비는 월 5만원, 하루 4시간 작업해"',
      type: 'text',
    }, 400);
    setPhase('free-input');
  }, [addMsg, addDelayed]);

  /* ── Answer Handler (collecting phase) ── */
  const handleAnswer = useCallback(async (text: string) => {
    if (!selectedCategory) return;
    const q = selectedCategory.questions[currentQuestionIndex];
    const num = parseNumber(text);

    if (isNaN(num) || num < 0) {
      addMsg({ role: 'user', content: text, type: 'text' });
      await addDelayed({ role: 'assistant', content: '숫자를 입력해주세요. (예: 10000)', type: 'text' }, 300);
      return;
    }

    addMsg({ role: 'user', content: `${num.toLocaleString()}${q.unit.split('/')[0]}`, type: 'text' });

    const stored = q.transform ? q.transform(num) : num;
    const newData = { ...collectedData, [q.field]: stored };
    setCollectedData(newData);

    const next = currentQuestionIndex + 1;
    if (next < selectedCategory.questions.length) {
      const nq = selectedCategory.questions[next];
      await addDelayed({ role: 'assistant', content: `${q.confirm(num)}\n\n${nq.text}`, type: 'text' }, 400);
      setCurrentQuestionIndex(next);
    } else {
      await addDelayed({
        role: 'assistant',
        content: `${q.confirm(num)}\n\n감사합니다! 입력하신 데이터로 수익성을 분석하고 있습니다...`,
        type: 'text',
      }, 400);
      setPhase('analyzing');
      runAnalysis({
        ...newData,
        target_profit: (newData.hourly_wage ?? 0) * (newData.work_hours ?? 0),
      } as CalculateRequest);
    }
  }, [selectedCategory, currentQuestionIndex, collectedData, addMsg, addDelayed]);

  /* ── Free Text Handler ── */
  const handleFreeText = useCallback(async (text: string) => {
    addMsg({ role: 'user', content: text, type: 'text' });
    await addDelayed({ role: 'assistant', content: '입력하신 내용을 AI가 분석하고 있습니다...', type: 'text' }, 400);
    setPhase('analyzing');

    try {
      const res = await projectApi.aiParse(text);
      if (res.data.success && res.data.data) {
        const parsed = res.data.data;
        setCollectedData(parsed);
        runAnalysis({ ...parsed, target_profit: parsed.target_profit || (parsed.hourly_wage * parsed.work_hours) });
      } else {
        await addDelayed({
          role: 'assistant',
          content: '입력 내용에서 충분한 데이터를 추출하지 못했습니다.\n좌더 구체적으로 설명해주시거나, 위에서 카테고리를 선택해주세요.',
          type: 'text',
        }, 400);
        setPhase('free-input');
      }
    } catch {
      await addDelayed({ role: 'assistant', content: '분석 중 오류가 발생했습니다. 다시 시도해주세요.', type: 'text' }, 400);
      setPhase('free-input');
    }
  }, [addMsg, addDelayed]);

  /* ── Run Analysis ── */
  const runAnalysis = async (data: CalculateRequest) => {
    try {
      const res = await projectApi.calculate(data);
      if (res.data.success && res.data.data) {
        const result = res.data.data;
        setAnalysisResult(result);

        await addDelayed({ role: 'assistant', content: '분석이 완료되었습니다!', type: 'text' }, 800);
        addMsg({ role: 'assistant', content: '', type: 'results', resultData: result });

        const comment = generateComment(result);
        await addDelayed({ role: 'assistant', content: comment, type: 'text' }, 500);

        if (isAuthenticated) {
          addMsg({
            role: 'assistant',
            content: '이 분석을 프로젝트로 저장하면 매달 추이를 추적하고, AI 상담을 받을 수 있어요.',
            type: 'save-prompt',
          });
        } else {
          await addDelayed({
            role: 'assistant',
            content: '로그인하시면 이 분석을 프로젝트로 저장하고 매달 추이를 추적할 수 있어요.',
            type: 'text',
          }, 400);
        }
        setPhase('results');
      } else {
        throw new Error('fail');
      }
    } catch {
      await addDelayed({
        role: 'assistant',
        content: '분석 중 오류가 발생했습니다. 입력값을 확인하고 다시 시도해주세요.',
        type: 'text',
      }, 400);
      setPhase('collecting');
    }
  };

  /* ── Save as Project ── */
  const handleSave = async () => {
    if (!analysisResult || saving) return;
    setSaving(true);
    setPhase('saving');

    const title = selectedCategory?.titleTemplate || '수익 분석';
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const res = await projectApi.create({
        title: `${title} (${dateStr})`,
        price: collectedData.price || 0,
        variable_cost: collectedData.variable_cost || 0,
        fixed_cost: collectedData.fixed_cost || 0,
        work_hours: collectedData.work_hours || 1,
        hourly_wage: collectedData.hourly_wage || 0,
        creator_category: selectedCategory?.key,
      });

      if (res.data.success && res.data.data) {
        const project = res.data.data;
        addMsg({
          role: 'assistant',
          content: `"${project.title}" 프로젝트가 생성되었습니다!\n대시보드에서 확인하실 수 있어요.\n\n더 궁금한 점이 있으시면 "새 분석"을 입력해주세요.`,
          type: 'saved',
          projectId: project.id,
        });
        setPhase('complete');
      } else {
        throw new Error('fail');
      }
    } catch {
      addMsg({ role: 'assistant', content: '프로젝트 저장에 실패했습니다. 다시 시도해주세요.', type: 'text' });
      setPhase('results');
    } finally {
      setSaving(false);
    }
  };

  /* ── Restart ── */
  const handleRestart = useCallback(() => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setCollectedData({});
    setAnalysisResult(null);
    setPhase('greeting');
    setMessages([
      { id: Date.now().toString(36) + Math.random().toString(36).substring(2), role: 'assistant', content: '새로운 분석을 시작할게요.\n어떤 유형의 크리에이터신가요?', type: 'text' },
      { id: Date.now().toString(36) + Math.random().toString(36).substring(2), role: 'assistant', content: '', type: 'categories' },
    ]);
  }, []);

  /* ── Submit Handler ── */
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (phase === 'collecting') {
      handleAnswer(text);
    } else if (phase === 'free-input') {
      handleFreeText(text);
    } else if (phase === 'results' || phase === 'complete') {
      if (text.includes('새') || text.includes('다시') || text.includes('처음')) {
        handleRestart();
      }
    }
  };

  const getPlaceholder = () => {
    if (phase === 'collecting' && selectedCategory) {
      return selectedCategory.questions[currentQuestionIndex]?.hint || '숫자를 입력하세요';
    }
    if (phase === 'free-input') return '사업에 대해 자유롭게 설명해주세요...';
    if (phase === 'results' || phase === 'complete') return '"새 분석"을 입력하면 처음부터 시작합니다';
    return '';
  };

  const isDisabled = phase === 'greeting' || phase === 'analyzing' || phase === 'saving';

  /* ── Render ── */
  return (
    <Container>
      <ChatArea>
        {messages.map((msg) => {
          /* Category Selection Cards */
          if (msg.type === 'categories') {
            return (
              <CategorySection key={msg.id}>
                <CategoryGrid>
                  {CATEGORIES.map((cat) => (
                    <CategoryCard key={cat.key} $color={cat.color} onClick={() => handleCategorySelect(cat)}>
                      <CatIcon>{cat.icon}</CatIcon>
                      <CatInfo>
                        <CatName>{cat.name}</CatName>
                        <CatDesc>{cat.desc}</CatDesc>
                      </CatInfo>
                    </CategoryCard>
                  ))}
                </CategoryGrid>
                <FreeInputBtn onClick={handleFreeInput}>
                  또는 직접 설명하기 →
                </FreeInputBtn>
              </CategorySection>
            );
          }

          /* Analysis Results Card */
          if (msg.type === 'results' && msg.resultData) {
            const r = msg.resultData;
            return (
              <ResultCard key={msg.id}>
                <ResultGrid>
                  <ResultItem>
                    <ResultLabel>월 최소 건수 (BEP)</ResultLabel>
                    <ResultValue $color={theme.colors.primary}>{(r.break_even_point ?? 0).toFixed(1)}건</ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>월 수익</ResultLabel>
                    <ResultValue $color={(r.operating_profit ?? 0) >= 0 ? theme.colors.success : theme.colors.danger}>
                      {formatKRW(r.operating_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>기회비용 반영 수익</ResultLabel>
                    <ResultValue $color={(r.economic_profit ?? 0) >= 0 ? theme.colors.success : theme.colors.danger}>
                      {formatKRW(r.economic_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>순수익률</ResultLabel>
                    <ResultValue $color={(r.margin_rate ?? 0) >= 30 ? theme.colors.success : '#f4a261'}>
                      {(r.margin_rate ?? 0).toFixed(1)}%
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>건당 순수익</ResultLabel>
                    <ResultValue $color={theme.colors.primary}>
                      {formatKRW(r.contribution_margin)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>지속 가능성</ResultLabel>
                    <ViabilityBadge $viable={r.is_viable}>
                      {r.is_viable ? '지속 가능' : '개선 필요'}
                    </ViabilityBadge>
                  </ResultItem>
                </ResultGrid>
              </ResultCard>
            );
          }

          /* Save Prompt */
          if (msg.type === 'save-prompt') {
            return (
              <SaveSection key={msg.id}>
                <SaveText>{msg.content}</SaveText>
                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '프로젝트로 저장하기'}
                </SaveButton>
              </SaveSection>
            );
          }

          /* Saved Success */
          if (msg.type === 'saved') {
            return (
              <SavedSection key={msg.id}>
                <SavedText>{msg.content}</SavedText>
                <SavedActions>
                  <ActionBtn onClick={() => navigate(`/projects/${msg.projectId}`)}>
                    프로젝트 보기
                  </ActionBtn>
                  <ActionBtn $secondary onClick={() => navigate('/')}>
                    대시보드로 가기
                  </ActionBtn>
                  <ActionBtn $secondary onClick={handleRestart}>
                    새 분석 시작
                  </ActionBtn>
                </SavedActions>
              </SavedSection>
            );
          }

          /* Regular Text Message */
          return (
            <MessageRow key={msg.id} $role={msg.role}>
              {msg.role === 'assistant' && <BotAvatar src="/bot-avatar.svg" alt="bot" />}
              <Bubble $role={msg.role}>{msg.content}</Bubble>
            </MessageRow>
          );
        })}

        {/* Typing Indicator */}
        {phase === 'analyzing' && (
          <MessageRow $role="assistant">
            <BotAvatar src="/bot-avatar.svg" alt="bot" />
            <Bubble $role="assistant">
              <TypingDots><Dot $i={0} /><Dot $i={1} /><Dot $i={2} /></TypingDots>
            </Bubble>
          </MessageRow>
        )}

        <div ref={messagesEndRef} />
      </ChatArea>

      {/* Input Area */}
      <InputArea onSubmit={handleSubmit}>
        <InputField
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={isDisabled}
        />
        <SendBtn type="submit" disabled={isDisabled || !input.trim()}>
          전송
        </SendBtn>
      </InputArea>
    </Container>
  );
}

/* ── Helpers ── */

function parseNumber(text: string): number {
  // "한 400원정도", "약 3,000원" 등 자연어에서 숫자 추출
  const match = text.match(/[\d,]+/);
  if (!match) return NaN;
  return Number(match[0].replace(/,/g, ''));
}

function generateComment(r: CalculateResponse): string {
  const lines: string[] = [];
  if (r.is_viable) {
    lines.push('현재 수익 구조는 지속 가능한 수준입니다.');
  } else {
    lines.push('현재 수익 구조에서는 지속 가능성이 낮습니다. 개선이 필요합니다.');
  }
  const bep = r.break_even_point ?? 0;
  if (bep > 0 && bep <= 10) {
    lines.push(`월 최소 건수가 ${bep.toFixed(1)}건으로 비교적 낮은 편이에요.`);
  } else if (bep > 50) {
    lines.push(`월 최소 건수가 ${bep.toFixed(1)}건으로 높은 편입니다. 비용 절감이나 가격 인상을 고려해보세요.`);
  }
  const margin = r.margin_rate ?? 0;
  if (margin < 20) {
    lines.push('순수익률이 낮습니다. 건당 비용을 줄이거나 건당 수익을 높이는 것이 좋겠습니다.');
  } else if (margin > 50) {
    lines.push('순수익률이 높아서 좋은 수익 구조를 가지고 있어요!');
  }
  return lines.join('\n');
}
