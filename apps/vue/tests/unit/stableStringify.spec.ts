import { describe, it, expect } from 'vitest';
import { stableStringify } from '@/utils/stableStringify';

describe('stableStringify', () => {
  it('serializes primitives', () => {
    expect(stableStringify(1)).toBe('1');
    expect(stableStringify('a')).toBe('"a"');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(null)).toBe('null');
  });

  it('serializes arrays', () => {
    expect(stableStringify([1, 'a', false])).toBe('[1,"a",false]');
  });

  it('serializes objects with sorted keys', () => {
    const a = { b: 2, a: 1 } as const;
    const b = { a: 1, b: 2 } as const;
    expect(stableStringify(a)).toBe('{"a":1,"b":2}');
    expect(stableStringify(b)).toBe('{"a":1,"b":2}');
  });

  it('serializes nested structures deterministically', () => {
    const first = { z: [3, 2, 1], a: { y: 'x', b: [{ k: 2 }, { j: 1 }] } };
    const second = { a: { b: [{ j: 1 }, { k: 2 }], y: 'x' }, z: [3, 2, 1] };
    expect(stableStringify(first)).toBe(stableStringify(second));
  });
});
