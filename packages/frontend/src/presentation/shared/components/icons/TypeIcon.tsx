import { cn } from '@presentation/shared/lib/utils';

export interface TypeIconProps {
  type: string;
  className?: string;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
};

export function TypeIcon({ type, className, size = 'md' }: TypeIconProps) {
  const baseClass = cn(sizeClasses[size], 'flex-shrink-0');

  switch (type) {
    case 'Bug':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      );
    case 'Feature':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <path d="M8 2L10.5 6H14L11 9L12 14L8 11L4 14L5 9L2 6H5.5L8 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'Epic':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <path d="M9 2L6 8H10L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Chore':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'Task':
    default:
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
