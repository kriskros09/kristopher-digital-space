import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import { FeatureFlagKey } from "@/config/featureFlags";
import {
	updateFeatureFlag,
	fetchFeatureFlags,
	addFeatureFlag,
	removeFeatureFlag,
	editFeatureFlagDescription,
} from "@/features/featureFlags/featureFlagsThunks";
import { useEffect } from "react";

export function useFeatureFlags() {
	const flags = useSelector((state: RootState) => state.featureFlags);
	const dispatch = useDispatch<AppDispatch>();
	const toggleFlag = (key: FeatureFlagKey) => {
		dispatch(updateFeatureFlag({ key, value: !flags[key]?.value }));
	};
	const addFlag = (key: FeatureFlagKey, description?: string) => {
		dispatch(addFeatureFlag({ key, description }));
	};
	const removeFlag = (key: FeatureFlagKey) => {
		dispatch(removeFeatureFlag(key));
	};
	const editDescription = (key: FeatureFlagKey, description: string) => {
		dispatch(editFeatureFlagDescription({ key, description }));
	};
	return { flags, toggleFlag, addFlag, removeFlag, editDescription };
}

export function useHydrateFeatureFlags() {
	const dispatch = useDispatch<AppDispatch>();
	useEffect(() => {
		dispatch(fetchFeatureFlags());
	}, [dispatch]);
}
