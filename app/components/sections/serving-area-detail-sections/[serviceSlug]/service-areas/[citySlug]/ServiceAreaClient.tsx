'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import type { Page } from '@/app/lib/types';
import { collectServiceAreaImageFallbacks } from '@/app/lib/siteContent';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/serving-area-detail-sections/Hero';
import { About } from '@/app/components/sections/serving-area-detail-sections/About';
import { ServiceOverview } from '@/app/components/sections/serving-area-detail-sections/ServiceOverview';
import { ServiceDetails } from '@/app/components/sections/serving-area-detail-sections/ServiceDetails';
import { WhyChooseUs } from '@/app/components/sections/serving-area-detail-sections/WhyChooseUs';
import { Highlights } from '@/app/components/sections/serving-area-detail-sections/Highlights';
import { OurServices } from '@/app/components/sections/serving-area-detail-sections/OurServices';
import { ServingAreas } from '@/app/components/sections/serving-area-detail-sections/ServingAreas';
import { FAQs } from '@/app/components/sections/serving-area-detail-sections/FAQs';
import { CTA } from '@/app/components/sections/serving-area-detail-sections/CTA';
import api from '@/app/lib/fetch-api';

interface ServiceAreaClientProps {
  serviceSlug: string;
  citySlug: string;
}

export default function ServiceAreaClient({
  serviceSlug: serviceSlugProp,
  citySlug: citySlugProp,
}: ServiceAreaClientProps) {
  const params = useParams();
  const serviceSlug = (params.serviceSlug as string) || serviceSlugProp;
  const citySlug = (params.citySlug as string) || citySlugProp;

  const { site, pages } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const [serviceAreaPage, setServiceAreaPage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceAreaPage = async () => {
      if (!site) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${citySlug}`
        );

        if (response.success) {
          setServiceAreaPage(response.data as Record<string, unknown>);
        } else {
          setError('Service area page not found');
        }
      } catch {
        setError('Failed to load service area page');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAreaPage();
  }, [site, serviceSlug, citySlug]);

  const overviewImageFallbacks = useMemo(
    () =>
      serviceAreaPage
        ? collectServiceAreaImageFallbacks(serviceAreaPage, pages, [
            'hero',
            'cta',
            'about',
            'homeAbout',
            'homeCta',
          ])
        : [],
    [serviceAreaPage, pages]
  );

  if (loading) {
    return null;
  }

  if (error || !serviceAreaPage) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
      >
        <div className="text-center">
          <h2
            className="mb-4 text-2xl font-bold"
            style={{ color: colors.mainText, fontFamily: fonts.heading }}
          >
            Service Area Not Found
          </h2>
          <p className="mb-4" style={{ color: colors.secondaryText }}>
            The service area page could not be found.
          </p>
          <a href="/" className="inline-block hover:opacity-80" style={{ color: colors.primaryButton }}>
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const serviceOverviewData = serviceAreaPage.serviceOverview;
  const serviceDetailsData = serviceAreaPage.serviceDetails;
  const whyChooseUsData = serviceAreaPage.whyChooseUs || serviceAreaPage.about;
  const servingAreasData = serviceAreaPage.servingAreas;

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection hero={serviceAreaPage.hero as Page['hero']} />
        <Highlights highlights={serviceAreaPage.highlights} />
        <About about={serviceAreaPage.about} />
        <OurServices services={serviceAreaPage.ourServices} />
        <CTA cta={serviceAreaPage.cta} />
        <ServiceOverview overview={serviceOverviewData} imageFallbacks={overviewImageFallbacks} />
        <ServiceDetails details={serviceDetailsData} />
        <WhyChooseUs whyChooseUs={whyChooseUsData} />
        <FAQs faqs={serviceAreaPage.faqs} />
        <ServingAreas service={servingAreasData} serviceId={serviceAreaPage.serviceId} />
      </main>
      <Footer />
    </div>
  );
}
