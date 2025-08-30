/**
 * DOM and Scroll Utilities
 * Utilities for DOM manipulation and scroll preservation
 */

export interface ScrollState {
  x: number;
  y: number;
  activeElement?: Element | null;
}

/**
 * Save current scroll position and active element
 */
export const saveScrollState = (): ScrollState => {
  return {
    x: window.scrollX,
    y: window.scrollY,
    activeElement: document.activeElement
  };
};

/**
 * Restore scroll position and optionally focus
 */
export const restoreScrollState = (
  scrollState: ScrollState, 
  options: {
    immediate?: boolean;
    delayed?: boolean;
    delayMs?: number;
    restoreFocus?: boolean;
  } = {}
) => {
  const { 
    immediate = true, 
    delayed = true, 
    delayMs = 100, 
    restoreFocus = true 
  } = options;

  const restore = () => {
    window.scrollTo({ 
      top: scrollState.y, 
      left: scrollState.x, 
      behavior: 'auto' 
    });

    // Restore focus if requested
    if (restoreFocus && scrollState.activeElement) {
      const element = scrollState.activeElement;
      if (element && (element.tagName === 'INPUT' || element.tagName === 'BUTTON' || element.tagName === 'TEXTAREA')) {
        try {
          (element as HTMLElement).focus();
        } catch (e) {
          console.debug('Could not restore focus:', e);
        }
      }
    }
  };

  if (immediate) {
    requestAnimationFrame(restore);
  }

  if (delayed) {
    setTimeout(restore, delayMs);
  }
};

/**
 * Execute async function while preserving scroll position
 */
export const withScrollPreservation = async <T>(
  asyncFunction: () => Promise<T>,
  options?: {
    delayMs?: number;
    restoreFocus?: boolean;
  }
): Promise<T> => {
  const scrollState = saveScrollState();
  
  try {
    const result = await asyncFunction();
    restoreScrollState(scrollState, options);
    return result;
  } catch (error) {
    restoreScrollState(scrollState, options);
    throw error;
  }
};

/**
 * Smooth scroll to element
 */
export const scrollToElement = (
  element: Element | string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
) => {
  const target = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
    
  if (target) {
    target.scrollIntoView(options);
  }
};

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get scroll percentage of page
 */
export const getScrollPercentage = (): number => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
};

/**
 * Throttle scroll events
 */
export const throttleScroll = (callback: () => void, delay = 100) => {
  let throttled = false;
  
  return () => {
    if (!throttled) {
      callback();
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, delay);
    }
  };
};
