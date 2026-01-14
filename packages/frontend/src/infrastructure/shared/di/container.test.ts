import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { injectable, inject } from 'tsyringe';

describe('DI Container', () => {
  beforeEach(() => {
    container.reset();
  });

  it('resolves registered class dependency', () => {
    // GIVEN
    @injectable()
    class TestService {
      getValue(): string {
        return 'test-value';
      }
    }
    container.register('TestService', { useClass: TestService });

    // WHEN
    const service = container.resolve<TestService>('TestService');

    // THEN
    expect(service).toBeInstanceOf(TestService);
    expect(service.getValue()).toBe('test-value');
  });

  it('injects dependencies via constructor', () => {
    // GIVEN
    interface Repository {
      find(): string;
    }

    @injectable()
    class MockRepository implements Repository {
      find(): string {
        return 'mock-data';
      }
    }

    @injectable()
    class UseCase {
      constructor(@inject('Repository') private repo: Repository) {}

      execute(): string {
        return this.repo.find();
      }
    }

    container.register('Repository', { useClass: MockRepository });
    container.register('UseCase', { useClass: UseCase });

    // WHEN
    const useCase = container.resolve<UseCase>('UseCase');
    const result = useCase.execute();

    // THEN
    expect(result).toBe('mock-data');
  });

  it('allows replacing registrations for testing', () => {
    // GIVEN
    interface Repository {
      find(): string;
    }

    @injectable()
    class RealRepository implements Repository {
      find(): string {
        return 'real-data';
      }
    }

    @injectable()
    class MockRepository implements Repository {
      find(): string {
        return 'mock-data';
      }
    }

    // First register real implementation
    container.register('Repository', { useClass: RealRepository });

    // WHEN - Replace with mock for testing
    container.register('Repository', { useClass: MockRepository });
    const repo = container.resolve<Repository>('Repository');

    // THEN
    expect(repo.find()).toBe('mock-data');
  });
});
