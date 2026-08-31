import { useEffect, useRef } from 'react';

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Adds `.revealed` class when elements enter the viewport.
 * Supports staggered delays for child elements via `data-reveal-delay`.
 *
 * Usage:
 *   const containerRef = useScrollReveal();
 *   <div ref={containerRef}>
 *     <div className="scroll-reveal" />
 *     <div className="scroll-reveal" data-reveal-delay="1" />
 *   </div>
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null);
  const { threshold = 0.08, rootMargin = '0px 0px -40px 0px' } = options;

  useEffect(() => {
    window.scrollTo(0, 0);

    const container = containerRef.current;
    if (!container) return;

    // Respect reduced-motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      container.querySelectorAll('.scroll-reveal').forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
            if (delay > 0) {
              setTimeout(() => entry.target.classList.add('revealed'), delay * 80);
            } else {
              entry.target.classList.add('revealed');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const elements = container.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return containerRef;
}

/**
 * Hook for parallax background effect on scroll.
 * Moves the element's translateY based on scroll position.
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const scrollY = window.scrollY;
          const offset = (scrollY - el.offsetTop + window.innerHeight) * speed;
          el.style.transform = `translate3d(0, ${offset * 0.15}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}
