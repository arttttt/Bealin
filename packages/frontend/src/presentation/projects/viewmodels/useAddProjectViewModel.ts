import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInject } from '@di/useInject';
import { DI_TOKENS } from '@di/tokens';
import type { ProjectRepository } from '@domain/repositories/ProjectRepository';
import { FileSystemApiSource } from '@data/sources/api/FileSystemApiSource';

interface ValidationResult {
  valid: boolean;
  suggestedName: string;
}

interface AddProjectViewModelResult {
  readonly path: string;
  readonly setPath: (path: string) => void;
  readonly name: string;
  readonly setName: (name: string) => void;
  readonly isValidating: boolean;
  readonly validationResult: ValidationResult | null;
  readonly error: string | null;
  readonly setError: (error: string | null) => void;
  readonly isReady: boolean;
  readonly reset: () => void;
  readonly browseFolder: () => Promise<void>;
  readonly isBrowsing: boolean;
}

/**
 * ViewModel for AddProjectDialog.
 * Handles path validation with debounce and form state.
 */
export function useAddProjectViewModel(): AddProjectViewModelResult {
  const [path, setPath] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debouncedPath, setDebouncedPath] = useState('');
  const [isBrowsing, setIsBrowsing] = useState(false);

  const projectRepo = useInject<ProjectRepository>(DI_TOKENS.ProjectRepository);
  const fileSystemApi = useInject(FileSystemApiSource);

  // Debounce path changes for validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPath(path.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [path]);

  // Validate path when debounced value changes
  const {
    data: validationResult,
    isLoading: isValidating,
    error: validationError,
  } = useQuery({
    queryKey: ['validatePath', debouncedPath],
    queryFn: () => projectRepo.validatePath(debouncedPath),
    enabled: debouncedPath.length > 0,
    staleTime: 5000,
    retry: false,
  });

  // Update error state from validation
  useEffect(() => {
    if (validationError) {
      setError('Failed to validate path');
    } else if (validationResult && !validationResult.valid && debouncedPath.length > 0) {
      setError('Path does not contain valid beads data');
    } else {
      setError(null);
    }
  }, [validationResult, validationError, debouncedPath]);

  const reset = useCallback(() => {
    setPath('');
    setName('');
    setError(null);
    setDebouncedPath('');
  }, []);

  const browseFolder = useCallback(async () => {
    setIsBrowsing(true);
    setError(null);
    try {
      const result = await fileSystemApi.pickFolder();
      if (result.path) {
        setPath(result.path);
      }
      // If cancelled, do nothing
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open folder picker');
    } finally {
      setIsBrowsing(false);
    }
  }, [fileSystemApi]);

  const isReady = Boolean(
    path.trim().length > 0 &&
    validationResult?.valid &&
    !isValidating &&
    !error
  );

  return {
    path,
    setPath,
    name,
    setName,
    isValidating,
    validationResult: validationResult ?? null,
    error,
    setError,
    isReady,
    reset,
    browseFolder,
    isBrowsing,
  };
}
