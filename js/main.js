/**
 * MOCAR – Auto Detailing Moers
 * main.js  |  Interactions & Animations
 *
 * Features:
 *  – Sticky header on scroll
 *  – Mobile navigation toggle
 *  – Smooth scroll & nav link closing
 *  – Scroll-reveal animations (Intersection Observer)
 *  – Before/After gallery: hover (desktop) + tap/touch toggle (mobile)
 *  – Contact form basic validation & feedback
 *  – Footer year update
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */

  /**
   * Run callback when DOM is ready.
   * @param {Function} fn
   */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* ----------------------------------------------------------
     Sticky Header
  ---------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const SCROLL_THRESHOLD = 40;

    function onScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run immediately
  }

  /* ----------------------------------------------------------
     Mobile Navigation
  ---------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav    = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    // All mobile nav links (for closing on click)
    const links = nav.querySelectorAll('.mobile-nav-link, .mobile-nav-cta, .mobile-phone');

    function openNav() {
      toggle.classList.add('is-open');
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü schließen');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (toggle.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on any link click
    links.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     Scroll Reveal (Intersection Observer)
  ---------------------------------------------------------- */
  function initReveal() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Just make everything visible without animation
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
        el.style.animationDuration = '0s';
      });
      return;
    }

    // Skip hero elements – they animate via CSS on page load
    const elements = document.querySelectorAll('.reveal:not(.hero .reveal)');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08,
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     Before / After Gallery
  ---------------------------------------------------------- */
  function initGallery() {
    const items = document.querySelectorAll('.gallery-item');
    if (!items.length) return;

    // Detect touch device
    const isTouch = window.matchMedia('(hover: none)').matches;

    items.forEach(function (item) {
      const afterImg = item.querySelector('.gallery-img--after');

      if (isTouch) {
        /* ------- Touch behaviour: toggle on tap ------- */
        item.addEventListener('click', function (e) {
          e.preventDefault();

          const isAfterState = item.classList.contains('is-after');

          if (isAfterState) {
            // Toggle back to "before"
            item.classList.remove('is-after');
            if (afterImg) afterImg.setAttribute('aria-hidden', 'true');
          } else {
            // Show "after"
            item.classList.add('is-after');
            if (afterImg) afterImg.setAttribute('aria-hidden', 'false');
          }
        });

        // Also support keyboard activation
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });

      } else {
        /* ------- Mouse behaviour: show "after" on hover ------- */
        // CSS handles the opacity transition via :hover on .gallery-media,
        // but we also manage .is-after for JS-driven aria attributes.

        const media = item.querySelector('.gallery-media');
        if (!media) return;

        media.addEventListener('mouseenter', function () {
          if (afterImg) afterImg.setAttribute('aria-hidden', 'false');
        });

        media.addEventListener('mouseleave', function () {
          if (afterImg) afterImg.setAttribute('aria-hidden', 'true');
        });
      }
    });
  }

  /* ----------------------------------------------------------
     Contact Form Validation & Submission
  ---------------------------------------------------------- */
  function initContactForm() {
    const form     = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form) return;

    /**
     * Show an inline feedback message.
     * @param {'success'|'error'} type
     * @param {string} message
     */
    function showFeedback(type, message) {
      if (!feedback) return;
      feedback.className = 'form-feedback ' + (type === 'success' ? 'is-success' : 'is-error');
      feedback.textContent = message;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Mark a field as invalid and add a11y attributes.
     * @param {HTMLElement} field
     */
    function markInvalid(field) {
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
    }

    /**
     * Clear invalid state on field.
     * @param {HTMLElement} field
     */
    function clearInvalid(field) {
      field.classList.remove('is-invalid');
      field.setAttribute('aria-invalid', 'false');
    }

    // Live validation – clear error when field is modified
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        clearInvalid(field);
        if (feedback) {
          feedback.className = 'form-feedback';
          feedback.textContent = '';
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameField    = form.querySelector('#form-name');
      const phoneField   = form.querySelector('#form-phone');
      const serviceField = form.querySelector('#form-service');
      const privacyBox   = form.querySelector('[name="privacy"]');

      let valid = true;

      // Validate required fields
      [nameField, phoneField, serviceField].forEach(function (field) {
        if (!field) return;
        if (!field.value.trim()) {
          markInvalid(field);
          valid = false;
        } else {
          clearInvalid(field);
        }
      });

      // Validate privacy checkbox
      if (privacyBox && !privacyBox.checked) {
        const checkboxWrap = privacyBox.closest('.form-group');
        if (checkboxWrap) checkboxWrap.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) {
        showFeedback('error', 'Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie der Datenschutzerklärung zu.');
        // Focus first invalid field
        const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* --- Simulate submission (replace with real backend logic) --- */
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet …';
      }

      setTimeout(function () {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Termin anfragen <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        }
        showFeedback('success', 'Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns schnellstmöglich bei Ihnen.');
      }, 1200);
    });
  }

  /* ----------------------------------------------------------
     Footer Year
  ---------------------------------------------------------- */
  function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* ----------------------------------------------------------
     Smooth Scroll for anchor links (polyfill for older browsers)
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
          10
        ) || 80;

        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Active nav highlighting on scroll
  ---------------------------------------------------------- */
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const headerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      10
    ) || 80;

    function onScroll() {
      let current = '';
      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - headerHeight - 80;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('is-active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------
     Auto Gallery Slider
  ---------------------------------------------------------- */
  function initAutoGallerySlider() {
    const slider = document.querySelector('.auto-gallery-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.auto-gallery-slide');
    if (slides.length <= 1) return;

    const interval = parseInt(slider.getAttribute('data-interval'), 10) || 4500;
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      slides.forEach(function (slide, i) {
        const isActive = i === index;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
      activeIndex = index;
    }

    function nextSlide() {
      const nextIndex = (activeIndex + 1) % slides.length;
      showSlide(nextIndex);
    }

    function start() {
      if (timer) return;
      timer = window.setInterval(nextSlide, interval);
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    showSlide(0);
    start();
  }

  /* ----------------------------------------------------------
     Init
  ---------------------------------------------------------- */
  ready(function () {
    initStickyHeader();
    initMobileNav();
    initReveal();
    initGallery();
    initAutoGallerySlider();
    // Keep native form submit flow enabled for FormSubmit.
    // initContactForm();
    initFooterYear();
    initSmoothScroll();
    initNavHighlight();
  });

})();
