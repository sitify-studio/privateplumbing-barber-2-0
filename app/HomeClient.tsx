'use client';

import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { BlogSection } from '@/app/components/sections/BlogSection';
import { ContactSection } from './components/sections/ContactSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { GallerySection } from '@/app/components/sections/GallerySection';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { getThemeColors } from '@/app/lib/themeBuilder';

export default function HomeClient() {
  const { site, pages, loading, error } = useWebBuilder();
  const displayPage = pages.find((p: Page) => p.pageType === 'home');

  const servingAreasSection = useMemo(() => {
    const section = displayPage?.servingAreasSection;
    if (section?.enabled === false) return undefined;
    if (section?.areas?.length || section?.serviceIds?.length) return section;
    if (site?.serviceAreas?.length) {
      return {
        enabled: section?.enabled ?? true,
        title: section?.title,
        description: section?.description,
        serviceSlug: section?.serviceSlug,
        areas: site.serviceAreas,
      };
    }
    return section;
  }, [displayPage?.servingAreasSection, site?.serviceAreas]);

  const themeColors = getThemeColors(site);
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  if (loading) {
    return null;
  }

  if (error && !site) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div
          className="p-6 rounded-lg max-w-lg text-center"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px',
          }}
        >
          <h2
            className="mb-2 text-xl font-bold"
            style={{
              color: themeColors.mainText,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondaryText,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!displayPage) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            color: themeColors.mainText,
            fontFamily: themeFonts.heading,
          }}
        >
          No Home Page Found
        </h2>
        <p
          style={{
            color: themeColors.secondaryText,
            fontFamily: themeFonts.body,
          }}
        >
          Please create a page with type &quot;home&quot; in the site builder.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen selection:bg-black/10 selection:text-inherit"
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >
      <main>
        <HeroSection hero={displayPage.hero} page={displayPage} />
        <AboutSection aboutSection={displayPage.aboutSection} page={displayPage} />
        <ServicesSection
          servicesSection={displayPage.servicesSection}
          companyDetailSection={displayPage.companyDetailSection}
          ctaSection={displayPage.ctaSection}
          page={displayPage}
        />
        <CompanyDetailSection companyDetailSection={displayPage.companyDetailSection} />
        <CTASection ctaSection={displayPage.ctaSection} />
        <BlogSection blogSection={displayPage.blogSection} />
        <ProjectsSection
          projectSection={displayPage.projectSection}
          projectsSection={displayPage.projectsSection}
          projectsLimit={3}
        />
        <GallerySection gallerySection={displayPage.gallerySection} />
        <WhyChooseUsSection whyChooseUsSection={displayPage.whyChooseUsSection} />
        <FAQSection faqSection={displayPage.faqSection} />
        <TestimonialsSection testimonialsSection={displayPage.testimonialsSection} />
        <ServingAreasSection servingAreasSection={servingAreasSection} />
        <ContactSection contactSection={displayPage.contactSection} />
      </main>
      <Footer />
    </div>
  );
}
