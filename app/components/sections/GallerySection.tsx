'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Page } from '@/app/lib/types';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { CMS_IMAGE_QUALITY, GALLERY_IMAGE_SIZES } from '@/app/lib/image';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

type GallerySlide = {
  id: string;
  imageUrl: string;
  altText: string;
};

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

export function GallerySection({ gallerySection, className }: GallerySectionProps) {
  const { colors, fonts } = useSectionTheme();

  const resolvedTitle = useMemo(
    () => tiptapToText(gallerySection?.title) || 'Our Work in Action',
    [gallerySection?.title]
  );
  const resolvedDescription = useMemo(
    () => tiptapToText(gallerySection?.description),
    [gallerySection?.description]
  );

  const slides = useMemo<GallerySlide[]>(() => {
    return (
      gallerySection?.images
        ?.filter((img) => img?.url)
        .map((img, index) => ({
          id: `gallery-${index}`,
          imageUrl: getImageSrc(img.url),
          altText:
            img.altText?.trim() || tiptapToText(img.caption) || `Gallery image ${index + 1}`,
        })) ?? []
    );
  }, [gallerySection?.images]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    if (!timerRef.current && slides.length > 1) {
      timerRef.current = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000);
    }
    return () => {
      emblaApi.off('select', onSelect);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [emblaApi, onSelect, slides.length]);

  if (!gallerySection || gallerySection.enabled === false) return null;
  if (!resolvedTitle && !resolvedDescription && slides.length === 0) return null;

  const dotActive = { backgroundColor: colors.mainText } as React.CSSProperties;
  const dotInactive = {
    backgroundColor: 'color-mix(in srgb, var(--wb-text-main) 28%, transparent)',
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      className={cn('py-16 sm:py-20 md:py-24 lg:py-28', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <h2
            className="mb-4 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight wb-text-on-dark"
            style={{ fontFamily: fonts.heading }}
          >
            {resolvedTitle}
          </h2>
          {resolvedDescription && (
            <p className="mx-auto max-w-2xl text-[15px] leading-7 wb-text-on-dark-secondary md:text-base md:leading-relaxed">
              {resolvedDescription}
            </p>
          )}
        </div>

        {slides.length > 0 && (
          <div
            className="mx-auto max-w-6xl"
            onMouseEnter={() => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (!timerRef.current && emblaApi && slides.length > 1) {
                timerRef.current = setInterval(() => emblaApi.scrollNext(), 4000);
              }
            }}
          >
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {slides.map((img) => (
                  <div key={img.id} className="min-w-0 flex-[0_0_100%]">
                    <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                      <Image
                        src={img.imageUrl}
                        alt={img.altText}
                        fill
                        quality={CMS_IMAGE_QUALITY}
                        className="object-cover"
                        sizes={GALLERY_IMAGE_SIZES}
                        priority={img.id === slides[0]?.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scrollSnaps.length > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {scrollSnaps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    className="h-2 w-2 rounded-full transition-colors duration-300"
                    style={i === selectedIndex ? dotActive : dotInactive}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === selectedIndex}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default GallerySection;
