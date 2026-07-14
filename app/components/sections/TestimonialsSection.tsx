'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type DisplayTestimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
};

type TestimonialInput = {
  name?: string;
  role?: string;
  company?: string;
  text?: unknown;
  content?: unknown;
};

function mapTestimonial(item: TestimonialInput, index: number): DisplayTestimonial | null {
  const name = item.name?.trim() ?? '';
  const text =
    tiptapToText(item.text) ||
    tiptapToText(item.content) ||
    (typeof item.text === 'string' ? item.text.trim() : '') ||
    (typeof item.content === 'string' ? item.content.trim() : '');
  if (!name && !text) return null;
  return {
    id: `${name}-${index}`,
    name: name || 'Client',
    role: item.role?.trim() ?? item.company?.trim() ?? '',
    text,
  };
}

export function TestimonialsSection({ testimonialsSection, className }: TestimonialsSectionProps) {
  const { colors, fonts, styles } = useSectionTheme();
  const { testimonials: globalTestimonials } = useWebBuilder();

  const resolvedTitle = useMemo(() => {
    const pageTitle = tiptapToText(testimonialsSection?.title);
    if (pageTitle) return pageTitle;
    return globalTestimonials?.title?.trim() || 'TESTIMONIALS';
  }, [testimonialsSection?.title, globalTestimonials?.title]);

  const resolvedDescription = useMemo(() => {
    const pageDescription = tiptapToText(testimonialsSection?.description);
    if (pageDescription) return pageDescription;
    return globalTestimonials?.description?.trim() ?? '';
  }, [testimonialsSection?.description, globalTestimonials?.description]);

  const resolvedTestimonials = useMemo(() => {
    const pageItems = (testimonialsSection?.testimonials ?? [])
      .map((item, index) => mapTestimonial(item, index))
      .filter((item): item is DisplayTestimonial => Boolean(item));
    if (pageItems.length > 0) return pageItems;
    return (globalTestimonials?.testimonials ?? [])
      .map((item, index) => mapTestimonial(item, index))
      .filter((item): item is DisplayTestimonial => Boolean(item));
  }, [testimonialsSection?.testimonials, globalTestimonials?.testimonials]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: resolvedTestimonials.length > 2,
  });

  const next = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const prev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (testimonialsSection?.enabled === false) return null;
  if (!resolvedTitle && !resolvedDescription && resolvedTestimonials.length === 0) return null;

  const navBtnStyle = {
    borderColor: colors.primaryButton,
    color: colors.primaryButton,
    background: 'transparent',
  } as React.CSSProperties;

  const dotInactive = {
    backgroundColor: 'color-mix(in srgb, var(--wb-text-main) 28%, transparent)',
  } as React.CSSProperties;

  return (
    <section
      id="testimonials"
      className={cn('relative py-16 md:py-20', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight wb-text-on-light"
            style={{ fontFamily: fonts.heading }}
          >
            {resolvedTitle}
          </h2>
          {resolvedDescription && (
            <p className="mx-auto mt-3 max-w-2xl text-sm wb-text-on-light-secondary sm:text-base">
              {resolvedDescription}
            </p>
          )}
        </div>

        {resolvedTestimonials.length > 0 && (
          <div className="relative flex select-none items-center justify-center">
            <button
              type="button"
              onClick={prev}
              className="absolute left-0 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border text-lg transition sm:left-2 md:left-4 lg:left-8"
              style={navBtnStyle}
              aria-label="Previous"
            >
              ‹
            </button>

            <div
              className="w-full max-w-[calc(100%-4rem)] overflow-hidden sm:max-w-[calc(100%-5rem)] md:max-w-[calc(100%-6rem)] lg:max-w-[980px]"
              ref={emblaRef}
            >
              <div className="flex -mx-2 sm:-mx-3">
                {resolvedTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="flex-[0_0_100%] px-2 sm:px-3 md:flex-[0_0_100%] lg:flex-[0_0_50%]"
                  >
                    <div
                      className="rounded-2xl p-8 text-center shadow-md md:p-10 wb-section-card"
                      style={styles.cardSolid}
                    >
                      <div className="text-2xl" style={styles.accentText}>
                        “
                      </div>
                      <p className="text-sm leading-relaxed wb-text-on-light md:text-base">
                        {item.text}
                      </p>
                      <div className="mt-3 flex items-center justify-center" style={styles.accentText}>
                        {[...Array(5)].map((_, s) => (
                          <svg
                            key={s}
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="font-semibold wb-text-on-light">{item.name}</div>
                        {item.role && (
                          <div className="text-xs wb-text-on-light-secondary">{item.role}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={next}
              className="absolute right-0 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border text-lg transition sm:right-2 md:right-4 lg:right-8"
              style={navBtnStyle}
              aria-label="Next"
            >
              ›
            </button>
          </div>
        )}

        {scrollSnaps.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5 sm:gap-2 md:mt-6">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                className="h-1.5 w-1.5 rounded-full transition-all duration-300 sm:h-2 sm:w-2"
                aria-current={i === selectedIndex}
                style={
                  i === selectedIndex
                    ? { backgroundColor: colors.primaryButton }
                    : dotInactive
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
