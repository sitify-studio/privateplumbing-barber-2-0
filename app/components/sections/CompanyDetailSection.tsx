'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type DetailBlock = {
  heading: string;
  description: string;
  imageUrl?: string;
  imageAlt: string;
};

function normalizeDetailBlocks(
  companyDetailSection?: Page['companyDetailSection']
): DetailBlock[] {
  if (!companyDetailSection?.details?.length) return [];

  const blocks: DetailBlock[] = [];
  companyDetailSection.details.forEach((detail, index) => {
    const heading =
      tiptapToText(detail.title) || detail.label?.trim() || '';
    const description =
      tiptapToText(detail.description) ||
      (!detail.title && !detail.description ? tiptapToText(detail.value) : '');
    const imageUrl = detail.image?.url
      ? getImageSrc(detail.image.url)
      : undefined;
    const imageAlt =
      detail.image?.altText?.trim() || heading || `Team member ${index + 1}`;

    if (!heading && !description && !imageUrl) return;

    blocks.push({ heading, description, imageUrl, imageAlt });
  });
  return blocks;
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const { colors, fonts, styles } = useSectionTheme();

  const heading = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );
  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );
  const sections = useMemo(
    () => normalizeDetailBlocks(companyDetailSection),
    [companyDetailSection]
  );

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.3,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!heading && !description && sections.length === 0) return null;

  const teamStyles = `
    .team-card {
      background: var(--wb-card-bg-light);
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid var(--wb-primary);
      display: flex;
      flex-direction: column;
    }
    .team-image {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
      background: var(--wb-section-bg-light);
    }
    .team-body {
      background: var(--wb-card-bg-light);
      padding: 1rem;
      text-align: center;
      border-top: 1px solid var(--wb-primary);
    }
    .team-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--wb-text-on-dark);
      margin: 0.15rem 0;
    }
    .team-role {
      font-size: 0.85rem;
      color: var(--wb-text-on-dark-secondary);
      margin-bottom: 0.75rem;
    }
    .team-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem 0.9rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 2px;
      letter-spacing: 0.04em;
    }
    .team-btn:hover { filter: brightness(0.95); }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 1024px) {
      .cards-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: teamStyles }} />
      <section
        id="team"
        className={cn('wb-surface-light relative overflow-hidden py-10', className)}
        style={{ fontFamily: fonts.body }}
      >
        <div className="container relative z-10 mx-auto px-6 lg:px-8">
          <div ref={headerRef} className="mb-20 space-y-6 text-center">
            {heading && (
              <h2
                className={`text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1] tracking-[-0.03em] wb-text-on-dark transition-all duration-1200 ${
                  headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ fontFamily: fonts.heading }}
              >
                {heading}
              </h2>
            )}
            <div className="flex items-center justify-center">
              <div
                className={`h-px transition-all duration-1000 delay-300 ${
                  headerVisible ? 'w-24 opacity-60' : 'w-0 opacity-0'
                }`}
                style={styles.dividerGradient}
              />
            </div>
            {description && (
              <p
                className={`mx-auto max-w-7xl text-base leading-relaxed tracking-wide wb-text-on-dark-secondary transition-all duration-1200 delay-300 md:text-lg ${
                  headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {description}
              </p>
            )}
          </div>

          {sections.length > 0 && (
            <div className="mt-6">
              <div className="cards-grid">
                {sections.slice(0, 3).map((section, i) => (
                  <div
                    key={`team-${i}`}
                    className="team-card wb-section-card"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="team-image">
                      {section.imageUrl ? (
                        <Image
                          src={section.imageUrl}
                          alt={section.imageAlt}
                          fill
                          quality={CMS_IMAGE_QUALITY}
                          sizes="(min-width: 1024px) 400px, 100vw"
                          className={`object-cover transition-transform duration-500 ${
                            hoveredIndex === i ? 'scale-105' : ''
                          }`}
                        />
                      ) : (
                        <div className="h-full w-full" style={styles.imagePlaceholder} />
                      )}
                    </div>
                    <div className="team-body">
                      <div className="team-name">{section.heading}</div>
                      <div className="team-role">
                        {section.description || 'Master Barber'}
                      </div>
                      <a href="#contact" className="team-btn" style={styles.primaryCta}>
                        BOOK NOW
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default CompanyDetailSection;
