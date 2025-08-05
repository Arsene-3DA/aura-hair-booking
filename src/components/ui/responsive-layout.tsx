import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

const containerPadding = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12',
  xl: 'px-8 sm:px-12 lg:px-16'
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = 'md'
}) => {
  return (
    <div className={cn(
      'mx-auto w-full',
      containerSizes[size],
      containerPadding[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapSizes = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10'
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md'
}) => {
  const gridCols = cn(
    'grid',
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `sm:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    cols.large && `xl:grid-cols-${cols.large}`,
    gapSizes[gap],
    className
  );

  return (
    <div className={gridCols}>
      {children}
    </div>
  );
};

interface ResponsiveFlex {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const ResponsiveFlex: React.FC<ResponsiveFlex> = ({
  children,
  className = '',
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 'md',
  responsive = true
}) => {
  const flexClasses = cn(
    'flex',
    responsive && direction === 'row' ? 'flex-col sm:flex-row' : `flex-${direction}`,
    `items-${align}`,
    `justify-${justify}`,
    wrap && 'flex-wrap',
    gapSizes[gap],
    className
  );

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};