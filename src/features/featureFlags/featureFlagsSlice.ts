import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeatureFlagKey } from "@/config/featureFlags";

type FeatureFlag = {
	value?: boolean;
	description?: string;
};
type FeatureFlagsState = Partial<Record<FeatureFlagKey, FeatureFlag>>;

const initialState: FeatureFlagsState = {};

const featureFlagsSlice = createSlice({
	name: "featureFlags",
	initialState,
	reducers: {
		setFlag(
			state,
			action: PayloadAction<{
				key: FeatureFlagKey;
				value?: boolean;
				description?: string;
			}>
		) {
			const { key, value, description } = action.payload;
			if (value === undefined && description === undefined) {
				// Remove flag from state
				delete state[key];
			} else {
				state[key] = {
					...(state[key] || {}),
					...(value !== undefined ? { value } : {}),
					...(description !== undefined ? { description } : {}),
				};
			}
		},
		setAllFlags(state, action: PayloadAction<FeatureFlagsState>) {
			return { ...action.payload };
		},
	},
});

export const { setFlag, setAllFlags } = featureFlagsSlice.actions;
export default featureFlagsSlice.reducer;
