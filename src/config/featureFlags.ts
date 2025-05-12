export const featureFlagKeys = [
  'showProjectsButton',
  'showAboutMeButton',
  'showExpertiseButton',
  'showCpuArchitecture',
  'showDockNavigation',
  'showButtonNavigation',
  // Add more flags as needed
] as const;
export type FeatureFlagKey = typeof featureFlagKeys[number]; 