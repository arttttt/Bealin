import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileDialogSource } from './FileDialogSource';

describe('FileDialogSource', () => {
  let source: FileDialogSource;
  let originalPlatform: PropertyDescriptor | undefined;

  beforeEach(() => {
    source = new FileDialogSource();
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterEach(() => {
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });

  describe('showFolderPicker', () => {
    describe('on unsupported platform', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', { value: 'freebsd' });
      });

      it('returns error for unsupported platform', async () => {
        // WHEN
        const result = await source.showFolderPicker();

        // THEN
        expect(result.path).toBeNull();
        expect(result.cancelled).toBe(false);
        expect(result.error).toBe('Unsupported platform: freebsd');
      });
    });
  });
});
