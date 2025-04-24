'use client';

/**
 * Utility functions for performance optimization
 * Used to defer non-critical operations
 */

/**
 * Defers execution of a function until browser is idle
 * Falls back to setTimeout if requestIdleCallback not available
 */
export const deferOperation = (callback: () => void, timeout = 1000): void => {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => callback(), { timeout });
  } else {
    setTimeout(callback, 50);
  }
};

/**
 * Defers execution of a function until after first paint
 * Helps improve perceived performance
 */
export const afterFirstPaint = (callback: () => void): void => {
  if (typeof window === 'undefined') return;

  // Use RAF twice to ensure we run after the first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      callback();
    });
  });
};

/**
 * Creates a IntersectionObserver to load content when visible
 * Useful for deferring loading of below-the-fold content
 */
export const lazyLoadWhenVisible = (
  element: HTMLElement | null,
  callback: () => void
): () => void => {
  if (typeof window === 'undefined' || !element) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        callback();
        observer.disconnect();
      }
    },
    { rootMargin: '200px' } // Load when element is within 200px of viewport
  );

  observer.observe(element);
  
  // Return cleanup function
  return () => observer.disconnect();
};
