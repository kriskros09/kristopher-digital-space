"use client";

import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { featureFlagKeys } from '@/config/featureFlags';

export default function FeatureFlagsPage() {
  const { flags, toggleFlag } = useFeatureFlags();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>
      <div className="space-y-4">
        {featureFlagKeys.map((key) => (
          <div key={key} className="flex items-center gap-4">
            <span className="font-mono w-56">{key}</span>
            <button
              className={`px-4 py-2 rounded ${flags[key] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleFlag(key)}
            >
              {flags[key] ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 