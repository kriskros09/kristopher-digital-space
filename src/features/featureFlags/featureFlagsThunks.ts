import { createAsyncThunk } from '@reduxjs/toolkit';
import { setAllFlags, setFlag } from './featureFlagsSlice';
import { FeatureFlagKey } from '@/config/featureFlags';

export const fetchFeatureFlags = createAsyncThunk(
  'featureFlags/fetchAll',
  async (_, { dispatch }) => {
    const res = await fetch('/api/feature-flags');
    const data = await res.json();
    if (Array.isArray(data)) {
      const backendFlags = Object.fromEntries(
        data.map((f) => [f.key, { value: f.value, description: f.description }])
      );
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

export const addFeatureFlag = createAsyncThunk(
  'featureFlags/add',
  async (
    { key, description }: { key: FeatureFlagKey; description?: string },
    { dispatch }
  ) => {
    await fetch('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: false, description }),
    });
    dispatch(setFlag({ key, value: false, description }));
  }
);

export const removeFeatureFlag = createAsyncThunk(
  'featureFlags/remove',
  async (key: FeatureFlagKey, { dispatch }) => {
    await fetch(`/api/feature-flags?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    dispatch(setFlag({ key, value: undefined, description: undefined }));
  }
);

export const editFeatureFlagDescription = createAsyncThunk(
  'featureFlags/editDescription',
  async (
    { key, description }: { key: FeatureFlagKey; description: string },
    { dispatch }
  ) => {
    await fetch('/api/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, description }),
    });
    dispatch(setFlag({ key, description }));
  }
); 