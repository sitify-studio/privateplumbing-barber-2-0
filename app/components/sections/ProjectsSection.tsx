'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Page, Project } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? href : '';
}

function projectTitle(p: DisplayItem): React.ReactNode {
  if (isProjectEntity(p)) return p.title;
  const t = (p as ManualProject).title;
  if (typeof t === 'string') return t;
  if (t) return <TiptapRenderer content={t} as="inline" />;
  return null;
}

function projectDescription(p: DisplayItem): React.ReactNode {
  if (isProjectEntity(p)) return p.shortDescription || p.description;
  return (p as ManualProject).description;
}

function projectImageUrl(p: DisplayItem): string | null {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage);
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : null;
}

function projectYear(p: DisplayItem): string | null {
  if (!isProjectEntity(p)) return null;
  const raw = p.date || p.publishedAt;
  if (!raw) return null;
  try {
    return String(new Date(raw).getFullYear());
  } catch {
    return null;
  }
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}) => {
  const { projects, pages } = useWebBuilder();
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled:
        metaSource?.enabled ??
        listingSource?.enabled ??
        true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'description'),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const titleContent = sectionData.title;
  const descriptionContent = sectionData.description;
  const hasTitle = hasTiptapContent(titleContent);
  const hasDescription = hasTiptapContent(descriptionContent);

  const display = useMemo<DisplayItem[]>(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    if (typeof projectsLimit === 'number' && projectsLimit > 0) {
      return items.slice(0, projectsLimit);
    }
    return items;
  }, [sectionData, projects, projectsLimit]);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!sectionData.enabled) return null;
  if (display.length === 0 && !hasTitle && !hasDescription) return null;

  return (
    <section
      id="projects"
      className={cn('relative overflow-hidden py-20 lg:py-32', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-25 animate-float"
            style={{
              ...styles.floatingDot,
              left: `${10 + i * 14}%`,
              top: `${12 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(hasTitle || hasDescription || showViewAllLink) && (
          <div className="mb-16 text-center lg:mb-20">
            {hasTitle && (
              <h2
                ref={titleRef}
                className={cn(
                  `text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 transition-all duration-1000`,
                  titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ fontFamily: fonts.heading, ...styles.titleGradient }}
              >
                <TiptapRenderer content={titleContent} as="inline" />
              </h2>
            )}

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-px" style={styles.dividerLine} />
              <div className="w-4 h-4 rounded-full mx-6 animate-pulse" style={styles.dividerDot} />
              <div className="w-16 h-px" style={styles.dividerLine} />
            </div>

            {hasDescription && (
              <div
                ref={descRef}
                className={cn(
                  'mx-auto max-w-3xl text-lg leading-relaxed wb-text-on-light-secondary transition-all duration-1000 delay-300',
                  descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ color: colors.secondaryText, fontFamily: fonts.body }}
              >
                <TiptapRenderer content={descriptionContent} as="inline" />
              </div>
            )}

            {showViewAllLink && display.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Link
                  href="/project-detail"
                  className="inline-block px-8 py-4 font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                  style={{ ...styles.primaryCta, fontFamily: fonts.body, backgroundColor: colors.mainText }}
                >
                  View All Projects →
                </Link>
              </div>
            )}
          </div>
        )}

        {display.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {display.map((item, index) => {
              const imageUrl = projectImageUrl(item);
              const href = projectHref(item);
              const title = projectTitle(item);
              const desc = projectDescription(item);
              const year = projectYear(item);
              if (!imageUrl && !title) return null;

              const card = (
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl wb-section-card" style={styles.card}>
                  {imageUrl ? (
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden" style={styles.imagePlaceholder}>
                      <Image
                        src={imageUrl}
                        alt={typeof title === 'string' ? title : 'Project'}
                        fill
                        quality={CMS_IMAGE_QUALITY}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={styles.imageOverlay} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span
                          className="rounded-full bg-white/90 px-5 py-2 text-xs font-medium uppercase tracking-wide"
                          style={{ color: colors.mainText, fontFamily: fonts.body }}
                        >
                          View Project
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        className={`text-xl md:text-2xl font-semibold transition-colors hero-card-title`}
                        style={{ fontFamily: fonts.heading, color: colors.darkPrimaryText }}
                      >
                        {title}
                      </h3>
                      {year && (
                        <span className={`shrink-0 text-xs font-medium`}
                          style={{ ...styles.accentText, fontFamily: fonts.body }}>
                          {year}
                        </span>
                      )}
                    </div>
                    {desc && (
                      <div
                        className={`line-clamp-3 flex-1 text-sm leading-relaxed`}
                        style={{ color: colors.darkSecondaryText, fontFamily: fonts.body }}
                      >
                        {typeof desc === 'string' ? desc : <TiptapRenderer content={desc} as="inline" />}
                      </div>
                    )}
                    <span
                      className={`mt-4 pt-2 text-xs font-medium uppercase tracking-wide`}
                      style={{ ...styles.accentText, fontFamily: fonts.body }}
                    >
                      View details →
                    </span>
                  </div>
                </article>
              );

              return href ? (
                <Link key={index} href={normalizeHref(href)} className="block h-full">
                  {card}
                </Link>
              ) : (
                <div key={index} className="h-full">
                  {card}
                </div>
              );
            })}
          </div>
        ) : (
          <p className={`text-center text-sm`}
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}>
            No published projects yet. Add projects in the builder to show them here.
          </p>
        )}
      </div>

      <style jsx>{`
        :global(.hero-card-title) {
          transition: color 0.3s;
        }
        :global(.group:hover .hero-card-title) {
          color: var(--wb-primary);
        }

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
};

export default ProjectsSection;
