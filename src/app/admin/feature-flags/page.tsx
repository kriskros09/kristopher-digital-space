"use client";

import { useState } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { featureFlagKeys, FeatureFlagKey } from '@/config/featureFlags';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader as DialogModalHeader,
  DialogFooter,
  DialogTitle as DialogModalTitle,
  DialogDescription as DialogModalDescription,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/modals/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/common/card';

export default function FeatureFlagsPage() {
  const { flags, toggleFlag, addFlag, removeFlag, editDescription } = useFeatureFlags();
  const [descInputs, setDescInputs] = useState<Record<FeatureFlagKey, string>>({} as Record<FeatureFlagKey, string>);
  const [editMode, setEditMode] = useState<Record<FeatureFlagKey, boolean>>({} as Record<FeatureFlagKey, boolean>);
  const [removeKey, setRemoveKey] = useState<FeatureFlagKey | null>(null);

  // Split flags into active (in DB) and available (not in DB)
  const activeFlags = featureFlagKeys.filter((key) => flags[key]);
  const availableFlags = featureFlagKeys.filter((key) => !flags[key]);

  // Handlers with toasts
  const handleAdd = (key: FeatureFlagKey) => {
    addFlag(key, descInputs[key] ?? '');
    setDescInputs((d) => ({ ...d, [key]: '' }));
    toast.success(`Feature flag '${key}' added.`);
  };
  const handleRemove = (key: FeatureFlagKey) => {
    removeFlag(key);
    setRemoveKey(null);
    toast.success(`Feature flag '${key}' removed.`);
  };
  const handleToggle = (key: FeatureFlagKey) => {
    toggleFlag(key);
    toast.success(`Feature flag '${key}' toggled.`);
  };
  const handleEditDescription = (key: FeatureFlagKey) => {
    editDescription(key, descInputs[key] ?? '');
    setEditMode((m) => ({ ...m, [key]: false }));
    toast.success(`Description for '${key}' updated.`);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Feature flags allow you to enable, disable, and describe experimental or optional features in your application without deploying new code. Use this dashboard to manage which features are active, add new flags, or update their descriptions.
      </p>
      <div className="flex flex-col 2xl:flex-row gap-8">
        {/* Active Feature Flags */}
        <Card className="min-w-[320px]">
          <CardHeader>
            <CardTitle>Active Feature Flags</CardTitle>
            <CardDescription>
              Toggle, remove, or edit the description of active feature flags.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFlags.length === 0 && <div className="text-gray-400 italic">No active feature flags.</div>}
            {activeFlags.map((key) => {
              const flag = flags[key];
              if (!flag) return null;
              return (
                <div key={key} className="flex items-center gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                  <span className="font-mono w-56">{key}</span>
                  <button
                    className={`px-4 py-2 rounded ${flag.value ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => handleToggle(key)}
                  >
                    {flag.value ? 'Enabled' : 'Disabled'}
                  </button>
                  <Dialog open={removeKey === key} onOpenChange={open => setRemoveKey(open ? key : null)}>
                    <DialogTrigger asChild>
                      <button
                        className="px-2 py-1 rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                        onClick={() => setRemoveKey(key)}
                      >
                        Remove
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogModalHeader>
                        <DialogModalTitle>Remove Feature Flag</DialogModalTitle>
                        <DialogModalDescription>
                          Are you sure you want to remove the feature flag <span className="font-mono font-semibold">{key}</span>? This action cannot be undone.
                        </DialogModalDescription>
                      </DialogModalHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <button className="px-4 py-2 rounded bg-gray-200 mr-2">Cancel</button>
                        </DialogClose>
                        <button
                          className="px-4 py-2 rounded bg-red-600 text-white"
                          onClick={() => handleRemove(key)}
                        >
                          Remove
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="flex items-center gap-2">
                    {editMode[key] ? (
                      <>
                        <input
                          className="border px-2 py-1 rounded text-sm"
                          value={descInputs[key] ?? flag.description ?? ''}
                          onChange={e => setDescInputs(d => ({ ...d, [key]: e.target.value }))}
                        />
                        <button
                          className="px-2 py-1 rounded bg-blue-500 text-white text-xs"
                          onClick={() => handleEditDescription(key)}
                        >
                          Save
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-gray-200 text-xs"
                          onClick={() => setEditMode(m => ({ ...m, [key]: false }))}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500 min-w-[120px]">
                          {flag.description || <span className="italic text-gray-400">No description</span>}
                        </span>
                        <button
                          className="px-2 py-1 rounded bg-gray-100 text-xs border border-gray-300 hover:bg-gray-200"
                          onClick={() => setEditMode(m => ({ ...m, [key]: true }))}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

          </CardContent>
        </Card>
        {/* Available to Add */}
        <Card className="min-w-[320px]">
          <CardHeader>
            <CardTitle>Available to Add</CardTitle>
            <CardDescription>
              Add new feature flags from your configuration. Set a description to help your team understand the flag&apos;s purpose.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableFlags.length === 0 && <div className="text-gray-400 italic">No available feature flags to add.</div>}
            {availableFlags.map((key) => (
              <div key={key} className="flex items-center gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                <span className="font-mono w-56">{key}</span>
                <input
                  className="border px-2 py-1 rounded text-sm"
                  placeholder="Description"
                  value={descInputs[key] ?? ''}
                  onChange={e => setDescInputs(d => ({ ...d, [key]: e.target.value }))}
                />
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
                  onClick={() => handleAdd(key)}
                >
                  Add
                </button>
              </div>
            ))}

          </CardContent>
        </Card>
      </div>
    </>
  );
} 