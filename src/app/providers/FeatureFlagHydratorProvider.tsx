"use client";
import { ReactNode } from 'react';
import { useHydrateFeatureFlags } from '@/hooks/useFeatureFlags';

export function FeatureFlagHydratorProvider({ children }: { children: ReactNode }) {
  useHydrateFeatureFlags();
  return <>{children}</>;
} 