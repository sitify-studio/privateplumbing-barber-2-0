'use client';

import { useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { getPageHref } from '@/app/lib/siteContent';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

const FALLBACK_CTA_IMAGE =
  'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg';

type CtaSectionInput = Page['ctaSection'] & {
  subtitle?: unknown;
  label?: unknown;
  image?: { url?: string } | string;
  mediaItems?: Array<{ url?: string }>;
  ctaButton?: { text?: string; url?: string; label?: string; href?: string };
  secondaryButton?: { label: string; href: string };
};

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function resolveCtaBackgroundImage(cta?: CtaSectionInput): string {
  if (!cta) return FALLBACK_CTA_IMAGE;
  const bg =
    typeof cta.backgroundImage === 'string' && cta.backgroundImage.trim()
      ? cta.backgroundImage
      : undefined;
  const raw =
    bg ??
    (typeof cta.image === 'string' ? cta.image : cta.image?.url) ??
    cta.mediaItems?.[0]?.url;
  if (!raw || (typeof raw === 'string' && !raw.trim())) return FALLBACK_CTA_IMAGE;
  return getImageSrc(raw);
}

function resolveCtaButton(cta?: CtaSectionInput): { label: string; href: string } | null {
  if (!cta) return null;
  const primary = cta.primaryButton;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: primary.href?.trim() || '/contact-us',
    };
  }
  const legacy = cta.ctaButton;
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return {
      label,
      href: legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us',
    };
  }
  return null;
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const { pages } = useWebBuilder();
  const { colors, fonts, styles } = useSectionTheme();
  const cta = ctaSection as CtaSectionInput | undefined;

  const heading = useMemo(
    () => tiptapToText(cta?.title) || "Let's ride",
    [cta?.title]
  );
  const primaryCta = useMemo(
    () => resolveCtaButton(cta) ?? { href: '#contact', label: 'Apply to drive' },
    [cta]
  );
  const secondaryCta = useMemo(() => {
    const secondary = cta?.secondaryButton;
    if (secondary?.label?.trim()) {
      return {
        label: secondary.label.trim(),
        href: secondary.href?.trim() || '/contact-us',
      };
    }
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return {
      href: contactPage ? getPageHref(contactPage) : '/contact-us',
      label: contactPage?.name?.trim() || 'Contact Us',
    };
  }, [cta?.secondaryButton, pages]);

  const ctaImage = useMemo(() => resolveCtaBackgroundImage(cta), [cta]);

  const sectionRef = useRef<HTMLElement>(null);
  const { ref: headingRef } = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.1 });

  if (!ctaSection || ctaSection.enabled === false) return null;
  if (!heading && !primaryCta.label) return null;

  const primaryExternal =
    primaryCta.href.startsWith('http') ||
    primaryCta.href.startsWith('mailto:') ||
    primaryCta.href.startsWith('tel:');
  const secondaryExternal =
    secondaryCta.href.startsWith('http') ||
    secondaryCta.href.startsWith('mailto:') ||
    secondaryCta.href.startsWith('tel:');

  const secondaryBtnStyle = {
    ...styles.ctaOnCard,
    border: `1px solid color-mix(in srgb, var(--wb-text-main) 18%, transparent)`,
    fontFamily: fonts.body,
  } as React.CSSProperties;

  const primaryBtnClass =
    'inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90';

  return (
    <section
      ref={sectionRef}
      className={cn('py-16', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="relative w-full overflow-hidden rounded-xl">
            <div className="relative aspect-[16/9] w-full sm:aspect-[4/3]">
              <Image
                key={ctaImage}
                src={ctaImage}
                alt={heading}
                fill
                quality={CMS_IMAGE_QUALITY}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
              />
            </div>
          </div>
          <div className="text-left">
            <h2
              ref={headingRef}
              className="text-4xl font-semibold tracking-tight wb-text-on-dark md:text-6xl"
              style={{ fontFamily: fonts.heading }}
            >
              {heading}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryExternal ? (
                <a
                  href={primaryCta.href}
                  className={primaryBtnClass}
                  style={{ ...styles.primaryCta, fontFamily: fonts.body }}
                >
                  {primaryCta.label}
                </a>
              ) : (
                <Link
                  href={primaryCta.href}
                  className={primaryBtnClass}
                  style={{ ...styles.primaryCta, fontFamily: fonts.body }}
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryExternal ? (
                <a href={secondaryCta.href} className={primaryBtnClass} style={secondaryBtnStyle}>
                  {secondaryCta.label}
                </a>
              ) : (
                <Link href={secondaryCta.href} className={primaryBtnClass} style={secondaryBtnStyle}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
