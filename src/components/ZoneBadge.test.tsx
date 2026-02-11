import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ZoneBadge from './ZoneBadge';

describe('ZoneBadge', () => {
  it('GREEN zone → "안전" 텍스트 렌더링', () => {
    render(<ZoneBadge zone="GREEN" />);
    expect(screen.getByText('안전')).toBeInTheDocument();
  });

  it('YELLOW zone → "주의" 텍스트 렌더링', () => {
    render(<ZoneBadge zone="YELLOW" />);
    expect(screen.getByText('주의')).toBeInTheDocument();
  });

  it('RED zone → "위험" 텍스트 렌더링', () => {
    render(<ZoneBadge zone="RED" />);
    expect(screen.getByText('위험')).toBeInTheDocument();
  });
});
