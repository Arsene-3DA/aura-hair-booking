import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatPriceWithCurrency } from '@/utils/priceFormatter';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number | null | undefined;
  showCurrency?: boolean;
  showCAD?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  showCurrency = true,
  showCAD = true,
  className,
  size = 'md'
}) => {
  const { i18n } = useTranslation();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-xl font-bold'
  };

  const formattedPrice = formatPrice(amount, {
    language: i18n.language as 'fr' | 'en',
    showCurrency,
    showCAD
  });

  return (
    <span className={cn(sizeClasses[size], className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceDisplay;