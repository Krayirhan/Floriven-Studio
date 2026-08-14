import type { PresentationSpecV2 } from "./contracts";

export type CompiledPresentationTokens = Record<`--floriven-${string}`, string>;

export function compilePresentationTokens(spec: PresentationSpecV2): CompiledPresentationTokens {
  return {
    "--floriven-palette-name": spec.palette.name,
    "--floriven-color-accent": spec.palette.accent,
    "--floriven-color-background": spec.palette.background,
    "--floriven-color-foreground": spec.palette.foreground,
    "--floriven-font-family": spec.typography.family,
    "--floriven-font-display-family": spec.typography.displayFamily,
    "--floriven-space-unit": `${spec.spacing.unit}px`,
    "--floriven-space-section-gap": `${spec.spacing.sectionGap}px`,
    "--floriven-space-content-inset": `${spec.spacing.contentInset}px`,
    "--floriven-geometry-radius": spec.geometry.radius,
    "--floriven-geometry-border": spec.geometry.border,
    "--floriven-geometry-shadow": spec.geometry.shadow,
    "--floriven-motion-duration": spec.motion.duration,
    "--floriven-motion-easing": spec.motion.easing,
  };
}
