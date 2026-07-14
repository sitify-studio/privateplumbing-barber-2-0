'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { Page } from '@/app/lib/types';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
}

type FaqItem = { question: string; answer: string };

export function FAQSection({ faqSection, className }: FAQSectionProps) {
  const { colors, fonts, styles } = useSectionTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const title = useMemo(
    () => tiptapToText(faqSection?.title) || 'Frequently asked questions',
    [faqSection?.title]
  );
  const description = useMemo(
    () => tiptapToText(faqSection?.description),
    [faqSection?.description]
  );
  const questions = useMemo<FaqItem[]>(() => {
    return (
      faqSection?.items
        ?.map((item) => {
          const question = tiptapToText(item.question);
          const answer = tiptapToText(item.answer);
          if (!question && !answer) return null;
          return { question: question || 'Question', answer: answer || '' };
        })
        .filter((item): item is FaqItem => Boolean(item)) ?? []
    );
  }, [faqSection?.items]);

  const sectionRef = useRef<HTMLElement>(null);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLHeadingElement>({
    threshold: 0.3,
  });
  const { ref: descriptionRef, isVisible: descriptionVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.3 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!title && !description && questions.length === 0) return null;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItemBorder = {
    borderColor: 'color-mix(in srgb, var(--wb-text-main) 14%, transparent)',
  } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={cn('py-16 md:py-20', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            ref={titleRef}
            className={cn(
              'mb-6 text-3xl font-semibold wb-text-on-light transition-all md:text-4xl',
              isLoaded && titleVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{ fontFamily: fonts.heading }}
          >
            {title}
          </h2>
          {description && (
            <p
              ref={descriptionRef}
              className={cn(
                'mx-auto mb-8 max-w-2xl wb-text-on-light-secondary transition-all',
                isLoaded && descriptionVisible ? 'opacity-100' : 'opacity-0'
              )}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-3 text-left">
          {questions.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border wb-section-card"
              style={{ ...styles.cardSolid, ...faqItemBorder }}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => toggleQuestion(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="pr-6">
                  <div className="text-[15px] font-medium wb-text-on-light">{faq.question}</div>
                  {openIndex === index && faq.answer && (
                    <p
                      id={`faq-answer-${index}`}
                      className="mt-2 text-sm wb-text-on-light-secondary"
                    >
                      {faq.answer}
                    </p>
                  )}
                </div>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-sm border wb-text-on-light"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--wb-text-main) 22%, transparent)',
                  }}
                >
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${
                      openIndex === index ? 'rotate-45' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
