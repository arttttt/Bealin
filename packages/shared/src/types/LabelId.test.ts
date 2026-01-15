import { describe, it, expect } from 'vitest';
import { LabelId } from './LabelId';

describe('LabelId', () => {
  describe('equals', () => {
    it('returns true when values match', () => {
      // GIVEN
      const id1 = new LabelId('label-123');
      const id2 = new LabelId('label-123');

      // WHEN
      const result = id1.equals(id2);

      // THEN
      expect(result).toBe(true);
    });

    it('returns false when values differ', () => {
      // GIVEN
      const id1 = new LabelId('label-123');
      const id2 = new LabelId('label-456');

      // WHEN
      const result = id1.equals(id2);

      // THEN
      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the underlying value', () => {
      // GIVEN
      const id = new LabelId('label-xyz');

      // WHEN
      const result = id.toString();

      // THEN
      expect(result).toBe('label-xyz');
    });
  });

  describe('value', () => {
    it('exposes the raw string value', () => {
      // GIVEN
      const rawValue = 'label-abc';

      // WHEN
      const id = new LabelId(rawValue);

      // THEN
      expect(id.value).toBe(rawValue);
    });
  });
});
