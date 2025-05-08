export const featureFlagKeys = [
  'showProjectsButton',
  'showAboutMeButton',
  'showExpertiseButton',
  // Add more flags as needed
] as const;
export type FeatureFlagKey = typeof featureFlagKeys[number]; 