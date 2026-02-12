import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from './errorUtils';

describe('extractErrorMessage', () => {
  it('AxiosError에서 서버 메시지 추출', () => {
    const error = {
      response: {
        data: { message: '이메일이 이미 존재합니다.' },
        status: 409,
      },
    };
    expect(extractErrorMessage(error)).toBe('이메일이 이미 존재합니다.');
  });

  it('response.data.message가 없으면 fallback', () => {
    const error = {
      response: {
        data: {},
        status: 500,
      },
    };
    expect(extractErrorMessage(error)).toBe('요청에 실패했습니다.');
  });

  it('커스텀 fallback 메시지', () => {
    const error = {
      response: {
        data: {},
        status: 500,
      },
    };
    expect(extractErrorMessage(error, '사용자 정의 에러')).toBe('사용자 정의 에러');
  });

  it('네트워크 에러', () => {
    const error = new Error('Network Error');
    expect(extractErrorMessage(error)).toBe('네트워크 연결을 확인해주세요.');
  });

  it('일반 에러 → fallback', () => {
    const error = new Error('기타 에러');
    expect(extractErrorMessage(error)).toBe('요청에 실패했습니다.');
  });

  it('null → fallback', () => {
    expect(extractErrorMessage(null)).toBe('요청에 실패했습니다.');
  });

  it('undefined → fallback', () => {
    expect(extractErrorMessage(undefined)).toBe('요청에 실패했습니다.');
  });
});
