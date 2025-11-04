import React from 'react';
import { CardPriceSummary } from '@/hooks/useCardPrices';

interface CardPriceDisplayProps {
  priceData?: CardPriceSummary | null;
  showSource?: boolean;
  showTrend?: boolean;
  compact?: boolean;
  className?: string;
}

export const CardPriceDisplay: React.FC<CardPriceDisplayProps> = ({
  priceData,
  showSource = true,
  showTrend = false,
  compact = false,
  className = ''
}) => {
  // Price display completely removed - always return null
  return null;
};

export default CardPriceDisplay;
