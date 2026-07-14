'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

type HighlightItem = {
  name: string;
  description: string;
  titleContent?: unknown;
  descriptionContent?: unknown;
};

function isStatHighlight(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > 14) return false;
  if (/[+%]/.test(trimmed)) return true;
  if (/^\d[\d.,]*\s*(k|m|\+|%|yrs?|years?)?$/i.test(trimmed)) return true;
  if (/^\d+\s*\/\s*\d+$/.test(trimmed)) return true;
  return /^[\d.,]+$/.test(trimmed);
}

function formatDisplayValue(description: string) {
  if (description.includes('+')) {
    return { value: description.replace('+', ''), suffix: '+' };
  }
  if (description.includes('%')) {
    return { value: description.replace('%', ''), suffix: '%' };
  }
  return { value: description, suffix: '' };
}

export function WhyChooseUsSection({ whyChooseUsSection, className }: WhyChooseUsSectionProps) {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;
  const services = useMemo<HighlightItem[]>(() => {
    return (
      whyChooseUsSection?.items
        ?.map((item) => ({
          name: tiptapToText(item.title),
          description: tiptapToText(item.description),
          titleContent: item.title,
          descriptionContent: item.description,
        }))
        .filter((item) => item.name || item.description) ?? []
    );
  }, [whyChooseUsSection?.items]);

  const title = useMemo(() => tiptapToText(whyChooseUsSection?.title), [whyChooseUsSection?.title]);
  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description),
    [whyChooseUsSection?.description]
  );

  const cardGridClass = useMemo(() => {
    const count = services.length;
    if (count <= 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }, [services.length]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });
  const { ref: servicesRef, visibleItems } = useStaggeredAnimation(services.length, 180);

  if (!whyChooseUsSection?.enabled) return null;
  if (services.length === 0 && !title && !description) return null;

  return (
    <section
      id="why-choose-us"
      className={cn('relative py-20 lg:py-32 overflow-hidden', className)}
      style={{ fontFamily: fonts.body }}
    >
      <div className="absolute inset-0" style={styles.sectionGradientBg} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-25 animate-float"
            style={{
              ...styles.floatingDot,
              left: `${8 + i * 11}%`,
              top: `${10 + i * 9}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${5 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-16 lg:mb-20">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-8 shadow-lg transition-all duration-1000 ${
              titleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={styles.iconBadge}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          {title && (
            <h2
              ref={titleRef}
              className={`text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 transition-all duration-1000 ${
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ fontFamily: fonts.heading, ...styles.titleGradient }}
            >
              {whyChooseUsSection?.title && typeof whyChooseUsSection.title === 'object' ? (
                <TiptapRenderer content={whyChooseUsSection.title} as="inline" />
              ) : (
                title
              )}
            </h2>
          )}

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-px" style={styles.dividerLine} />
            <div className="w-4 h-4 rounded-full mx-6 animate-pulse" style={styles.dividerDot} />
            <div className="w-16 h-px" style={styles.dividerLine} />
          </div>

          {description && (
            <p
              ref={descRef}
              className={cn(
                'text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300',
                descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ color: colors.secondaryText, fontFamily: fonts.body }}
            >
              {whyChooseUsSection?.description &&
              typeof whyChooseUsSection.description === 'object' ? (
                <TiptapRenderer content={whyChooseUsSection.description} as="inline" />
              ) : (
                description
              )}
            </p>
          )}
        </div>

        <div ref={servicesRef} className={cn('grid gap-8 lg:gap-10 items-stretch', cardGridClass)}>
          {services.map((service, index) => {
            const showStat = isStatHighlight(service.description);
            const { value, suffix } = showStat
              ? formatDisplayValue(service.description)
              : { value: '', suffix: '' };

            return (
              <div
                key={`highlight-${index}`}
                className={`h-full transition-all duration-1000 ${
                  visibleItems.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 180}ms` }}
              >
                <div className="group relative h-full flex flex-col bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center wb-section-card"
                  style={styles.card}>
                  {showStat ? (
                    <>
                      <div className="mx-auto mb-6 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-lg group-hover:animate-pulse"
                        style={{ ...styles.statCircle, color: 'var(--wb-text-on-dark, #fff)' }}>
                        <span className={`text-3xl font-semibold leading-none`}
                          style={{ fontFamily: fonts.heading }}>
                          {value}
                        </span>
                        {suffix && (
                          <span className={`text-sm opacity-90`}>{suffix}</span>
                        )}
                      </div>
                      {service.name && (
                        <h3
                          className={`text-xl md:text-2xl font-semibold transition-colors wcu-card-title`}
                          style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
                        >
                          {service.name}
                        </h3>
                      )}
                    </>
                  ) : (
                    <>
                      {service.description && (
                        <div
                          className={`leading-relaxed mb-6 flex-1`}
                          style={{ color: colors.darkPrimaryText, opacity: 0.8, fontFamily: fonts.body }}
                        >
                          {service.descriptionContent &&
                          typeof service.descriptionContent === 'object' ? (
                            <TiptapRenderer content={service.descriptionContent} as="inline" />
                          ) : (
                            service.description
                          )}
                        </div>
                      )}
                      {service.name && (
                        <h3
                          className={`text-xl md:text-2xl font-semibold mt-auto transition-colors wcu-card-title`}
                          style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
                        >
                          {service.titleContent && typeof service.titleContent === 'object' ? (
                            <TiptapRenderer content={service.titleContent} as="inline" />
                          ) : (
                            service.name
                          )}
                        </h3>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-center space-x-2 mt-6 pt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={styles.dividerDot} />
                    <div className="w-8 h-px" style={styles.dividerLine} />
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ ...styles.dividerDot, backgroundColor: colors.hoverActive, animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        :global(.wcu-card-title) { transition: color 0.3s; }
        :global(.group:hover .wcu-card-title) { color: var(--wb-primary); }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default WhyChooseUsSection;
