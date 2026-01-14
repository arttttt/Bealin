import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container, injectable, inject } from 'tsyringe';

describe('DI Container', () => {
  beforeEach(() => {
    container.reset();
  });

  it('resolves registered class dependency', () => {
    // GIVEN
    @injectable()
    class TestRepository {
      findAll(): string[] {
        return ['item1', 'item2'];
      }
    }
    container.register('TestRepository', { useClass: TestRepository });

    // WHEN
    const repo = container.resolve<TestRepository>('TestRepository');

    // THEN
    expect(repo).toBeInstanceOf(TestRepository);
    expect(repo.findAll()).toEqual(['item1', 'item2']);
  });

  it('injects dependencies via constructor', () => {
    // GIVEN
    interface DataSource {
      read(): string;
    }

    @injectable()
    class FileSystemSource implements DataSource {
      read(): string {
        return 'file-data';
      }
    }

    @injectable()
    class Repository {
      constructor(@inject('DataSource') private source: DataSource) {}

      findAll(): string {
        return this.source.read();
      }
    }

    container.register('DataSource', { useClass: FileSystemSource });
    container.register('Repository', { useClass: Repository });

    // WHEN
    const repo = container.resolve<Repository>('Repository');
    const result = repo.findAll();

    // THEN
    expect(result).toBe('file-data');
  });
});
