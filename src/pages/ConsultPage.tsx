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
  AvatarCircle,
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
      { id: 'g1', role: 'assistant', content: '\uC548\uB155\uD558\uC138\uC694! Profit Logic \uC218\uC775\uC131 \uBD84\uC11D \uC804\uBB38 \uC0C1\uB2F4\uC0AC\uC785\uB2C8\uB2E4.\n\uC5B4\uB5A4 \uC720\uD615\uC758 \uD06C\uB9AC\uC5D0\uC774\uD130\uC2E0\uAC00\uC694?', type: 'text' },
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
    addMsg({ role: 'user', content: '\uC9C1\uC811 \uC124\uBA85\uD560\uAC8C\uC694', type: 'text' });
    await addDelayed({
      role: 'assistant',
      content: '\uC88B\uC2B5\uB2C8\uB2E4! \uD558\uC2DC\uB294 \uD504\uB85C\uC81D\uD2B8\uC5D0 \uB300\uD574 \uC790\uC720\uB86D\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.\n\uC608: "\uB098\uB294 \uC6F9\uC18C\uC124 \uC791\uAC00\uC57C. \uD654\uB2F9 3000\uC6D0 \uBC1B\uACE0, \uACE0\uC815\uBE44\uB294 \uC6D4 5\uB9CC\uC6D0, \uD558\uB8E8 4\uC2DC\uAC04 \uC791\uC5C5\uD574"',
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
      await addDelayed({ role: 'assistant', content: '\uC22B\uC790\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694. (\uC608: 10000)', type: 'text' }, 300);
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
        content: `${q.confirm(num)}\n\n\uAC10\uC0AC\uD569\uB2C8\uB2E4! \uC785\uB825\uD558\uC2E0 \uB370\uC774\uD130\uB85C \uC218\uC775\uC131\uC744 \uBD84\uC11D\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4...`,
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
    await addDelayed({ role: 'assistant', content: '\uC785\uB825\uD558\uC2E0 \uB0B4\uC6A9\uC744 AI\uAC00 \uBD84\uC11D\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4...', type: 'text' }, 400);
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
          content: '\uC785\uB825 \uB0B4\uC6A9\uC5D0\uC11C \uCDA9\uBD84\uD55C \uB370\uC774\uD130\uB97C \uCD94\uCD9C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.\n\uC88C\uB354 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC124\uBA85\uD574\uC8FC\uC2DC\uAC70\uB098, \uC704\uC5D0\uC11C \uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.',
          type: 'text',
        }, 400);
        setPhase('free-input');
      }
    } catch {
      await addDelayed({ role: 'assistant', content: '\uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.', type: 'text' }, 400);
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

        await addDelayed({ role: 'assistant', content: '\uBD84\uC11D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!', type: 'text' }, 800);
        addMsg({ role: 'assistant', content: '', type: 'results', resultData: result });

        const comment = generateComment(result);
        await addDelayed({ role: 'assistant', content: comment, type: 'text' }, 500);

        if (isAuthenticated) {
          addMsg({
            role: 'assistant',
            content: '\uC774 \uBD84\uC11D\uC744 \uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD558\uBA74 \uB9E4\uB2EC \uCD94\uC774\uB97C \uCD94\uC801\uD558\uACE0, AI \uC0C1\uB2F4\uC744 \uBC1B\uC744 \uC218 \uC788\uC5B4\uC694.',
            type: 'save-prompt',
          });
        } else {
          await addDelayed({
            role: 'assistant',
            content: '\uB85C\uADF8\uC778\uD558\uC2DC\uBA74 \uC774 \uBD84\uC11D\uC744 \uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD558\uACE0 \uB9E4\uB2EC \uCD94\uC774\uB97C \uCD94\uC801\uD560 \uC218 \uC788\uC5B4\uC694.',
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
        content: '\uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC785\uB825\uAC12\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
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

    const title = selectedCategory?.titleTemplate || '\uC218\uC775 \uBD84\uC11D';
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
          content: `"${project.title}" \uD504\uB85C\uC81D\uD2B8\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4!\n\uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C \uD655\uC778\uD558\uC2E4 \uC218 \uC788\uC5B4\uC694.\n\n\uB354 \uAD81\uAE08\uD55C \uC810\uC774 \uC788\uC73C\uC2DC\uBA74 "\uC0C8 \uBD84\uC11D"\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.`,
          type: 'saved',
          projectId: project.id,
        });
        setPhase('complete');
      } else {
        throw new Error('fail');
      }
    } catch {
      addMsg({ role: 'assistant', content: '\uD504\uB85C\uC81D\uD2B8 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.', type: 'text' });
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
      { id: Date.now().toString(36) + Math.random().toString(36).substring(2), role: 'assistant', content: '\uC0C8\uB85C\uC6B4 \uBD84\uC11D\uC744 \uC2DC\uC791\uD560\uAC8C\uC694.\n\uC5B4\uB5A4 \uC720\uD615\uC758 \uD06C\uB9AC\uC5D0\uC774\uD130\uC2E0\uAC00\uC694?', type: 'text' },
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
      if (text.includes('\uC0C8') || text.includes('\uB2E4\uC2DC') || text.includes('\uCC98\uC74C')) {
        handleRestart();
      }
    }
  };

  const getPlaceholder = () => {
    if (phase === 'collecting' && selectedCategory) {
      return selectedCategory.questions[currentQuestionIndex]?.hint || '\uC22B\uC790\uB97C \uC785\uB825\uD558\uC138\uC694';
    }
    if (phase === 'free-input') return '\uC0AC\uC5C5\uC5D0 \uB300\uD574 \uC790\uC720\uB86D\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694...';
    if (phase === 'results' || phase === 'complete') return '"\uC0C8 \uBD84\uC11D"\uC744 \uC785\uB825\uD558\uBA74 \uCC98\uC74C\uBD80\uD130 \uC2DC\uC791\uD569\uB2C8\uB2E4';
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
                  \uB610\uB294 \uC9C1\uC811 \uC124\uBA85\uD558\uAE30 \u2192
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
                    <ResultLabel>\uC6D4 \uCD5C\uC18C \uAC74\uC218 (BEP)</ResultLabel>
                    <ResultValue $color={theme.colors.primary}>{(r.break_even_point ?? 0).toFixed(1)}\uAC74</ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uC6D4 \uC218\uC775</ResultLabel>
                    <ResultValue $color={(r.operating_profit ?? 0) >= 0 ? theme.colors.success : theme.colors.danger}>
                      {formatKRW(r.operating_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uAE30\uD68C\uBE44\uC6A9 \uBC18\uC601 \uC218\uC775</ResultLabel>
                    <ResultValue $color={(r.economic_profit ?? 0) >= 0 ? theme.colors.success : theme.colors.danger}>
                      {formatKRW(r.economic_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uC21C\uC218\uC775\uB960</ResultLabel>
                    <ResultValue $color={(r.margin_rate ?? 0) >= 30 ? theme.colors.success : '#f4a261'}>
                      {(r.margin_rate ?? 0).toFixed(1)}%
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uAC74\uB2F9 \uC21C\uC218\uC775</ResultLabel>
                    <ResultValue $color={theme.colors.primary}>
                      {formatKRW(r.contribution_margin)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uC9C0\uC18D \uAC00\uB2A5\uC131</ResultLabel>
                    <ViabilityBadge $viable={r.is_viable}>
                      {r.is_viable ? '\uC9C0\uC18D \uAC00\uB2A5' : '\uAC1C\uC120 \uD544\uC694'}
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
                  {saving ? '\uC800\uC7A5 \uC911...' : '\uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD558\uAE30'}
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
                    \uD504\uB85C\uC81D\uD2B8 \uBCF4\uAE30
                  </ActionBtn>
                  <ActionBtn $secondary onClick={() => navigate('/')}>
                    \uB300\uC2DC\uBCF4\uB4DC\uB85C \uAC00\uAE30
                  </ActionBtn>
                  <ActionBtn $secondary onClick={handleRestart}>
                    \uC0C8 \uBD84\uC11D \uC2DC\uC791
                  </ActionBtn>
                </SavedActions>
              </SavedSection>
            );
          }

          /* Regular Text Message */
          return (
            <MessageRow key={msg.id} $role={msg.role}>
              {msg.role === 'assistant' && <AvatarCircle>\uD83E\uDDD1\u200D\uD83D\uDCBC</AvatarCircle>}
              <Bubble $role={msg.role}>{msg.content}</Bubble>
            </MessageRow>
          );
        })}

        {/* Typing Indicator */}
        {phase === 'analyzing' && (
          <MessageRow $role="assistant">
            <AvatarCircle>\uD83E\uDDD1\u200D\uD83D\uDCBC</AvatarCircle>
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
          \uC804\uC1A1
        </SendBtn>
      </InputArea>
    </Container>
  );
}

/* ── Helpers ── */

function parseNumber(text: string): number {
  const cleaned = text.replace(/[\uC6D0\uC2DC\uAC04\uC77C\uC6D4,\s/]/g, '').trim();
  return Number(cleaned);
}

function generateComment(r: CalculateResponse): string {
  const lines: string[] = [];
  if (r.is_viable) {
    lines.push('\uD604\uC7AC \uC218\uC775 \uAD6C\uC870\uB294 \uC9C0\uC18D \uAC00\uB2A5\uD55C \uC218\uC900\uC785\uB2C8\uB2E4.');
  } else {
    lines.push('\uD604\uC7AC \uC218\uC775 \uAD6C\uC870\uC5D0\uC11C\uB294 \uC9C0\uC18D \uAC00\uB2A5\uC131\uC774 \uB0AE\uC2B5\uB2C8\uB2E4. \uAC1C\uC120\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.');
  }
  const bep = r.break_even_point ?? 0;
  if (bep > 0 && bep <= 10) {
    lines.push(`\uC6D4 \uCD5C\uC18C \uAC74\uC218\uAC00 ${bep.toFixed(1)}\uAC74\uC73C\uB85C \uBE44\uAD50\uC801 \uB0AE\uC740 \uD3B8\uC774\uC5D0\uC694.`);
  } else if (bep > 50) {
    lines.push(`\uC6D4 \uCD5C\uC18C \uAC74\uC218\uAC00 ${bep.toFixed(1)}\uAC74\uC73C\uB85C \uB192\uC740 \uD3B8\uC785\uB2C8\uB2E4. \uBE44\uC6A9 \uC808\uAC10\uC774\uB098 \uAC00\uACA9 \uC778\uC0C1\uC744 \uACE0\uB824\uD574\uBCF4\uC138\uC694.`);
  }
  const margin = r.margin_rate ?? 0;
  if (margin < 20) {
    lines.push('\uC21C\uC218\uC775\uB960\uC774 \uB0AE\uC2B5\uB2C8\uB2E4. \uAC74\uB2F9 \uBE44\uC6A9\uC744 \uC904\uC774\uAC70\uB098 \uAC74\uB2F9 \uC218\uC775\uC744 \uB192\uC774\uB294 \uAC83\uC774 \uC88B\uACA0\uC2B5\uB2C8\uB2E4.');
  } else if (margin > 50) {
    lines.push('\uC21C\uC218\uC775\uB960\uC774 \uB192\uC544\uC11C \uC88B\uC740 \uC218\uC775 \uAD6C\uC870\uB97C \uAC00\uC9C0\uACE0 \uC788\uC5B4\uC694!');
  }
  return lines.join('\n');
}
