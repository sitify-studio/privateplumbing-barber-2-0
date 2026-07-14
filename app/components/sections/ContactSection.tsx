'use client';

import React, { useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

function ContactDetailRow({
  icon,
  label,
  children,
  cardText,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  cardText: { primary: string; secondary: string };
}) {
  const { fonts, styles } = useSectionTheme();

  return (
    <div className="flex gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={styles.iconBadge}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="mb-1 block text-xs font-semibold uppercase tracking-wide opacity-90"
          style={{ color: cardText.primary, fontFamily: fonts.body }}
        >
          {label}
        </span>
        <div className="text-sm leading-relaxed" style={{ color: cardText.secondary }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactSection,
  className,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();
  const { colors, fonts, styles, text } = useSectionTheme();
  const pageText = text.onLight;
  const cardText = text.onCardSurface;

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (dayHours.timeRanges?.length) {
      return dayHours.timeRanges
        .map((range) => `${formatTime(range.openTime)} – ${formatTime(range.closeTime)}`)
        .join(', ');
    }
    return '';
  };

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const mapQuery = addressLine;
  const cardBorder = {
    borderColor: `color-mix(in srgb, ${cardText.primary} 18%, transparent)`,
  } as React.CSSProperties;

  const outlineBtnStyle = {
    borderColor: cardText.primary,
    color: cardText.primary,
    backgroundColor: 'transparent',
  } as React.CSSProperties;

  return (
    <section
      id="contact"
      className={cn('relative overflow-hidden py-16 md:py-24 lg:py-28', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-float rounded-full opacity-20"
            style={{
              ...styles.floatingDot,
              left: `${10 + i * 16}%`,
              top: `${12 + i * 14}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center md:mb-16">
          <div
            className={cn(
              'mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-1000',
              titleVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            )}
            style={styles.iconBadge}
          >
            <Mail className="h-7 w-7" strokeWidth={1.75} />
          </div>

          <h2
            ref={titleRef}
            className={cn(
              'mx-auto mb-5 max-w-3xl text-3xl font-semibold transition-all duration-1000 md:text-4xl lg:text-5xl',
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            )}
            style={
              contactSection.title
                ? { ...styles.titleGradient, fontFamily: fonts.heading }
                : { color: pageText.primary, fontFamily: fonts.heading }
            }
          >
            {contactSection.title ? (
              <TiptapRenderer content={contactSection.title} as="inline" />
            ) : (
              <>
                Any questions?
                <br />
                <span style={styles.accentText}>We&apos;re here to help.</span>
              </>
            )}
          </h2>

          <div className="mb-5 flex items-center justify-center">
            <div className="h-px w-12 sm:w-16" style={styles.dividerLine} />
            <div className="mx-4 h-3 w-3 rounded-full sm:mx-5" style={styles.dividerDot} />
            <div className="h-px w-12 sm:w-16" style={styles.dividerLine} />
          </div>

          {contactSection.description && (
            <p
              ref={descRef}
              className={cn(
                'mx-auto max-w-2xl text-base leading-relaxed transition-all duration-1000 delay-200 md:text-lg',
                descVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
              style={{ color: pageText.secondary }}
            >
              <TiptapRenderer content={contactSection.description} as="inline" />
            </p>
          )}

          {showForm && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="group mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
              style={{ ...styles.primaryCta, fontFamily: fonts.body }}
            >
              Get in touch
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        {(showContactInfo || showMap) && (
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            {showContactInfo && (
              <div
                className="flex flex-col rounded-2xl border p-6 shadow-md md:p-8 lg:p-10 wb-section-card"
                style={{ ...styles.cardSolid, ...cardBorder }}
              >
                <div className="mb-8">
                  <h3
                    className="text-xl font-semibold md:text-2xl"
                    style={{ color: cardText.primary, fontFamily: fonts.heading }}
                  >
                    Visit or reach us
                  </h3>
                  <div
                    className="mt-3 h-px w-14"
                    style={{
                      background: `linear-gradient(90deg, ${cardText.primary}, transparent)`,
                    }}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-8">
                  {(address?.street || address?.city) && (
                    <ContactDetailRow
                      icon={<MapPin className="h-5 w-5" strokeWidth={1.75} />}
                      label="Location"
                      cardText={cardText}
                    >
                      <div className="flex flex-col gap-3">
                        {address?.street && <span>{address.street}</span>}
                        {[address?.city, address?.state, address?.zipCode].filter(Boolean).length > 0 && (
                          <span>
                            {[address?.city, address?.state, address?.zipCode]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        )}
                        {mapQuery && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all hover:opacity-90"
                          style={outlineBtnStyle}
                          onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, styles.primaryCta);
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, outlineBtnStyle);
                          }}
                        >
                          Open in Maps
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </a>
                        )}
                      </div>
                    </ContactDetailRow>
                  )}

                  {business?.phone && (
                    <ContactDetailRow
                      icon={<Phone className="h-5 w-5" strokeWidth={1.75} />}
                      label="Phone"
                      cardText={cardText}
                    >
                      <a
                        href={`tel:${business.phone.replace(/\s/g, '')}`}
                        className="transition-opacity hover:opacity-80"
                        style={{ color: cardText.primary }}
                      >
                        {business.phone}
                      </a>
                    </ContactDetailRow>
                  )}

                  {business?.email && (
                    <ContactDetailRow
                      icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
                      label="Email"
                      cardText={cardText}
                    >
                      <a
                        href={`mailto:${business.email}`}
                        className="break-all transition-opacity hover:opacity-80"
                        style={{ color: cardText.primary }}
                      >
                        {business.email}
                      </a>
                    </ContactDetailRow>
                  )}

                  {businessHours?.isEnabled && businessHours.hours?.length > 0 && (
                    <ContactDetailRow
                      icon={<Clock className="h-5 w-5" strokeWidth={1.75} />}
                      label="Hours"
                      cardText={cardText}
                    >
                      <div
                        className="mt-1 space-y-2 rounded-xl border p-3"
                        style={{
                          borderColor: `color-mix(in srgb, ${cardText.primary} 14%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${cardText.primary} 8%, transparent)`,
                        }}
                      >
                        {businessHours.hours.map((day) => (
                          <div
                            key={day.day}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span style={{ color: cardText.primary, fontWeight: 500 }}>
                              {DAY_LABELS[day.day]}
                            </span>
                            <span style={{ color: cardText.secondary }}>{formatDayHours(day)}</span>
                          </div>
                        ))}
                      </div>
                    </ContactDetailRow>
                  )}
                </div>
              </div>
            )}

            {showMap && (
              <div
                className="relative min-h-[320px] overflow-hidden rounded-2xl border shadow-md lg:min-h-0 lg:aspect-auto lg:h-full"
                style={{ ...cardBorder, minHeight: showContactInfo ? undefined : 320 }}
              >
                {site?.business?.coordinates?.latitude != null &&
                site?.business?.coordinates?.longitude != null ? (
                  <iframe
                    title="Office Location"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 h-full w-full border-0 grayscale transition-all duration-500 hover:grayscale-0"
                    src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 px-6 text-center text-sm"
                    style={{ ...styles.imagePlaceholder, color: pageText.secondary }}
                  >
                    <MapPin className="h-8 w-8 opacity-40" style={styles.accentText} />
                    Map coordinates not configured
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
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

export default ContactSection;
