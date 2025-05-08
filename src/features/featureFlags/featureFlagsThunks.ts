import { createAsyncThunk } from '@reduxjs/toolkit';
import { setAllFlags, setFlag } from './featureFlagsSlice';
import { FeatureFlagKey } from '@/config/featureFlags';

export const fetchFeatureFlags = createAsyncThunk(
  'featureFlags/fetchAll',
  async (_, { dispatch }) => {
    const res = await fetch('/api/feature-flags');
    const data = await res.json();
    if (Array.isArray(data)) {
      const backendFlags = Object.fromEntries(data.map((f) => [f.key, f.value]));
      dispatch(setAllFlags(backendFlags));
    }
  }
);

export const updateFeatureFlag = createAsyncThunk(
  'featureFlags/update',
  async ({ key, value }: { key: FeatureFlagKey; value: boolean }, { dispatch }) => {
    await fetch('/api/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    dispatch(setFlag({ key, value }));
  }
); 