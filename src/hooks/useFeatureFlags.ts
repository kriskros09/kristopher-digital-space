import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { FeatureFlagKey } from '@/config/featureFlags';
import { updateFeatureFlag, fetchFeatureFlags } from '@/features/featureFlags/featureFlagsThunks';
import { useEffect } from 'react';

export function useFeatureFlags() {
  const flags = useSelector((state: RootState) => state.featureFlags);
  const dispatch = useDispatch<AppDispatch>();
  const toggleFlag = (key: FeatureFlagKey) => {
    dispatch(updateFeatureFlag({ key, value: !flags[key] }));
  };
  return { flags, toggleFlag };
}

export function useHydrateFeatureFlags() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchFeatureFlags());
  }, [dispatch]);
} 