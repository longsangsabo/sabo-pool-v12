// Debug script for mobile challenge button issues
// Run this in browser console after loading the page

function debugMobileChallengeButton() {
  console.log('🔍 Debugging Mobile Challenge Button Issues...');
  
  // Check if buttons exist
  const createButtons = document.querySelectorAll('[class*="bg-gradient-to-r"]:not([disabled])');
  console.log('📋 Found create challenge buttons:', createButtons.length);
  
  createButtons.forEach((button, index) => {
    const buttonText = button.textContent || button.innerText;
    if (buttonText.includes('Tạo thách đấu') || buttonText.includes('+')) {
      console.log(`🎯 Button ${index}:`, {
        text: buttonText.trim(),
        zIndex: window.getComputedStyle(button).zIndex,
        position: window.getComputedStyle(button).position,
        pointerEvents: window.getComputedStyle(button).pointerEvents,
        touchAction: window.getComputedStyle(button).touchAction,
        transform: window.getComputedStyle(button).transform,
        opacity: window.getComputedStyle(button).opacity,
        visibility: window.getComputedStyle(button).visibility,
        display: window.getComputedStyle(button).display,
        disabled: button.disabled,
        element: button
      });
      
      // Check for overlapping elements
      const rect = button.getBoundingClientRect();
      const elementsAtPoint = document.elementsFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      
      console.log(`🎯 Elements at button center:`, elementsAtPoint.map(el => ({
        tag: el.tagName,
        class: el.className,
        zIndex: window.getComputedStyle(el).zIndex
      })));
    }
  });
  
  // Check modal state
  const modalElements = document.querySelectorAll('[role="dialog"]');
  console.log('📋 Found modals:', modalElements.length);
  
  modalElements.forEach((modal, index) => {
    console.log(`🎭 Modal ${index}:`, {
      visibility: window.getComputedStyle(modal).visibility,
      display: window.getComputedStyle(modal).display,
      zIndex: window.getComputedStyle(modal).zIndex,
      className: modal.className,
      ariaHidden: modal.getAttribute('aria-hidden'),
      inert: modal.hasAttribute('inert')
    });
  });
  
  // Check for overlay elements
  const overlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
  console.log('📋 Found overlay elements:', overlays.length);
  
  overlays.forEach((overlay, index) => {
    console.log(`🎭 Overlay ${index}:`, {
      visibility: window.getComputedStyle(overlay).visibility,
      display: window.getComputedStyle(overlay).display,
      zIndex: window.getComputedStyle(overlay).zIndex,
      pointerEvents: window.getComputedStyle(overlay).pointerEvents,
      opacity: window.getComputedStyle(overlay).opacity,
      className: overlay.className
    });
  });
  
  // Check React state (if available)
  try {
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log('📋 React state available for inspection');
    }
  } catch (e) {
    console.log('📋 React state not accessible');
  }
  
  return {
    createButtons,
    modalElements,
    overlays
  };
}

// Auto-run after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', debugMobileChallengeButton);
} else {
  setTimeout(debugMobileChallengeButton, 1000);
}

// Make function available globally
window.debugMobileChallengeButton = debugMobileChallengeButton;

console.log('✅ Mobile challenge button debug script loaded');
console.log('📋 Run debugMobileChallengeButton() to check button issues');
