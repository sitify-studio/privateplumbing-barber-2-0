'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import {
  type CmsImageRef,
  collectServiceAreaImageFallbacks,
  resolveSectionImageUrl,
} from '@/app/lib/siteContent';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { tiptapToText } from '@/app/lib/seo';

interface ServiceOverviewProps {
  overview: unknown;
  className?: string;
  imageFallbacks?: CmsImageRef[];
}

export const ServiceOverview: React.FC<ServiceOverviewProps> = ({
  overview,
  className,
  imageFallbacks = [],
}) => {
  const { pages } = useWebBuilder();
  const { colors, fonts, styles } = useSectionTheme();

  const title = useMemo(() => {
    if (!overview || typeof overview !== 'object') return '';
    return tiptapToText((overview as { title?: unknown }).title);
  }, [overview]);

  const description = useMemo(() => {
    if (!overview || typeof overview !== 'object') return '';
    const data = overview as { description?: unknown; subtitle?: unknown };
    return tiptapToText(data.description) || tiptapToText(data.subtitle);
  }, [overview]);

  const secondaryDescription = useMemo(() => {
    if (!overview || typeof overview !== 'object') return '';
    return tiptapToText((overview as { secondaryDescription?: unknown }).secondaryDescription);
  }, [overview]);

  const imageUrl = useMemo(() => {
    if (!overview || typeof overview !== 'object') return undefined;
    const data = overview as Record<string, unknown>;
    const fallbacks =
      imageFallbacks.length > 0
        ? imageFallbacks
        : collectServiceAreaImageFallbacks(null, pages, ['hero', 'cta', 'about', 'homeAbout']);
    return resolveSectionImageUrl(data, fallbacks);
  }, [overview, imageFallbacks, pages]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  if (!overview || typeof overview !== 'object') return null;
  if (!title && !description && !secondaryDescription && !imageUrl) return null;

  const data = overview as Record<string, unknown>;
  const cardBorder = {
    borderColor: 'color-mix(in srgb, var(--wb-text-main) 10%, transparent)',
  } as React.CSSProperties;

  return (
    <section
      className={cn('relative overflow-hidden py-16 md:py-20 lg:py-24', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {Boolean(data.label) && (
              <p className="mb-4 text-sm font-medium wb-text-on-dark-secondary" style={styles.accentText}>
                <TiptapRenderer content={data.label} as="inline" />
              </p>
            )}

            {title && (
              <h2
                ref={titleRef}
                className={cn(
                  'mb-6 text-3xl font-semibold transition-all md:text-4xl lg:text-5xl',
                  titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                )}
                style={{ ...styles.titleGradient, fontFamily: fonts.heading }}
              >
                {typeof data.title === 'object' ? (
                  <TiptapRenderer content={data.title} as="inline" />
                ) : (
                  title
                )}
              </h2>
            )}

            <div className="mb-6 flex items-center">
              <div className="h-px w-12" style={styles.dividerLine} />
              <div className="mx-4 h-2 w-2 rounded-full" style={styles.dividerDot} />
              <div className="h-px w-12" style={styles.dividerLine} />
            </div>

            {description && (
              <div
                ref={descRef}
                className={cn(
                  'mb-6 text-base leading-relaxed wb-text-on-dark-secondary transition-all md:text-lg',
                  descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                )}
              >
                {typeof data.description === 'object' || typeof data.subtitle === 'object' ? (
                  <TiptapRenderer content={data.description ?? data.subtitle} />
                ) : (
                  description
                )}
              </div>
            )}

            {secondaryDescription && (
              <div className="text-base leading-relaxed wb-text-on-dark-secondary md:text-lg">
                {typeof data.secondaryDescription === 'object' ? (
                  <TiptapRenderer content={data.secondaryDescription} />
                ) : (
                  secondaryDescription
                )}
              </div>
            )}
          </div>

          {imageUrl && (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg"
              style={{ ...styles.cardSolid, ...cardBorder }}
            >
              <Image
                key={imageUrl}
                src={imageUrl}
                alt={tiptapToText(data.imageAlt) || title || 'Service overview'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={CMS_IMAGE_QUALITY}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
