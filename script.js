'use strict';

// WhatsApp number retained from the original website ZIP.
// IMPORTANT: Verify this is the active business number before publishing.
const WHATSAPP_PHONE = '94770186741';

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const mobileQuery = window.matchMedia('(max-width: 860px)');
function setMenuState(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  siteNav.classList.toggle('is-open', open);
  if (mobileQuery.matches) siteNav.setAttribute('aria-hidden', String(!open));
  else siteNav.removeAttribute('aria-hidden');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  setMenuState(isOpen);
  if (isOpen) siteNav.querySelector('a')?.focus();
});
siteNav.addEventListener('click', event => {
  if (event.target.closest('a') && mobileQuery.matches) setMenuState(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuState(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (mobileQuery.matches && menuToggle.getAttribute('aria-expanded') === 'true' && !event.target.closest('.header-inner')) setMenuState(false);
});
mobileQuery.addEventListener('change', () => setMenuState(false));
setMenuState(false);

document.querySelector('#year').textContent = String(new Date().getFullYear());

const enquiryForm = document.querySelector('#clientEnquiryForm');
const feedback = document.querySelector('#form-feedback');
const inquiryResult = document.querySelector('#inquiry-result');
const inquiryText = document.querySelector('#inquiry-text');
const openWhatsApp = document.querySelector('#open-whatsapp');
const copyInquiry = document.querySelector('#copy-inquiry');
const packageSelect = document.querySelector('#projectPackage');
const budgetSelect = document.querySelector('#clientBudget');
const selectedPackageNotice = document.querySelector('#selection-notice');

// Clicking a pricing CTA prefills the original website's enquiry options.
document.querySelectorAll('.quote-plan').forEach(link => {
  link.addEventListener('click', () => {
    const packageName = link.dataset.package;
    const budget = link.dataset.budget;
    if (packageName) packageSelect.value = packageName;
    if (budget) budgetSelect.value = budget;
    selectedPackageNotice.textContent = `${packageName} selected. Fill in the remaining details below.`;
    selectedPackageNotice.hidden = false;
  });
});

function buildMessage(data) {
  return [
    'Hello NV SHARP SOLUTIONS!',
    '',
    'I would like to discuss a website project.',
    '',
    `Name: ${String(data.get('name')).trim()}`,
    `Business: ${String(data.get('business')).trim()}`,
    `Website Type: ${String(data.get('type')).trim()}`,
    `Estimated Budget: ${String(data.get('budget')).trim()}`,
    `Preferred Package: ${String(data.get('package')).trim() || 'Not sure yet'}`,
    `Project Details: ${String(data.get('details')).trim() || 'To be discussed'}`
  ].join('\n');
}

enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;
  if (!/^94\d{9}$/.test(WHATSAPP_PHONE)) {
    feedback.textContent = 'Please configure a valid business WhatsApp number before using this form.';
    return;
  }
  const message = buildMessage(new FormData(enquiryForm));
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  inquiryText.value = message;
  openWhatsApp.href = url;
  inquiryResult.hidden = false;
  feedback.textContent = 'Your WhatsApp message is ready. Review it and press Send in WhatsApp. If the chat did not open, use the Open WhatsApp button.';
  // Performed synchronously in a user-initiated submit handler.
  window.open(url, '_blank', 'noopener,noreferrer');
});

copyInquiry.addEventListener('click', async () => {
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(inquiryText.value);
      copied = true;
    } else {
      inquiryText.focus();
      inquiryText.select();
      copied = document.execCommand('copy');
    }
  } catch (_error) { copied = false; }
  feedback.textContent = copied ? 'The prepared message was copied.' : 'Select the message and press Ctrl+C (or Cmd+C) to copy it.';
});


// Lightweight progressive scroll reveals. No animation library required.
// Reduced-motion preferences, keyboard navigation and old browsers are respected.
(function initMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;

  const targets = [...document.querySelectorAll([
    '.section-heading', '.service-card', '.work-card', '.plan-card',
    '.process-item', '.belief', '.faq-items details', '.contact-copy',
    '.contact-panel', '.pricing-footnote'
  ].join(', '))];

  const reveal = (element) => {
    element.classList.add('is-visible');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
  }, { threshold: .08, rootMargin: '0px 0px -18px 0px' });

  targets.forEach((element) => {
    // Stagger adjacent cards gently without delaying headings or full sections.
    const parent = element.parentElement;
    const card = element.matches('.service-card,.work-card,.plan-card,.process-item,.belief');
    if (card && parent) {
      const siblings = [...parent.children].filter(child => child.matches('.service-card,.work-card,.plan-card,.process-item,.belief'));
      element.style.setProperty('--stagger', `${Math.min(siblings.indexOf(element), 3) * 65}ms`);
    }
    element.classList.add('scroll-reveal');
    observer.observe(element);
  });
  document.body.classList.add('has-motion');

  // Keyboard focus must always expose a target immediately.
  document.addEventListener('focusin', event => {
    const hiddenContainer = event.target.closest('.scroll-reveal:not(.is-visible)');
    if (hiddenContainer) reveal(hiddenContainer);
  });

  // If accessibility settings change while the page is open, unhide everything.
  const handleMotionChange = event => {
    if (event.matches) {
      document.body.classList.remove('has-motion');
      targets.forEach(reveal);
    }
  };
  if (preference.addEventListener) preference.addEventListener('change', handleMotionChange);
  else if (preference.addListener) preference.addListener(handleMotionChange);
})();
