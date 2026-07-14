'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type ServiceAreaDisplay = {
  city: string;
  region: string;
  href?: string;
};

function normalizeServiceArea(area: unknown): Omit<ServiceAreaDisplay, 'href'> | null {
  const city = getAreaCity(area);
  if (!city) return null;
  return { city, region: getAreaRegion(area) };
}

function areaKey(area: { city: string; region: string }) {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function enrichArea(
  area: Omit<ServiceAreaDisplay, 'href'>,
  serviceSlug: string,
  serviceAreaPages: ServiceAreaPage[]
): ServiceAreaDisplay {
  return {
    ...area,
    href: getServiceAreaPageHref(serviceSlug, area, serviceAreaPages),
  };
}

export function ServingAreasSection({
  servingAreasSection,
  className,
}: ServingAreasSectionProps) {
  const { colors, fonts, styles } = useSectionTheme();

  const { services, pages, serviceAreaPages } = useWebBuilder();

  const resolvedServiceAreas = useMemo(() => {
    const result: ServiceAreaDisplay[] = [];
    const seen = new Set<string>();

    const addArea = (area: unknown, serviceSlug: string) => {
      const normalized = normalizeServiceArea(area);
      if (!normalized) return;
      const key = areaKey(normalized);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(enrichArea(normalized, serviceSlug, serviceAreaPages));
    };

    const manualAreas = servingAreasSection?.areas ?? [];
    const configuredServiceIds = servingAreasSection?.serviceIds ?? [];
    const sectionSlug =
      servingAreasSection &&
      'serviceSlug' in servingAreasSection &&
      typeof (servingAreasSection as { serviceSlug?: string }).serviceSlug === 'string'
        ? (servingAreasSection as { serviceSlug: string }).serviceSlug.trim()
        : '';

    const linkSlugForManual =
      sectionSlug ||
      (configuredServiceIds.length > 0
        ? (() => {
            const first = services.find((s) => s._id === configuredServiceIds[0]);
            return first ? resolveServiceSlug(first) : 'services';
          })()
        : 'services');

    if (manualAreas.length > 0) {
      for (const area of manualAreas) {
        addArea(area, linkSlugForManual);
      }
      return result;
    }

    if (configuredServiceIds.length > 0) {
      for (const id of configuredServiceIds) {
        const service = services.find((s) => s._id === id);
        if (!service) continue;
        const slug = resolveServiceSlug(service);
        for (const area of service.serviceAreas ?? []) {
          addArea(area, slug);
        }
      }
      return result;
    }

    if (sectionSlug) {
      const service = services.find((s) => resolveServiceSlug(s) === sectionSlug);
      if (service) {
        for (const area of service.serviceAreas ?? []) {
          addArea(area, sectionSlug);
        }
      }
    }

    return result;
  }, [servingAreasSection?.serviceIds, servingAreasSection?.areas, servingAreasSection, services, serviceAreaPages]);

  const sectionTitle = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.title);
    return text || 'Areas We Serve';
  }, [servingAreasSection?.title]);

  const sectionDescription = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.description);
    return (
      text ||
      'We proudly serve communities across the region, bringing professional services directly to your neighborhood.'
    );
  }, [servingAreasSection?.description]);

  const contactHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [pages]);

  if (!servingAreasSection || servingAreasSection.enabled === false) return null;
  if (resolvedServiceAreas.length === 0) return null;

  const cardBorder = {
    borderColor: 'color-mix(in srgb, var(--wb-text-main) 10%, transparent)',
  } as React.CSSProperties;

  const iconCircleBg = {
    background: `linear-gradient(135deg, color-mix(in srgb, ${colors.primaryButton} 12%, transparent), color-mix(in srgb, ${colors.hoverActive} 12%, transparent))`,
  } as React.CSSProperties;

  return (
    <section
      className={cn('relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative px-4 sm:px-6 md:px-10 lg:px-20">
        <div className="mb-8 text-center sm:mb-12 md:mb-16">
          <h2
            className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl lg:text-4xl"
            style={{ ...styles.titleGradient, fontFamily: fonts.heading }}
          >
            {sectionTitle}
          </h2>
          <p className="mx-auto max-w-3xl text-base wb-text-on-light-secondary sm:text-lg md:text-xl">
            {sectionDescription}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resolvedServiceAreas.map((area) => {
            const card = (
              <div
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:px-5 sm:py-4 wb-section-card"
                style={{ ...styles.cardSolid, ...cardBorder }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
                  style={iconCircleBg}
                >
                  <svg
                    className="h-5 w-5 sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={styles.accentText}
                    aria-hidden
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate text-base font-semibold wb-text-on-light sm:text-lg"
                    style={{ fontFamily: fonts.heading }}
                  >
                    {area.city}
                  </h3>
                  {area.region && (
                    <p className="truncate text-sm wb-text-on-light-secondary">{area.region}</p>
                  )}
                </div>
                {area.href && (
                  <svg
                    className="h-4 w-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={styles.accentText}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            );

            return area.href ? (
              <Link key={areaKey(area)} href={area.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={areaKey(area)}>{card}</div>
            );
          })}
        </div>

        <div className="mt-10 text-center sm:mt-12">
          <div
            className="mx-auto max-w-xl rounded-xl border px-6 py-6 sm:px-8 wb-section-card"
            style={{ ...styles.cardSolid, ...cardBorder }}
          >
            <h3
              className="mb-2 text-lg font-semibold wb-text-on-light"
              style={{ fontFamily: fonts.heading }}
            >
              Don&apos;t See Your Area?
            </h3>
            <p className="mb-4 text-sm wb-text-on-light-secondary">
              Contact us to check availability in your location.
            </p>
            <Link
              href={contactHref}
              className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ ...styles.primaryCta, fontFamily: fonts.body }}
            >
              Contact Us
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServingAreasSection;
