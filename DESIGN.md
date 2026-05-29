---
name: SteelSync
version: 1.0.0
colors:
  bg: "#0B0F19"
  surface: "rgba(22, 29, 49, 0.7)"
  border: "rgba(255, 255, 255, 0.08)"
  primary: "#00E5FF" # Electric Cyan
  secondary: "#FF9100" # Neon Amber
  success: "#00E676" # Neon Green
  text-primary: "#F0F4F8"
  text-secondary: "#94A3B8"
typography:
  family-header: "'Outfit', sans-serif"
  family-body: "'Inter', sans-serif"
  size:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    xxl: "1.75rem"
    xxxl: "2.5rem"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
effects:
  blur: "blur(12px)"
  shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
---

# SteelSync Design Guidelines

A sleek, dark, cyberpunk-inspired design system tailored for high-performance workout tracking on mobile devices.

## Principles
1. **High Contrast for Gym Environments**: Bright glowing accents against deep, low-glare dark surfaces ensure readability in gym lighting.
2. **Glassmorphism**: Translucent panels with background blurs provide depth and premium feel.
3. **Micro-interactions**: Subtle scales, active glow animations, and bouncy transitions confirm inputs without typing.
4. **Touch Targets**: Buttons and steppers must have minimum size of 44x44px for easy thumb tapping during workouts.

## Component Styling Rationale
- **Primary Buttons / Actives**: Electric Cyan glow, indicating interaction.
- **Completed Sets / Done states**: Neon Green, providing visual reward.
- **Sliders & Steppers**: Oversized touchpoints with immediate visual numbers.
- **Translucent Cards**: Border of 1px solid white (opacity 0.08) and background blur of 12px.
