import type { InjectionToken } from 'tsyringe';
import { container } from './container';

/**
 * React hook for dependency injection.
 * Use this hook to resolve dependencies in React components and viewmodels.
 *
 * @param token - The injection token to resolve
 * @returns The resolved dependency instance
 *
 * @example
 * function useIssuesViewModel() {
 *   const listIssues = useInject<ListIssuesUseCase>(DI_TOKENS.ListIssuesUseCase);
 *   // ...
 * }
 */
export function useInject<T>(token: InjectionToken<T>): T {
  return container.resolve<T>(token);
}
