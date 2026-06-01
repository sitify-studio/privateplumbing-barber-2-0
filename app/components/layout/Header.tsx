'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getImageSrc } from '@/app/lib/utils';
import {
  getBrandName,
  getHeaderNavItems,
  getTestimonialsNavItem,
  type HeaderNavItem,
} from '@/app/lib/siteContent';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn } from '@/app/lib/utils';

function buildNavItems(pages: ReturnType<typeof useWebBuilder>['pages']): HeaderNavItem[] {
  const items: HeaderNavItem[] = [];
  const seen = new Set<string>();

  const home = pages.find((p) => p.pageType === 'home');
  if (home) {
    items.push({ id: home._id, name: home.name?.trim() || 'Home', href: '/' });
    seen.add('/');
  }

  const testimonials = getTestimonialsNavItem(pages);
  if (!seen.has(testimonials.href)) {
    items.push(testimonials);
    seen.add(testimonials.href);
  }

  for (const item of getHeaderNavItems(pages)) {
    if (seen.has(item.href)) continue;
    items.push(item);
    seen.add(item.href);
  }

  return items;
}

function MenuLines({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn('flex h-3.5 w-7 flex-col justify-between', className)}
      aria-hidden
    >
      <span className="h-[3px] w-full rounded-full" style={{ backgroundColor: color }} />
      <span className="h-[3px] w-full rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

export function Header() {
  const { site, pages } = useWebBuilder();
  const { colors, fonts, text } = useSectionTheme();
  const navText = text.onDark;
  const accent = colors.primaryButton;
  const [isOpen, setIsOpen] = useState(false);

  const businessName = getBrandName(site) || 'ClearSky';
  const logoImage = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : undefined;
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);
  const logoAlt = site?.footer?.logo?.altText?.trim() || `${businessName} logo`;
  const navItems = useMemo(() => buildNavItems(pages), [pages]);
  const homePage = useMemo(() => pages.find((p) => p.pageType === 'home'), [pages]);

  const headerCta = useMemo(() => {
    return (
      resolvePrimaryCta(homePage ?? null, site, pages) ?? {
        href: '/contact-us',
        label: 'Book now',
      }
    );
  }, [homePage, site, pages]);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuLabelStyle = {
    color: navText.primary,
    fontFamily: fonts.body,
  } as React.CSSProperties;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto mx-auto flex h-16 items-center justify-between px-5 sm:px-8 md:h-20 md:px-10 lg:px-16">
          <Link href="/" className="flex shrink-0 items-center" aria-label={businessName}>
            {logoImage ? (
              <Image
                src={logoImage}
                alt={logoAlt}
                width={200}
                height={56}
                className="h-9 w-auto max-w-[180px] object-contain brightness-0 invert sm:h-10 sm:max-w-[220px]"
                priority
              />
            ) : (
              <span
                className="text-lg font-semibold uppercase tracking-wide sm:text-xl"
                style={{ ...menuLabelStyle, fontFamily: fonts.heading }}
              >
                {businessName}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="group flex items-center gap-3 sm:gap-3.5"
            aria-expanded={isOpen}
            aria-controls="site-menu-panel"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="text-sm font-bold uppercase tracking-[0.2em] sm:text-[0.95rem]"
              style={menuLabelStyle}
            >
              {isOpen ? 'Close' : 'Menu'}
            </span>
            <MenuLines
              color={accent}
              className={cn(
                'transition-transform duration-300',
                isOpen && 'rotate-90 scale-95'
              )}
            />
          </button>
        </div>
      </header>

      <div
        id="site-menu-panel"
        className={cn(
          'fixed inset-0 z-[60] flex flex-col transition-[visibility,opacity] duration-300',
          isOpen
            ? 'visible opacity-100'
            : 'invisible pointer-events-none opacity-0'
        )}
        style={{ backgroundColor: colors.sectionBackgroundDark }}
        aria-hidden={!isOpen}
      >
        <div className="flex h-16 items-center justify-between px-5 sm:px-8 md:h-20 md:px-10 lg:px-16">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center"
            aria-label={businessName}
          >
            {logoImage ? (
              <Image
                src={logoImage}
                alt={logoAlt}
                width={200}
                height={56}
                className="h-9 w-auto max-w-[180px] object-contain brightness-0 invert sm:h-10 sm:max-w-[220px]"
              />
            ) : (
              <span
                className="text-lg font-semibold uppercase tracking-wide sm:text-xl"
                style={{ ...menuLabelStyle, fontFamily: fonts.heading }}
              >
                {businessName}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="flex items-center gap-3 sm:gap-3.5"
            aria-label="Close menu"
          >
            <span
              className="text-sm font-bold uppercase tracking-[0.2em] sm:text-[0.95rem]"
              style={menuLabelStyle}
            >
              Close
            </span>
            <MenuLines color={accent} className="rotate-90 scale-95" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-8 pb-16 sm:px-12 md:px-16 lg:px-24">
          <ul className="space-y-1 sm:space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="block py-1.5 text-xl font-semibold uppercase tracking-wide transition-opacity hover:opacity-70 sm:text-2xl md:text-3xl"
                  style={{
                    color: navText.primary,
                    fontFamily: fonts.heading,
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t pt-8 sm:mt-12" style={{ borderColor: `color-mix(in srgb, ${navText.primary} 18%, transparent)` }}>
            <Link
              href={headerCta.href}
              onClick={closeMenu}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-80"
              style={{ color: accent, fontFamily: fonts.body }}
            >
              {headerCta.label}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;
