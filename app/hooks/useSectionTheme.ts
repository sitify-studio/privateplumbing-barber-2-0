'use client';

import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors } from '@/app/hooks/useTheme';
import { resolveTextOnBackground } from '@/app/lib/utils';

function useRawSiteTheme() {
  const { site } = useWebBuilder();
  return useMemo(() => {
    const t = site?.theme;
    return {
      lightPrimary: t?.lightPrimaryColor ?? t?.mainTextColor,
      lightSecondary: t?.lightSecondaryColor ?? t?.secondaryTextColor,
      textOnDark: t?.textOnDarkColor ?? t?.darkPrimaryColor,
      textOnDarkSecondary: t?.textOnDarkSecondaryColor ?? t?.darkSecondaryColor,
      primary: t?.primaryButtonColorLight ?? t?.primaryButtonColorDark,
      sectionDark: t?.sectionBackgroundColorDark,
    };
  }, [site?.theme]);
}

export function useSectionTheme() {
  const colors = useThemeColors();
  const raw = useRawSiteTheme();

  const textCandidates = useMemo(
    () => ({
      primary: [raw.textOnDark, raw.lightPrimary],
      secondary: [raw.textOnDarkSecondary, raw.lightSecondary],
    }),
    [raw]
  );

  const textOnPrimary = useMemo(() => {
    if (!raw.primary) return 'var(--wb-text-on-dark)';
    return resolveTextOnBackground(raw.primary, textCandidates).primary;
  }, [raw.primary, textCandidates]);

  const textOnCardSurface = useMemo(
    () => ({
      primary: colors.darkPrimaryText,
      secondary: colors.darkSecondaryText,
    }),
    [colors.darkPrimaryText, colors.darkSecondaryText]
  );

  const textOnCardButton = textOnCardSurface.primary;

  const textOnDarkSection = useMemo(() => {
    const bg = raw.sectionDark ?? '#0f0f0f';
    return resolveTextOnBackground(bg, textCandidates);
  }, [raw.sectionDark, textCandidates]);

  return useMemo(
    () => ({
      colors,
      fonts: {
        heading: 'var(--wb-heading-font, Georgia, serif)',
        body: 'var(--wb-body-font, inherit)',
      },
      text: {
        onLight: { primary: colors.mainText, secondary: colors.secondaryText },
        onDark: {
          primary: colors.darkPrimaryText,
          secondary: colors.darkSecondaryText,
        },
        onPrimary: textOnPrimary,
        onCard: textOnCardButton,
        onCardSurface: textOnCardSurface,
        onDarkSection: textOnDarkSection,
      },
      styles: {
        titleGradient: {
          background: `linear-gradient(135deg, ${colors.mainText} 0%, ${colors.primaryButton} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } as React.CSSProperties,
        iconBadge: {
          background: `linear-gradient(135deg, ${colors.primaryButton}, ${colors.hoverActive})`,
          color: textOnPrimary,
        } as React.CSSProperties,
        sectionGradientBg: {
          background: `linear-gradient(135deg, ${colors.sectionBackgroundLight} 0%, ${colors.pageBackground} 50%, color-mix(in srgb, ${colors.primaryButton} 8%, ${colors.pageBackground}) 100%)`,
        } as React.CSSProperties,
        sectionGradientBgAlt: {
          background: `linear-gradient(135deg, ${colors.pageBackground} 0%, ${colors.sectionBackgroundLight} 100%)`,
        } as React.CSSProperties,
        sectionGradientBgSoft: {
          background: `linear-gradient(135deg, ${colors.sectionBackgroundLight} 0%, ${colors.pageBackground} 100%)`,
        } as React.CSSProperties,
        card: {
          borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 90%, transparent)',
          color: colors.darkPrimaryText,
        } as React.CSSProperties,
        cardSolid: {
          borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
          backgroundColor: colors.cardBackground,
          color: colors.darkPrimaryText,
        } as React.CSSProperties,
        imagePlaceholder: {
          backgroundColor: colors.sectionBackgroundLight,
        } as React.CSSProperties,
        imageOverlay: {
          background: `linear-gradient(to top, color-mix(in srgb, ${colors.primaryButton} 60%, transparent), transparent)`,
        } as React.CSSProperties,
        imageOverlayHover: {
          background: `linear-gradient(to top, color-mix(in srgb, ${colors.primaryButton} 80%, transparent), transparent)`,
        } as React.CSSProperties,
        dividerDot: { backgroundColor: colors.primaryButton } as React.CSSProperties,
        dividerLine: {
          backgroundColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)',
        } as React.CSSProperties,
        dividerGradient: {
          background: `linear-gradient(90deg, ${colors.primaryButton}, transparent)`,
        } as React.CSSProperties,
        primaryCta: {
          backgroundColor: colors.primaryButton,
          color: textOnPrimary,
        } as React.CSSProperties,
        ctaOnCard: {
          backgroundColor: colors.cardBackground,
          color: textOnCardButton,
        } as React.CSSProperties,
        statCircle: {
          background: `linear-gradient(135deg, ${colors.primaryButton}, ${colors.hoverActive})`,
          color: textOnPrimary,
        } as React.CSSProperties,
        accentText: { color: colors.primaryButton } as React.CSSProperties,
        floatingDot: { backgroundColor: colors.primaryButton } as React.CSSProperties,
      },
    }),
    [colors, textOnPrimary, textOnCardButton, textOnCardSurface, textOnDarkSection]
  );
}
