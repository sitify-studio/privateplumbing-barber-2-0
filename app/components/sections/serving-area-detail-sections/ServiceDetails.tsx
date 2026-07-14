'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { tiptapToText } from '@/app/lib/seo';
import { CheckCircle, Shield, TrendingUp, Zap } from 'lucide-react';

interface ServiceDetailsProps {
  details: unknown;
  className?: string;
}

function getIcon(iconName: string) {
  switch (iconName) {
    case 'zap':
      return <Zap className="h-5 w-5" />;
    case 'shield':
      return <Shield className="h-5 w-5" />;
    case 'trending':
      return <TrendingUp className="h-5 w-5" />;
    default:
      return <CheckCircle className="h-5 w-5" />;
  }
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  const { colors, fonts, styles, text } = useSectionTheme();
  const pageText = text.onLight;
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const record = details && typeof details === 'object' ? (details as Record<string, unknown>) : null;

  const title = useMemo(() => tiptapToText(record?.title), [record?.title]);
  const subtitle = useMemo(
    () => tiptapToText(record?.subtitle) || tiptapToText(record?.description),
    [record?.subtitle, record?.description]
  );

  const features = (record?.features as unknown[]) ?? [];
  const process = (record?.process as unknown[]) ?? [];
  const benefits = (record?.benefits as unknown[]) ?? [];
  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });

  if (
    !record ||
    (!title && !subtitle && features.length === 0 && process.length === 0 && benefits.length === 0)
  ) {
    return null;
  }

  const faqItemBorder = {
    borderColor: 'color-mix(in srgb, var(--wb-text-main) 14%, transparent)',
  } as React.CSSProperties;

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  const ctaButton = record.ctaButton as
    | { href?: string; url?: string; text?: string; label?: string }
    | undefined;

  return (
    <section
      className={cn('py-16 md:py-20 lg:py-24', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            {Boolean(record.label) && (
              <p className="mb-3 text-sm font-medium" style={{ color: pageText.secondary }}>
                <TiptapRenderer content={record.label} as="inline" />
              </p>
            )}
            {title && (
              <h2
                ref={titleRef}
                className={cn(
                  'mb-4 text-3xl font-semibold transition-all md:text-4xl',
                  titleVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{ fontFamily: fonts.heading, color: pageText.primary }}
              >
                {typeof record.title === 'object' ? (
                  <TiptapRenderer content={record.title} as="inline" />
                ) : (
                  title
                )}
              </h2>
            )}
            {subtitle && (
              <div className="text-base leading-relaxed" style={{ color: pageText.secondary }}>
                {typeof record.subtitle === 'object' || typeof record.description === 'object' ? (
                  <TiptapRenderer content={record.subtitle ?? record.description} />
                ) : (
                  subtitle
                )}
              </div>
            )}
          </div>

          <div className="space-y-12 lg:col-span-2">
            {features.length > 0 && (
              <div className="space-y-3">
                <h3
                  className="mb-4 text-xl font-semibold"
                  style={{ fontFamily: fonts.heading, color: pageText.primary }}
                >
                  Key capabilities
                </h3>
                {features.map((feature, index) => {
                  const row = feature as Record<string, unknown>;
                  const isOpen = expandedFeature === index;
                  const question = tiptapToText(row.title) || `Feature ${index + 1}`;
                  const shortAnswer = tiptapToText(row.shortDescription);
                  const fullAnswer = tiptapToText(row.fullDescription);

                  return (
                    <div
                      key={index}
                      className="rounded-lg border wb-section-card"
                      style={{ ...styles.cardSolid, ...faqItemBorder }}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                        onClick={() => toggleFeature(index)}
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-4 pr-4">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={styles.iconBadge}
                          >
                            <span style={{ color: 'var(--wb-text-on-dark, #fff)' }}>
                              {getIcon(String(row.icon ?? ''))}
                            </span>
                          </div>
                          <div className="text-[15px] font-medium wb-text-on-light">{question}</div>
                        </div>
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border wb-text-on-light"
                          style={{
                            borderColor:
                              'color-mix(in srgb, var(--wb-text-main) 22%, transparent)',
                          }}
                        >
                          <svg
                            className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-45')}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (shortAnswer || fullAnswer) && (
                        <div className="border-t px-5 pb-4 pt-0" style={faqItemBorder}>
                          {shortAnswer && (
                            <p className="mt-3 text-sm wb-text-on-light-secondary">{shortAnswer}</p>
                          )}
                          {fullAnswer && (
                            <div className="mt-2 text-sm wb-text-on-light-secondary">
                              {typeof row.fullDescription === 'object' ? (
                                <TiptapRenderer content={row.fullDescription} />
                              ) : (
                                fullAnswer
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {process.length > 0 && (
              <div>
                <h3
                  className="mb-6 text-xl font-semibold"
                  style={{ fontFamily: fonts.heading, color: pageText.primary }}
                >
                  Our approach
                </h3>
                <div className="space-y-4">
                  {process.map((step, index) => {
                    const row = step as Record<string, unknown>;
                    return (
                      <div
                        key={index}
                        className="flex gap-4 rounded-lg border p-5 wb-section-card"
                        style={{ ...styles.cardSolid, ...faqItemBorder }}
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                          style={{ ...styles.statCircle, color: 'var(--wb-text-on-dark, #fff)' }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h4 className="mb-2 font-semibold wb-text-on-light" style={{ fontFamily: fonts.heading }}>
                            <TiptapRenderer content={row.title} as="inline" />
                          </h4>
                          {Boolean(row.description) && (
                            <div className="text-sm wb-text-on-light-secondary">
                              <TiptapRenderer content={row.description} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {benefits.length > 0 && (
              <div>
                <h3
                  className="mb-6 text-xl font-semibold"
                  style={{ fontFamily: fonts.heading, color: pageText.primary }}
                >
                  Benefits
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit, index) => {
                    const row = benefit as Record<string, unknown>;
                    return (
                      <div
                        key={index}
                        className="rounded-lg border p-5 wb-section-card"
                        style={{ ...styles.cardSolid, ...faqItemBorder }}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={styles.iconBadge}
                          >
                            <span style={{ color: 'var(--wb-text-on-dark, #fff)' }}>
                              {getIcon(String(row.icon ?? ''))}
                            </span>
                          </div>
                          <h4 className="font-semibold wb-text-on-light" style={{ fontFamily: fonts.heading }}>
                            <TiptapRenderer content={row.title} as="inline" />
                          </h4>
                        </div>
                        {Boolean(row.description) && (
                          <div className="text-sm wb-text-on-light-secondary">
                            <TiptapRenderer content={row.description} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {ctaButton && (
              <div
                className="rounded-lg border p-6 text-center wb-section-card"
                style={{ ...styles.cardSolid, ...faqItemBorder }}
              >
                <h3
                  className="mb-4 text-lg font-semibold wb-text-on-light"
                  style={{ fontFamily: fonts.heading }}
                >
                  Ready to begin?
                </h3>
                <Link
                  href={ctaButton.href || ctaButton.url || '#'}
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={styles.primaryCta}
                >
                  {ctaButton.text || ctaButton.label || 'Get started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetails;
