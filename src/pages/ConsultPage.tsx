import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { useAuthStore } from '../store/authStore';
import { formatKRW } from '../utils/formatNumber';
import type { CalculateRequest, CalculateResponse } from '../types/finance';
import type { CreatorCategory } from '../types/script';

/* ── Category Configuration ── */

interface QuestionConfig {
  field: keyof CalculateRequest;
  text: string;
  hint: string;
  unit: string;
  confirm: (v: number) => string;
  transform?: (v: number) => number;
}

interface CategoryConfig {
  key: CreatorCategory;
  icon: string;
  name: string;
  desc: string;
  color: string;
  greeting: string;
  questions: QuestionConfig[];
  titleTemplate: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'WEB_NOVEL',
    icon: '\u270D\uFE0F',
    name: '\uC6F9\uC18C\uC124 \uC791\uAC00',
    desc: '\uC6F9\uC18C\uC124/\uC6F9\uD234 \uC5F0\uC7AC \uC218\uC775 \uBD84\uC11D',
    color: '#7209b7',
    greeting: '\uC6F9\uC18C\uC124 \uC791\uAC00\uC2DC\uAD70\uC694! \uC791\uD488\uC758 \uC218\uC775\uC131\uC744 \uC815\uD655\uD788 \uBD84\uC11D\uD574\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.\n\uBA87 \uAC00\uC9C0 \uC9C8\uBB38\uC744 \uB4DC\uB9B4\uAC8C\uC694.',
    titleTemplate: '\uC6F9\uC18C\uC124 \uC218\uC775 \uBD84\uC11D',
    questions: [
      { field: 'price', text: '\uC791\uD488 \uD55C \uD654(\uD3B8)\uC758 \uD310\uB9E4 \uAC00\uACA9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?', hint: '\uC608: 3000', unit: '\uC6D0', confirm: (v) => `\uD654\uB2F9 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'variable_cost', text: '\uD55C \uD654\uB97C \uC791\uC131\uD558\uB294\uB370 \uB4DC\uB294 \uC9C1\uC811 \uBE44\uC6A9\uC774 \uC788\uB098\uC694?\n(\uC608: \uC77C\uB7EC\uC2A4\uD2B8 \uC678\uC8FC\uBE44, \uAD50\uC815\uBE44 \uB4F1)', hint: '\uC5C6\uC73C\uBA74 0', unit: '\uC6D0', confirm: (v) => v > 0 ? `\uD654\uB2F9 \uBCC0\uB3D9\uBE44\uAC00 ${formatKRW(v)}\uC774\uAD70\uC694.` : '\uC9C1\uC811 \uBE44\uC6A9\uC774 \uC5C6\uC73C\uC2DC\uAD70\uC694.' },
      { field: 'fixed_cost', text: '\uB9E4\uB2EC \uACE0\uC815\uC801\uC73C\uB85C \uB098\uAC00\uB294 \uBE44\uC6A9\uC740 \uC5BC\uB9C8 \uC815\uB3C4\uC778\uAC00\uC694?\n(\uC608: \uC791\uC5C5 \uB3C4\uAD6C \uAD6C\uB3C5\uB8CC, \uC791\uC5C5\uC2E4 \uBE44\uC6A9 \uB4F1)', hint: '\uC608: 50000', unit: '\uC6D0/\uC6D4', confirm: (v) => `\uC6D4 \uACE0\uC815\uBE44\uAC00 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'work_hours', text: '\uD558\uB8E8\uC5D0 \uBCF4\uD1B5 \uBA87 \uC2DC\uAC04 \uC815\uB3C4 \uC791\uC5C5\uD558\uC2DC\uB098\uC694?', hint: '\uC608: 4', unit: '\uC2DC\uAC04', confirm: (v) => `\uD558\uB8E8 ${v}\uC2DC\uAC04, \uC6D4 \uC57D ${v * 22}\uC2DC\uAC04\uC774\uB124\uC694.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '\uC2DC\uAC04\uB2F9 \uCD5C\uC18C\uD55C \uC5BC\uB9C8\uB294 \uBC8C\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?\n(\uAE30\uD68C\uBE44\uC6A9 \uAE30\uC900)', hint: '\uC608: 15000', unit: '\uC6D0', confirm: (v) => `\uBAA9\uD45C \uC2DC\uAE09 ${formatKRW(v)}\uC73C\uB85C \uC124\uC815\uD558\uACA0\uC2B5\uB2C8\uB2E4.` },
    ],
  },
  {
    key: 'SHORT_FORM',
    icon: '\uD83C\uDFAC',
    name: '\uC21F\uD3FC \uD06C\uB9AC\uC5D0\uC774\uD130',
    desc: '\uC720\uD29C\uBE0C \uC1FC\uCE20/\uB9B4\uC2A4/\uD2F1\uD1A1 \uC218\uC775 \uBD84\uC11D',
    color: '#ef476f',
    greeting: '\uC21F\uD3FC \uD06C\uB9AC\uC5D0\uC774\uD130\uC2DC\uAD70\uC694! \uCF58\uD150\uCE20 \uC218\uC775\uC131\uC744 \uBD84\uC11D\uD574\uB4DC\uB9B4\uAC8C\uC694.\n\uBA87 \uAC00\uC9C0 \uC815\uBCF4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.',
    titleTemplate: '\uC21F\uD3FC \uCF58\uD150\uCE20 \uC218\uC775 \uBD84\uC11D',
    questions: [
      { field: 'price', text: '\uC601\uC0C1 \uD558\uB098\uB2F9 \uD3C9\uADE0 \uC218\uC775\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?\n(\uAD11\uACE0 \uC218\uC775, \uD611\uCC2C, \uD6C4\uC6D0 \uB4F1 \uD3EC\uD568)', hint: '\uC608: 50000', unit: '\uC6D0', confirm: (v) => `\uC601\uC0C1\uB2F9 ${formatKRW(v)} \uC218\uC775\uC774\uAD70\uC694.` },
      { field: 'variable_cost', text: '\uC601\uC0C1 \uD558\uB098\uB97C \uB9CC\uB4DC\uB294\uB370 \uB4DC\uB294 \uC9C1\uC811 \uBE44\uC6A9\uC740?\n(\uC18C\uD488, \uC74C\uC6D0, \uC678\uC8FC \uD3B8\uC9D1 \uB4F1)', hint: '\uC5C6\uC73C\uBA74 0', unit: '\uC6D0', confirm: (v) => v > 0 ? `\uC601\uC0C1\uB2F9 ${formatKRW(v)}\uC758 \uBE44\uC6A9\uC774 \uB4DC\uB294\uAD70\uC694.` : '\uC9C1\uC811 \uBE44\uC6A9\uC774 \uC5C6\uC73C\uC2DC\uAD70\uC694.' },
      { field: 'fixed_cost', text: '\uB9E4\uB2EC \uACE0\uC815 \uBE44\uC6A9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?\n(\uC7A5\uBE44 \uD560\uBD80, \uD3B8\uC9D1 \uD234 \uAD6C\uB3C5, \uC2A4\uD29C\uB514\uC624 \uB4F1)', hint: '\uC608: 100000', unit: '\uC6D0/\uC6D4', confirm: (v) => `\uC6D4 \uACE0\uC815\uBE44\uAC00 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'work_hours', text: '\uD558\uB8E8 \uD3C9\uADE0 \uCF58\uD150\uCE20 \uC791\uC5C5 \uC2DC\uAC04\uC740?', hint: '\uC608: 5', unit: '\uC2DC\uAC04', confirm: (v) => `\uD558\uB8E8 ${v}\uC2DC\uAC04, \uC6D4 \uC57D ${v * 22}\uC2DC\uAC04 \uC791\uC5C5\uD558\uC2DC\uB294\uAD70\uC694.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '\uC2DC\uAC04\uB2F9 \uCD5C\uC18C \uAE30\uB300 \uC218\uC775\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?', hint: '\uC608: 20000', unit: '\uC6D0', confirm: (v) => `\uBAA9\uD45C \uC2DC\uAE09 ${formatKRW(v)}\uC73C\uB85C \uBD84\uC11D\uD558\uACA0\uC2B5\uB2C8\uB2E4.` },
    ],
  },
  {
    key: 'EMOTICON',
    icon: '\uD83D\uDE0A',
    name: '\uC774\uBAA8\uD2F0\uCF58 \uC791\uAC00',
    desc: '\uCE74\uCE74\uC624/\uB77C\uC778 \uC774\uBAA8\uD2F0\uCF58 \uC218\uC775 \uBD84\uC11D',
    color: '#ffd166',
    greeting: '\uC774\uBAA8\uD2F0\uCF58 \uC791\uAC00\uC2DC\uAD70\uC694! \uC774\uBAA8\uD2F0\uCF58 \uD310\uB9E4 \uC218\uC775\uC131\uC744 \uBD84\uC11D\uD574\uB4DC\uB9B4\uAC8C\uC694.',
    titleTemplate: '\uC774\uBAA8\uD2F0\uCF58 \uC218\uC775 \uBD84\uC11D',
    questions: [
      { field: 'price', text: '\uC774\uBAA8\uD2F0\uCF58 \uC138\uD2B8 \uD558\uB098\uC758 \uD310\uB9E4\uAC00(\uC791\uAC00 \uC218\uC775 \uAE30\uC900)\uB294 \uC5BC\uB9C8\uC778\uAC00\uC694?', hint: '\uC608: 2000', unit: '\uC6D0', confirm: (v) => `\uC138\uD2B8\uB2F9 \uC218\uC775\uC774 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'variable_cost', text: '\uC138\uD2B8 \uD558\uB098\uB97C \uB9CC\uB4DC\uB294\uB370 \uB4DC\uB294 \uC9C1\uC811 \uBE44\uC6A9\uC740?\n(\uD0DC\uBE14\uB9BF \uC18C\uBAA8\uD488, \uC678\uC8FC \uB4F1)', hint: '\uC5C6\uC73C\uBA74 0', unit: '\uC6D0', confirm: (v) => v > 0 ? `\uC138\uD2B8\uB2F9 ${formatKRW(v)}\uC758 \uBCC0\uB3D9\uBE44\uAC00 \uC788\uAD70\uC694.` : '\uC9C1\uC811 \uBE44\uC6A9\uC774 \uC5C6\uC73C\uC2DC\uAD70\uC694.' },
      { field: 'fixed_cost', text: '\uB9E4\uB2EC \uACE0\uC815\uC801\uC73C\uB85C \uB098\uAC00\uB294 \uBE44\uC6A9\uC740?\n(\uADF8\uB798\uD53D \uD234 \uAD6C\uB3C5, \uD0DC\uBE14\uB9BF \uD560\uBD80 \uB4F1)', hint: '\uC608: 30000', unit: '\uC6D0/\uC6D4', confirm: (v) => `\uC6D4 \uACE0\uC815\uBE44 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'work_hours', text: '\uD558\uB8E8 \uD3C9\uADE0 \uC791\uC5C5 \uC2DC\uAC04\uC740 \uBA87 \uC2DC\uAC04\uC778\uAC00\uC694?', hint: '\uC608: 3', unit: '\uC2DC\uAC04', confirm: (v) => `\uD558\uB8E8 ${v}\uC2DC\uAC04, \uC6D4 \uC57D ${v * 22}\uC2DC\uAC04\uC774\uB124\uC694.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '\uC2DC\uAC04\uB2F9 \uCD5C\uC18C \uBAA9\uD45C \uC218\uC775\uC740?', hint: '\uC608: 12000', unit: '\uC6D0', confirm: (v) => `\uBAA9\uD45C \uC2DC\uAE09 ${formatKRW(v)}\uC73C\uB85C \uC124\uC815\uD569\uB2C8\uB2E4.` },
    ],
  },
  {
    key: 'BLOG',
    icon: '\uD83D\uDCDD',
    name: '\uBE14\uB85C\uADF8/\uB274\uC2A4\uB808\uD130',
    desc: '\uBE14\uB85C\uADF8 \uAD11\uACE0/\uAD6C\uB3C5 \uC218\uC775 \uBD84\uC11D',
    color: '#06d6a0',
    greeting: '\uBE14\uB85C\uADF8/\uB274\uC2A4\uB808\uD130 \uC6B4\uC601\uC790\uC2DC\uAD70\uC694! \uCF58\uD150\uCE20 \uC218\uC775\uC131\uC744 \uBD84\uC11D\uD574\uB4DC\uB9B4\uAC8C\uC694.',
    titleTemplate: '\uBE14\uB85C\uADF8 \uC218\uC775 \uBD84\uC11D',
    questions: [
      { field: 'price', text: '\uD3EC\uC2A4\uD305 \uD558\uB098\uB2F9 \uD3C9\uADE0 \uC218\uC775\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?\n(\uC560\uB4DC\uC13C\uC2A4, \uD611\uCC2C, \uAD6C\uB3C5 \uC218\uC775 \uB4F1)', hint: '\uC608: 10000', unit: '\uC6D0', confirm: (v) => `\uD3EC\uC2A4\uD305\uB2F9 ${formatKRW(v)} \uC218\uC775\uC774\uAD70\uC694.` },
      { field: 'variable_cost', text: '\uD3EC\uC2A4\uD305 \uD558\uB098\uB97C \uB9CC\uB4DC\uB294\uB370 \uB4DC\uB294 \uC9C1\uC811 \uBE44\uC6A9\uC740?\n(\uC774\uBBF8\uC9C0 \uAD6C\uB9E4, \uB3C4\uAD6C \uC0AC\uC6A9 \uB4F1)', hint: '\uC5C6\uC73C\uBA74 0', unit: '\uC6D0', confirm: (v) => v > 0 ? `\uD3EC\uC2A4\uD305\uB2F9 ${formatKRW(v)}\uC758 \uBE44\uC6A9\uC774 \uB4DC\uB294\uAD70\uC694.` : '\uC9C1\uC811 \uBE44\uC6A9\uC774 \uC5C6\uC73C\uC2DC\uAD70\uC694.' },
      { field: 'fixed_cost', text: '\uB9E4\uB2EC \uACE0\uC815 \uBE44\uC6A9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?\n(\uD638\uC2A4\uD305, \uB3C4\uBA54\uC778, \uB3C4\uAD6C \uAD6C\uB3C5 \uB4F1)', hint: '\uC608: 20000', unit: '\uC6D0/\uC6D4', confirm: (v) => `\uC6D4 \uACE0\uC815\uBE44 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'work_hours', text: '\uD558\uB8E8 \uD3C9\uADE0 \uCF58\uD150\uCE20 \uC791\uC5C5 \uC2DC\uAC04\uC740?', hint: '\uC608: 3', unit: '\uC2DC\uAC04', confirm: (v) => `\uD558\uB8E8 ${v}\uC2DC\uAC04, \uC6D4 \uC57D ${v * 22}\uC2DC\uAC04\uC774\uB124\uC694.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '\uC2DC\uAC04\uB2F9 \uCD5C\uC18C \uAE30\uB300 \uC218\uC775\uC740?', hint: '\uC608: 15000', unit: '\uC6D0', confirm: (v) => `\uBAA9\uD45C \uC2DC\uAE09 ${formatKRW(v)}\uC73C\uB85C \uBD84\uC11D\uD558\uACA0\uC2B5\uB2C8\uB2E4.` },
    ],
  },
  {
    key: 'INDIE_DEV',
    icon: '\uD83D\uDCBB',
    name: '\uC778\uB514 \uAC1C\uBC1C\uC790',
    desc: 'SaaS/\uC571 \uC11C\uBE44\uC2A4 \uC218\uC775 \uBD84\uC11D',
    color: '#4361ee',
    greeting: '\uC778\uB514 \uAC1C\uBC1C\uC790\uC2DC\uAD70\uC694! \uC11C\uBE44\uC2A4\uC758 \uC218\uC775\uC131\uC744 \uBD84\uC11D\uD574\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.',
    titleTemplate: 'SaaS/\uC571 \uC218\uC775 \uBD84\uC11D',
    questions: [
      { field: 'price', text: '\uC11C\uBE44\uC2A4\uC758 \uC6D4 \uAD6C\uB3C5\uB8CC \uB610\uB294 \uAC74\uB2F9 \uD310\uB9E4\uAC00\uB294 \uC5BC\uB9C8\uC778\uAC00\uC694?', hint: '\uC608: 9900', unit: '\uC6D0', confirm: (v) => `\uAC74\uB2F9 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'variable_cost', text: '\uACE0\uAC1D 1\uBA85\uB2F9 \uB4DC\uB294 \uBCC0\uB3D9 \uBE44\uC6A9\uC740?\n(\uC11C\uBC84 \uBE44\uC6A9, API \uD638\uCD9C \uBE44\uC6A9 \uB4F1)', hint: '\uC608: 1000', unit: '\uC6D0', confirm: (v) => v > 0 ? `\uACE0\uAC1D\uB2F9 ${formatKRW(v)}\uC758 \uBCC0\uB3D9\uBE44\uAC00 \uC788\uAD70\uC694.` : '\uACE0\uAC1D\uB2F9 \uBCC0\uB3D9\uBE44\uAC00 \uC5C6\uC73C\uC2DC\uAD70\uC694.' },
      { field: 'fixed_cost', text: '\uB9E4\uB2EC \uACE0\uC815\uC801\uC73C\uB85C \uB098\uAC00\uB294 \uBE44\uC6A9\uC740?\n(\uC11C\uBC84 \uC720\uC9C0\uBE44, \uB3C4\uBA54\uC778, \uB3C4\uAD6C \uAD6C\uB3C5 \uB4F1)', hint: '\uC608: 200000', unit: '\uC6D0/\uC6D4', confirm: (v) => `\uC6D4 \uACE0\uC815\uBE44 ${formatKRW(v)}\uC774\uAD70\uC694.` },
      { field: 'work_hours', text: '\uD558\uB8E8 \uD3C9\uADE0 \uAC1C\uBC1C/\uC6B4\uC601 \uC2DC\uAC04\uC740?', hint: '\uC608: 6', unit: '\uC2DC\uAC04', confirm: (v) => `\uD558\uB8E8 ${v}\uC2DC\uAC04, \uC6D4 \uC57D ${v * 22}\uC2DC\uAC04\uC774\uB124\uC694.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '\uC2DC\uAC04\uB2F9 \uCD5C\uC18C \uBAA9\uD45C \uC218\uC775\uC740?\n(\uCDE8\uC5C5\uD588\uC744 \uB54C \uC2DC\uAE09 \uB4F1 \uAE30\uD68C\uBE44\uC6A9 \uAE30\uC900)', hint: '\uC608: 30000', unit: '\uC6D0', confirm: (v) => `\uBAA9\uD45C \uC2DC\uAE09 ${formatKRW(v)}\uC73C\uB85C \uBD84\uC11D\uD558\uACA0\uC2B5\uB2C8\uB2E4.` },
    ],
  },
];

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
      { id: 'g1', role: 'assistant', content: '\uC548\uB155\uD558\uC138\uC694! Profit Logic \uC218\uC775\uC131 \uBD84\uC11D \uC804\uBB38 \uC0C1\uB2F4\uC0AC\uC785\uB2C8\uB2E4.\n\uC5B4\uB5A4 \uBD84\uC57C\uC758 \uC0AC\uC5C5\uC744 \uD558\uACE0 \uACC4\uC2E0\uAC00\uC694?', type: 'text' },
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
      content: '\uC88B\uC2B5\uB2C8\uB2E4! \uD558\uC2DC\uB294 \uC0AC\uC5C5\uC5D0 \uB300\uD574 \uC790\uC720\uB86D\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.\n\uC608: "\uB098\uB294 \uC6F9\uC18C\uC124 \uC791\uAC00\uC57C. \uD654\uB2F9 3000\uC6D0 \uBC1B\uACE0, \uACE0\uC815\uBE44\uB294 \uC6D4 5\uB9CC\uC6D0, \uD558\uB8E8 4\uC2DC\uAC04 \uC791\uC5C5\uD574"',
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
      { id: Date.now().toString(36) + Math.random().toString(36).substring(2), role: 'assistant', content: '\uC0C8\uB85C\uC6B4 \uBD84\uC11D\uC744 \uC2DC\uC791\uD560\uAC8C\uC694.\n\uC5B4\uB5A4 \uBD84\uC57C\uC758 \uC0AC\uC5C5\uC744 \uD558\uACE0 \uACC4\uC2E0\uAC00\uC694?', type: 'text' },
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
                    <ResultLabel>\uC190\uC775\uBD84\uAE30\uC810 (BEP)</ResultLabel>
                    <ResultValue $color="#4361ee">{(r.break_even_point ?? 0).toFixed(1)}\uAC1C</ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uC601\uC5C5\uC774\uC775</ResultLabel>
                    <ResultValue $color={(r.operating_profit ?? 0) >= 0 ? '#06d6a0' : '#ef476f'}>
                      {formatKRW(r.operating_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uACBD\uC81C\uC801 \uC774\uC724</ResultLabel>
                    <ResultValue $color={(r.economic_profit ?? 0) >= 0 ? '#06d6a0' : '#ef476f'}>
                      {formatKRW(r.economic_profit)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uACF5\uD5CC\uC774\uC775\uB960</ResultLabel>
                    <ResultValue $color={(r.margin_rate ?? 0) >= 30 ? '#06d6a0' : '#f4a261'}>
                      {(r.margin_rate ?? 0).toFixed(1)}%
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uACF5\uD5CC\uC774\uC775</ResultLabel>
                    <ResultValue $color="#4361ee">
                      {formatKRW(r.contribution_margin)}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>\uC0DD\uC874 \uAC00\uB2A5\uC131</ResultLabel>
                    <ViabilityBadge $viable={r.is_viable}>
                      {r.is_viable ? '\uAC00\uB2A5' : '\uC704\uD5D8'}
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
    lines.push('\uD604\uC7AC \uC218\uC775 \uAD6C\uC870\uB294 \uC0DD\uC874 \uAC00\uB2A5\uD55C \uC218\uC900\uC785\uB2C8\uB2E4.');
  } else {
    lines.push('\uD604\uC7AC \uC218\uC775 \uAD6C\uC870\uC5D0\uC11C\uB294 \uC9C0\uC18D \uAC00\uB2A5\uC131\uC774 \uB0AE\uC2B5\uB2C8\uB2E4. \uAC1C\uC120\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.');
  }
  const bep = r.break_even_point ?? 0;
  if (bep > 0 && bep <= 10) {
    lines.push(`\uC190\uC775\uBD84\uAE30\uC810\uC774 ${bep.toFixed(1)}\uAC1C\uB85C \uBE44\uAD50\uC801 \uB0AE\uC740 \uD3B8\uC774\uC5D0\uC694.`);
  } else if (bep > 50) {
    lines.push(`\uC190\uC775\uBD84\uAE30\uC810\uC774 ${bep.toFixed(1)}\uAC1C\uB85C \uB192\uC740 \uD3B8\uC785\uB2C8\uB2E4. \uBE44\uC6A9 \uC808\uAC10\uC774\uB098 \uAC00\uACA9 \uC778\uC0C1\uC744 \uACE0\uB824\uD574\uBCF4\uC138\uC694.`);
  }
  const margin = r.margin_rate ?? 0;
  if (margin < 20) {
    lines.push('\uACF5\uD5CC\uC774\uC775\uB960\uC774 \uB0AE\uC2B5\uB2C8\uB2E4. \uBCC0\uB3D9\uBE44\uB97C \uC904\uC774\uAC70\uB098 \uAC00\uACA9\uC744 \uB192\uC774\uB294 \uAC83\uC774 \uC88B\uACA0\uC2B5\uB2C8\uB2E4.');
  } else if (margin > 50) {
    lines.push('\uACF5\uD5CC\uC774\uC775\uB960\uC774 \uB192\uC544\uC11C \uC88B\uC740 \uC218\uC775 \uAD6C\uC870\uB97C \uAC00\uC9C0\uACE0 \uC788\uC5B4\uC694!');
  }
  return lines.join('\n');
}

/* ── Styled Components ── */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/* ── Messages ── */

const MessageRow = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  gap: 0.5rem;
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const Bubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: ${({ $role }) => ($role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  background: ${({ $role }) => ($role === 'user' ? '#4361ee' : '#f1f3f5')};
  color: ${({ $role }) => ($role === 'user' ? '#fff' : '#1a1a2e')};
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

/* ── Category Cards ── */

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0 0.5rem 2.5rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #fff;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $color }) => $color};
    box-shadow: 0 2px 12px ${({ $color }) => $color}25;
    transform: translateY(-1px);
  }
`;

const CatIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const CatInfo = styled.div``;

const CatName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const CatDesc = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
  margin-top: 0.125rem;
`;

const FreeInputBtn = styled.button`
  align-self: flex-start;
  padding: 0.5rem 0.875rem;
  background: transparent;
  color: #4361ee;
  border: 1px dashed #4361ee;
  border-radius: 20px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: #4361ee10;
  }
`;

/* ── Results Card ── */

const ResultCard = styled.div`
  margin-left: 2.5rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0fdf9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ResultLabel = styled.span`
  font-size: 0.6875rem;
  color: #6c757d;
`;

const ResultValue = styled.span<{ $color: string }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const ViabilityBadge = styled.span<{ $viable: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: ${({ $viable }) => ($viable ? '#06d6a015' : '#ef476f15')};
  color: ${({ $viable }) => ($viable ? '#06d6a0' : '#ef476f')};
  width: fit-content;
`;

/* ── Save Section ── */

const SaveSection = styled.div`
  margin-left: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #eef2ff;
  border-radius: 12px;
`;

const SaveText = styled.div`
  font-size: 0.8125rem;
  color: #495057;
  line-height: 1.5;
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4361ee;
  color: #fff;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background 0.2s;
  width: fit-content;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ── Saved Section ── */

const SavedSection = styled.div`
  margin-left: 2.5rem;
  padding: 1.25rem;
  background: #f0fdf9;
  border: 1px solid #06d6a050;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SavedText = styled.div`
  font-size: 0.875rem;
  color: #1a1a2e;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const SavedActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button<{ $secondary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s;
  background: ${({ $secondary }) => ($secondary ? '#fff' : '#4361ee')};
  color: ${({ $secondary }) => ($secondary ? '#4361ee' : '#fff')};
  border: 1px solid ${({ $secondary }) => ($secondary ? '#4361ee' : 'transparent')};

  &:hover {
    opacity: 0.85;
  }
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

const Dot = styled.div<{ $i: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #adb5bd;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $i }) => $i * 0.2}s;
`;

/* ── Input Area ── */

const InputArea = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
  flex-shrink: 0;
`;

const InputField = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1.5px solid #dee2e6;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
  &::placeholder {
    color: #adb5bd;
  }
`;

const SendBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4361ee;
  color: #fff;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }
  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;
