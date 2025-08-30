// =============================================
// SCROLL PRESERVATION UTILITIES
// Reusable functions for maintaining scroll position during updates
// =============================================

export interface ScrollState {
  x: number;
  y: number;
  activeElement?: Element | null;
}

export const saveScrollState = (): ScrollState => {
  return {
    x: window.scrollX,
    y: window.scrollY,
    activeElement: document.activeElement
  };
};

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

export default {
  saveScrollState,
  restoreScrollState,
  withScrollPreservation
};
