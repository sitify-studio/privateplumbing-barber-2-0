"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { Page } from "@/app/lib/types";
import { useWebBuilder } from "@/app/providers/WebBuilderProvider";
import {
  useScrollAnimation,
  useStaggeredAnimation,
} from "@/app/hooks/useScrollAnimation";
import { resolvePrimaryCta } from "@/app/components/ui/made";
import { useSectionTheme } from "@/app/hooks/useSectionTheme";
import { CMS_IMAGE_QUALITY } from "@/app/lib/image";
import { cn, getImageSrc } from "@/app/lib/utils";
import { tiptapToText } from "@/app/lib/seo";

interface AboutSectionProps {
  aboutSection?: Page["aboutSection"];
  page?: Page | null;
  className?: string;
}

export function AboutSection({ aboutSection, page, className }: AboutSectionProps) {
  const { site, pages } = useWebBuilder();
  const { colors, fonts, styles: themeStyles } = useSectionTheme();

  const resolvedTitle = useMemo(
    () => tiptapToText(aboutSection?.title),
    [aboutSection?.title]
  );
  const resolvedDescription = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );
  const resolvedFeatures = useMemo(
    () =>
      aboutSection?.features
        ?.filter((f) => f?.label?.trim())
        .map((f) => f.label.trim()) ?? [],
    [aboutSection?.features]
  );
  const resolvedCta = useMemo(
    () =>
      resolvePrimaryCta(page ?? null, site, pages) ?? {
        href: "/contact-us",
        label: "Contact Us",
      },
    [page, site, pages]
  );

  const [scrollY, setScrollY] = useState(0);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });
  const { ref: featuresRef, visibleItems } = useStaggeredAnimation(
    resolvedFeatures.length,
    150
  );
  const { ref: imageRef, isVisible: imageVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const aboutImageOneUrl = aboutSection?.image?.url
    ? getImageSrc(aboutSection.image.url)
    : undefined;

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!resolvedTitle && !resolvedDescription && !aboutImageOneUrl && resolvedFeatures.length === 0) {
    return null;
  }

  const ctaIsExternal =
    resolvedCta.href.startsWith("http") ||
    resolvedCta.href.startsWith("mailto:") ||
    resolvedCta.href.startsWith("tel:");

  const aboutSectionCss = `
    @keyframes fade-slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-slide-animation { animation: fade-slide-up 0.9s ease-out forwards; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: aboutSectionCss }} />

      <section
        id="about"
        className={cn('relative overflow-hidden py-24', className)}
        style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
      >
        <div className="relative z-10 flex items-center min-h-[60vh]">
          <div className="container mx-auto px-6 lg:px-8">
            

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <div className="text-left">
                {/* Header */}
            <div className="mb-20 space-y-8">
              {/* Title */}
              <h2
                ref={titleRef}
                className={`fade-slide-animation mb-4 transition-all duration-1200 text-4xl md:text-6xl font-semibold leading-tight wb-text-on-light ${
                  titleVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  animationDelay: "0.2s",
                  transform: `translateY(${scrollY * 0.05}px)`,
                  fontFamily: fonts.heading,
                }}
              >
                {resolvedTitle}
              </h2>

              {/* Description */}
              <p
                ref={descRef}
                className={`fade-slide-animation max-w-lg transition-all duration-1200 delay-400 wb-text-on-light-secondary text-[15px] leading-7 ${
                  descVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  animationDelay: "0.4s",
                  transform: `translateY(${scrollY * 0.03}px)`,
                }}
              >
                {resolvedDescription}
              </p>
            </div>
                {resolvedFeatures && resolvedFeatures.length > 0 && (
                  <div ref={featuresRef} className="space-y-4 mt-6">
                    {resolvedFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className={`transition-all duration-500 ${
                          visibleItems.includes(index)
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }`}
                        style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                      >
                        <div
                          className="group flex items-center gap-4 rounded-3xl px-5 py-4 border shadow-sm hover:shadow-md transition-all wb-section-card"
                          style={{
                            ...themeStyles.cardSolid,
                            borderColor: 'color-mix(in srgb, var(--wb-primary) 12%, transparent)',
                          }}
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl wb-text-on-dark"
                            style={themeStyles.iconBadge}
                          >
                            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="text-[15px] font-medium leading-6 wb-text-on-light">
                            {feature}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-5">
                  {resolvedCta &&
                    (ctaIsExternal ? (
                      <a
                        href={resolvedCta.href}
                        className="inline-flex items-center rounded-md px-5 py-3 shadow transition-opacity hover:opacity-90"
                        style={themeStyles.primaryCta}
                      >
                        {resolvedCta.label || "Explore services"}
                      </a>
                    ) : (
                      <Link
                        href={resolvedCta.href}
                        className="inline-flex items-center rounded-md px-5 py-3 shadow transition-opacity hover:opacity-90"
                        style={themeStyles.primaryCta}
                      >
                        {resolvedCta.label || "Explore services"}
                      </Link>
                    ))}
                  <a href="#team" className="inline-flex items-center wb-text-on-light hover:underline">
                    Our barbers
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>

              {/* Image Section: two overlapping images */}
              <div
                ref={imageRef}
                className={`relative transition-all duration-1200 delay-500 ${
                  imageVisible
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-12 scale-95"
                }`}
                style={{ transform: `translateY(${scrollY * 0.02}px)` }}
              >
                <div className="relative w-full max-w-[520px] mx-auto">
                  {/* Back image */}
                  {aboutImageOneUrl && (
                    <div
                      className="overflow-hidden rounded-2xl"
                      style={{
                        boxShadow:
                          '0 20px 60px color-mix(in srgb, var(--wb-text-main) 15%, transparent)',
                      }}
                    >
                      <Image
                        src={aboutImageOneUrl}
                        alt={aboutSection?.image?.altText?.trim() || "About us"}
                        width={1040}
                        height={1280}
                        quality={CMS_IMAGE_QUALITY}
                        sizes="(max-width: 520px) 100vw, 520px"
                        className="w-full h-auto object-cover rounded-2xl"
                        priority
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutSection;
