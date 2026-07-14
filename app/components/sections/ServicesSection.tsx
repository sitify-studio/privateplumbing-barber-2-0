'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';

const FALLBACK_SERVICE_IMAGE =
  'https://images.pexels.com/photos/6195895/pexels-photo-6195895.jpeg';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

function mapServiceToDisplay(service: Service): DisplayService {
  const imageUrl = service.thumbnailImage?.url
    ? getImageSrc(service.thumbnailImage.url)
    : service.galleryImages?.[0]?.url
      ? getImageSrc(service.galleryImages[0].url)
      : FALLBACK_SERVICE_IMAGE;

  const imageAlt =
    service.thumbnailImage?.altText ||
    service.galleryImages?.[0]?.altText ||
    service.name;

  return {
    id: service._id,
    name: service.name,
    description: tiptapToText(service.shortDescription) || '',
    imageUrl,
    imageAlt,
    href: `/service/${resolveServiceSlug(service)}`,
  };
}

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services: allServices } = useWebBuilder();
  const { colors, fonts, styles, text } = useSectionTheme();
  const pageText = text.onLight;
  const cardText = text.onCardSurface;

  const title = useMemo(
    () => tiptapToText(servicesSection?.title) || 'Our Services',
    [servicesSection?.title]
  );
  const description = useMemo(
    () =>
      tiptapToText(servicesSection?.description) ||
      'Discover our range of professional services designed to meet your needs.',
    [servicesSection?.description]
  );

  const displayServices = useMemo(() => {
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      ids.length > 0
        ? ids.map((id) => allServices.find((s) => s._id === id)).filter(Boolean) as Service[]
        : allServices.filter((s) => s.status === 'published');
    return selected.map(mapServiceToDisplay);
  }, [servicesSection?.serviceIds, allServices]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLHeadingElement>({
    threshold: 0.2,
  });
  const { ref: descRef, isVisible: descVisible } = useScrollAnimation<HTMLParagraphElement>({
    threshold: 0.2,
  });

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  const accentBorder = { borderColor: colors.primaryButton } as React.CSSProperties;

  return (
    <section
      id="services"
      className={cn('relative py-16 lg:py-20', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            ref={titleRef}
            className={cn(
              'text-3xl font-semibold md:text-4xl transition-all',
              titleVisible ? 'opacity-100' : 'opacity-0 translate-y-1'
            )}
            style={{ color: pageText.primary, fontFamily: fonts.heading }}
          >
            {title}
          </h2>
          {description && (
            <p
              ref={descRef}
              className={cn(
                'mt-2 transition-all',
                descVisible ? 'opacity-100' : 'opacity-0 translate-y-1'
              )}
              style={{ color: pageText.secondary }}
            >
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
          {displayServices.map((service) => (
            <article
              key={service.id}
              className="flex h-full flex-col border-2"
              style={accentBorder}
            >
              <div
                className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
                style={styles.imagePlaceholder}
              >
                <Image
                  src={service.imageUrl}
                  alt={service.imageAlt}
                  fill
                  quality={CMS_IMAGE_QUALITY}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
                />
              </div>
              <div
                className="flex flex-1 flex-col border-t px-6 py-6 text-center wb-section-card"
                style={{ ...styles.cardSolid, ...accentBorder }}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{ color: cardText.primary, fontFamily: fonts.heading }}
                >
                  {service.name}
                </h3>
                {service.description && (
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: cardText.secondary }}
                  >
                    {service.description}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  <Link
                    href={service.href}
                    className="inline-flex items-center justify-center px-4 py-2 text-[12px] font-bold tracking-wide transition-opacity hover:opacity-90"
                    style={{
                      ...styles.primaryCta,
                      border: `1px solid ${colors.hoverActive}`,
                    }}
                  >
                    BOOK NOW
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
