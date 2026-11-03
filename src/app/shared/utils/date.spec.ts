import { describe,expect,it } from 'vitest';
import { formatJapanDate } from './date';
describe('Japan date rendering', () => {
  it('converts UTC exactly once', () => expect(formatJapanDate('2026-10-22T15:30:00Z', true)).toBe('2026/10/23 00:30'));
  it('interprets legacy naive timestamps as UTC', () => expect(formatJapanDate('2026-10-22 15:30:00', true)).toBe('2026/10/23 00:30'));
  it('keeps calendar dates unchanged', () => expect(formatJapanDate('2026-10-23')).toBe('2026/10/23'));
  it('handles invalid/missing values', () => { expect(formatJapanDate('')).toBe(''); expect(formatJapanDate('bad')).toBe(''); });
});
