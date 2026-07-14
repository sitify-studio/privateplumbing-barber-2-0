'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import {
  getBrandName,
  getCopyrightText,
  getMenuFooterLine,
  getPageHref,
} from '@/app/lib/siteContent';
import { CMS_IMAGE_QUALITY } from '@/app/lib/image';
import { getImageSrc } from '@/app/lib/utils';

export function Footer() {
  const { site, pages } = useWebBuilder();
  const { colors, fonts, styles, text } = useSectionTheme();
  const footerText = text.onDarkSection;

  const resolvedBusinessName = getBrandName(site) || 'Business';
  const resolvedBusinessDescription = useMemo(() => getMenuFooterLine(site), [site]);
  const copyright = useMemo(() => getCopyrightText(site), [site]);

  const logoUrl = site?.footer?.logo?.url
    ? getImageSrc(site.footer.logo.url)
    : site?.theme?.logoUrl
      ? getImageSrc(site.theme.logoUrl)
      : '/logo.png';
  const logoAlt =
    site?.footer?.logo?.altText?.trim() || `${resolvedBusinessName} logo`;

  const contactHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '#contact';
  }, [pages]);

  const footerStyle = {
    backgroundColor: colors.sectionBackgroundDark,
    color: footerText.primary,
    fontFamily: fonts.body,
  } as React.CSSProperties;

  const linkStyle = {
    color: footerText.secondary,
    textDecoration: 'none',
  } as React.CSSProperties;

  const headingStyle = {
    color: footerText.primary,
    fontFamily: fonts.body,
  } as React.CSSProperties;

  const mutedStyle = { color: footerText.secondary } as React.CSSProperties;

  const inputStyle = {
    color: footerText.primary,
    borderColor: `color-mix(in srgb, ${footerText.primary} 30%, transparent)`,
  } as React.CSSProperties;

  const dividerStyle = {
    backgroundColor: `color-mix(in srgb, ${footerText.primary} 20%, transparent)`,
  } as React.CSSProperties;

  return (
    <footer
      id="contact"
      className="relative overflow-hidden rounded-b-2xl"
      style={footerStyle}
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={360}
                height={100}
                quality={CMS_IMAGE_QUALITY}
                sizes="280px"
                className="h-20 w-auto max-w-[360px] object-contain sm:h-24"
              />
            </div>
            {resolvedBusinessDescription && (
              <p className="max-w-xs text-sm" style={mutedStyle}>
                {resolvedBusinessDescription}
              </p>
            )}
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold" style={headingStyle}>
              Company
            </div>
            <ul className="space-y-3 text-sm" style={mutedStyle}>
              <li>
                <Link href="/about-us" className="hover:underline" style={linkStyle}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:underline" style={linkStyle}>
                  Services
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline" style={linkStyle}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold" style={headingStyle}>
              Know More
            </div>
            <ul className="space-y-3 text-sm" style={mutedStyle}>
              <li>
                <Link href={contactHref} className="hover:underline" style={linkStyle}>
                  Support
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="hover:underline" style={linkStyle}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="hover:underline" style={linkStyle}>
                  Terms & conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold" style={headingStyle}>
              Newsletter
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Email Goes here"
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={styles.ctaOnCard}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 h-px w-full" style={dividerStyle} />

        <div className="py-6 text-center text-xs" style={mutedStyle}>
          {copyright || (
            <>
              &copy; {new Date().getFullYear()} {resolvedBusinessName}. All rights reserved.
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
