import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureFlagKey } from '@/config/featureFlags';

type FeatureFlagsState = Partial<Record<FeatureFlagKey, boolean>>;

const initialState: FeatureFlagsState = {};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    setFlag(state, action: PayloadAction<{ key: FeatureFlagKey; value: boolean }>) {
      state[action.payload.key] = action.payload.value;
    },
    setAllFlags(state, action: PayloadAction<FeatureFlagsState>) {
      return { ...action.payload };
    },
  },
});

export const { setFlag, setAllFlags } = featureFlagsSlice.actions;
export default featureFlagsSlice.reducer; 