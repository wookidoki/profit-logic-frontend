import { formatKRW } from '../utils/formatNumber';
import { theme } from '../styles/theme';
import type { CalculateRequest } from '../types/finance';
import type { CreatorCategory } from '../types/script';

export interface QuestionConfig {
  field: keyof CalculateRequest;
  text: string;
  hint: string;
  unit: string;
  confirm: (v: number) => string;
  transform?: (v: number) => number;
}

export interface CategoryConfig {
  key: CreatorCategory;
  icon: string;
  name: string;
  desc: string;
  color: string;
  greeting: string;
  questions: QuestionConfig[];
  titleTemplate: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'WEB_NOVEL',
    icon: '✍️',
    name: '웹소설 작가',
    desc: '웹소설/웹툴 연재 수익 분석',
    color: theme.colors.secondary,
    greeting: '웹소설 작가시군요! 작품의 수익성을 정확히 분석해드리겠습니다.\n몇 가지 질문을 드릴게요.',
    titleTemplate: '웹소설 수익 분석',
    questions: [
      { field: 'price', text: '작품 한 화(편)의 판매 가격은 얼마인가요?', hint: '예: 3000', unit: '원', confirm: (v) => `화당 ${formatKRW(v)}이군요.` },
      { field: 'variable_cost', text: '한 화를 작성하는데 드는 직접 비용이 있나요?\n(예: 일러스트 외주비, 교정비 등)', hint: '없으면 0', unit: '원', confirm: (v) => v > 0 ? `화당 변동비가 ${formatKRW(v)}이군요.` : '직접 비용이 없으시군요.' },
      { field: 'fixed_cost', text: '매달 고정적으로 나가는 비용은 얼마 정도인가요?\n(예: 작업 도구 구독료, 작업실 비용 등)', hint: '예: 50000', unit: '원/월', confirm: (v) => `월 고정비가 ${formatKRW(v)}이군요.` },
      { field: 'work_hours', text: '하루에 보통 몇 시간 정도 작업하시나요?', hint: '예: 4', unit: '시간', confirm: (v) => `하루 ${v}시간, 월 약 ${v * 22}시간이네요.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '시간당 최소한 얼마는 벌고 싶으신가요?\n(기회비용 기준)', hint: '예: 15000', unit: '원', confirm: (v) => `목표 시급 ${formatKRW(v)}으로 설정하겠습니다.` },
    ],
  },
  {
    key: 'SHORT_FORM',
    icon: '🎬',
    name: '숟폼 크리에이터',
    desc: '유튜브 쇼츠/릴스/틱톡 수익 분석',
    color: theme.colors.danger,
    greeting: '숟폼 크리에이터시군요! 콘텐츠 수익성을 분석해드릴게요.\n몇 가지 정보가 필요합니다.',
    titleTemplate: '숟폼 콘텐츠 수익 분석',
    questions: [
      { field: 'price', text: '영상 하나당 평균 수익은 얼마인가요?\n(광고 수익, 협찬, 후원 등 포함)', hint: '예: 50000', unit: '원', confirm: (v) => `영상당 ${formatKRW(v)} 수익이군요.` },
      { field: 'variable_cost', text: '영상 하나를 만드는데 드는 직접 비용은?\n(소품, 음원, 외주 편집 등)', hint: '없으면 0', unit: '원', confirm: (v) => v > 0 ? `영상당 ${formatKRW(v)}의 비용이 드는군요.` : '직접 비용이 없으시군요.' },
      { field: 'fixed_cost', text: '매달 고정 비용은 얼마인가요?\n(장비 할부, 편집 툴 구독, 스튜디오 등)', hint: '예: 100000', unit: '원/월', confirm: (v) => `월 고정비가 ${formatKRW(v)}이군요.` },
      { field: 'work_hours', text: '하루 평균 콘텐츠 작업 시간은?', hint: '예: 5', unit: '시간', confirm: (v) => `하루 ${v}시간, 월 약 ${v * 22}시간 작업하시는군요.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '시간당 최소 기대 수익은 얼마인가요?', hint: '예: 20000', unit: '원', confirm: (v) => `목표 시급 ${formatKRW(v)}으로 분석하겠습니다.` },
    ],
  },
  {
    key: 'EMOTICON',
    icon: '😊',
    name: '이모티콘 작가',
    desc: '카카오/라인 이모티콘 수익 분석',
    color: theme.colors.warning,
    greeting: '이모티콘 작가시군요! 이모티콘 판매 수익성을 분석해드릴게요.',
    titleTemplate: '이모티콘 수익 분석',
    questions: [
      { field: 'price', text: '이모티콘 세트 하나의 판매가(작가 수익 기준)는 얼마인가요?', hint: '예: 2000', unit: '원', confirm: (v) => `세트당 수익이 ${formatKRW(v)}이군요.` },
      { field: 'variable_cost', text: '세트 하나를 만드는데 드는 직접 비용은?\n(태블릿 소모품, 외주 등)', hint: '없으면 0', unit: '원', confirm: (v) => v > 0 ? `세트당 ${formatKRW(v)}의 변동비가 있군요.` : '직접 비용이 없으시군요.' },
      { field: 'fixed_cost', text: '매달 고정적으로 나가는 비용은?\n(그래픽 툴 구독, 태블릿 할부 등)', hint: '예: 30000', unit: '원/월', confirm: (v) => `월 고정비 ${formatKRW(v)}이군요.` },
      { field: 'work_hours', text: '하루 평균 작업 시간은 몇 시간인가요?', hint: '예: 3', unit: '시간', confirm: (v) => `하루 ${v}시간, 월 약 ${v * 22}시간이네요.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '시간당 최소 목표 수익은?', hint: '예: 12000', unit: '원', confirm: (v) => `목표 시급 ${formatKRW(v)}으로 설정합니다.` },
    ],
  },
  {
    key: 'BLOG',
    icon: '📝',
    name: '블로그/뉴스레터',
    desc: '블로그 광고/구독 수익 분석',
    color: theme.colors.success,
    greeting: '블로그/뉴스레터 운영자시군요! 콘텐츠 수익성을 분석해드릴게요.',
    titleTemplate: '블로그 수익 분석',
    questions: [
      { field: 'price', text: '포스팅 하나당 평균 수익은 얼마인가요?\n(애드센스, 협찬, 구독 수익 등)', hint: '예: 10000', unit: '원', confirm: (v) => `포스팅당 ${formatKRW(v)} 수익이군요.` },
      { field: 'variable_cost', text: '포스팅 하나를 만드는데 드는 직접 비용은?\n(이미지 구매, 도구 사용 등)', hint: '없으면 0', unit: '원', confirm: (v) => v > 0 ? `포스팅당 ${formatKRW(v)}의 비용이 드는군요.` : '직접 비용이 없으시군요.' },
      { field: 'fixed_cost', text: '매달 고정 비용은 얼마인가요?\n(호스팅, 도메인, 도구 구독 등)', hint: '예: 20000', unit: '원/월', confirm: (v) => `월 고정비 ${formatKRW(v)}이군요.` },
      { field: 'work_hours', text: '하루 평균 콘텐츠 작업 시간은?', hint: '예: 3', unit: '시간', confirm: (v) => `하루 ${v}시간, 월 약 ${v * 22}시간이네요.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '시간당 최소 기대 수익은?', hint: '예: 15000', unit: '원', confirm: (v) => `목표 시급 ${formatKRW(v)}으로 분석하겠습니다.` },
    ],
  },
  {
    key: 'INDIE_DEV',
    icon: '💻',
    name: '인디 개발자',
    desc: 'SaaS/앱 서비스 수익 분석',
    color: theme.colors.primary,
    greeting: '인디 개발자시군요! 서비스의 수익성을 분석해드리겠습니다.',
    titleTemplate: 'SaaS/앱 수익 분석',
    questions: [
      { field: 'price', text: '서비스의 월 구독료 또는 건당 판매가는 얼마인가요?', hint: '예: 9900', unit: '원', confirm: (v) => `건당 ${formatKRW(v)}이군요.` },
      { field: 'variable_cost', text: '고객 1명당 드는 변동 비용은?\n(서버 비용, API 호출 비용 등)', hint: '예: 1000', unit: '원', confirm: (v) => v > 0 ? `고객당 ${formatKRW(v)}의 변동비가 있군요.` : '고객당 변동비가 없으시군요.' },
      { field: 'fixed_cost', text: '매달 고정적으로 나가는 비용은?\n(서버 유지비, 도메인, 도구 구독 등)', hint: '예: 200000', unit: '원/월', confirm: (v) => `월 고정비 ${formatKRW(v)}이군요.` },
      { field: 'work_hours', text: '하루 평균 개발/운영 시간은?', hint: '예: 6', unit: '시간', confirm: (v) => `하루 ${v}시간, 월 약 ${v * 22}시간이네요.`, transform: (v) => v * 22 },
      { field: 'hourly_wage', text: '시간당 최소 목표 수익은?\n(취업했을 때 시급 등 기회비용 기준)', hint: '예: 30000', unit: '원', confirm: (v) => `목표 시급 ${formatKRW(v)}으로 분석하겠습니다.` },
    ],
  },
];
