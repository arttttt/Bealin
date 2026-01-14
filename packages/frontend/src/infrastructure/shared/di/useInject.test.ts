import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container, injectable } from 'tsyringe';
import { useInject } from './useInject';

describe('useInject', () => {
  beforeEach(() => {
    container.reset();
  });

  it('resolves dependency from container', () => {
    // GIVEN
    @injectable()
    class TestUseCase {
      execute(): string {
        return 'executed';
      }
    }
    container.register('TestUseCase', { useClass: TestUseCase });

    // WHEN
    const useCase = useInject<TestUseCase>('TestUseCase');

    // THEN
    expect(useCase).toBeInstanceOf(TestUseCase);
    expect(useCase.execute()).toBe('executed');
  });

  it('throws when token is not registered', () => {
    // GIVEN - No registration for 'UnknownService'

    // WHEN/THEN
    expect(() => {
      useInject('UnknownService');
    }).toThrow();
  });
});
