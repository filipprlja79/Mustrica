document.addEventListener("DOMContentLoaded", function () {

  // ----------------------------
  // Swiper helpers (wrap/unwrap)
  // ----------------------------
  function createEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function wrapAsSwiper({
    containerEl,
    swiperClass,
    slideSelector,
    withNav = true,
    withPagination = true,
    paginationType = "fraction",
    duplicateIfAtMost = 0
  }) {
    if (!containerEl) return null;

    // Već wrapovano → vrati postojeći swiper
    if (containerEl.dataset.swiperWrapped === "1") {
      return containerEl.querySelector(".swiper");
    }

    const items = Array.from(containerEl.querySelectorAll(slideSelector));
    if (!items.length) return null;

    // Sačuvaj originalni HTML za eventualni restore
    containerEl.dataset.swiperOriginalHtml = containerEl.innerHTML;

    // Dupliraj kartice ako ih ima ≤ duplicateIfAtMost
    // (Swiper loop treba više slajdova nego što se prikazuje)
    if (duplicateIfAtMost > 0 && items.length <= duplicateIfAtMost) {
      items.forEach((node) => {
        const clone = node.cloneNode(true);
        containerEl.appendChild(clone);
      });
    }

    const allSlides = Array.from(containerEl.querySelectorAll(slideSelector));

    // Napravi Swiper strukturu
    const swiperEl = createEl("div", `swiper ${swiperClass}`);
    const wrapperEl = createEl("div", "swiper-wrapper");

    allSlides.forEach((card) => {
      const slideEl = createEl("div", "swiper-slide");
      slideEl.appendChild(card);
      wrapperEl.appendChild(slideEl);
    });

    swiperEl.appendChild(wrapperEl);

    // Navigacijske strelice
    let nextEl = null;
    let prevEl = null;
    let pagEl = null;

    if (withNav) {
      nextEl = createEl("button", "swiper-button-next");
      prevEl = createEl("button", "swiper-button-prev");
      nextEl.type = "button";
      prevEl.type = "button";
      nextEl.setAttribute("aria-label", "Sljedeće");
      prevEl.setAttribute("aria-label", "Prethodno");
      // Dodaj strelice u containerEl, ne u swiperEl
      containerEl.appendChild(nextEl);
      containerEl.appendChild(prevEl);
    }

    if (withPagination) {
      pagEl = createEl("div", "swiper-pagination");
      swiperEl.appendChild(pagEl);
    }

    // Upiši Swiper u container
    containerEl.innerHTML = "";
    containerEl.appendChild(swiperEl);
    // Strelice moraju biti van swiperEl, pa ih ponovo dodaj
    if (withNav) {
      containerEl.appendChild(nextEl);
      containerEl.appendChild(prevEl);
    }
    containerEl.dataset.swiperWrapped = "1";

    return { swiperEl, nextEl, prevEl, pagEl };
  }

  function unwrapSwiper(containerEl) {
    if (!containerEl) return;
    if (containerEl.dataset.swiperWrapped !== "1") return;

    const original = containerEl.dataset.swiperOriginalHtml;
    if (typeof original === "string") {
      containerEl.innerHTML = original;
    }
    delete containerEl.dataset.swiperWrapped;
  }

  // ----------------------------
  // PRODUCTS Swiper — uvijek aktivan
  // ----------------------------
  (function initProductsSwiper() {
    const productsContainer = document.querySelector(".products__slider");
    if (!productsContainer) return;
    if (typeof window.Swiper !== "function") return;

    /*
     * Imamo 4 kartice. Za loop Swiper treba min (slidesPerView + 1) slajdova
     * na svakoj strani. Duplikujemo jednom → 8 ukupno.
     * duplicateIfAtMost: 4  → duplicira ako ima ≤4 originalne kartice
     */
    const wrapped = wrapAsSwiper({
      containerEl: productsContainer,
      swiperClass: "products-swiper",
      slideSelector: ".product-card",
      withNav: true,
      withPagination: false,
      duplicateIfAtMost: 4
    });

    if (!wrapped) return;

    const { swiperEl, nextEl, prevEl } = wrapped;

    new window.Swiper(swiperEl, {
      loop: true,
      speed: 450,
      grabCursor: true,
      slidesPerGroup: 1,    // pomjeri po 1 slajd na klik strelice

      /* Mobile first: 2 kartice */
      slidesPerView: 2,
      spaceBetween: 16,

      navigation: {
        nextEl,
        prevEl
      },

      breakpoints: {
        /* ≥ 480px — 2 kartice, veći gap */
        480: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        /* ≥ 768px — 3 kartice */
        768: {
          slidesPerView: 3,
          spaceBetween: 24
        },
        /* ≥ 1024px — 4 kartice (desktop, kao u Figmi) */
        1024: {
          slidesPerView: 4,
          spaceBetween: 24
        }
      }
    });
  })();

  // ----------------------------
  // NEWS Swiper — samo na mobilnom
  // ----------------------------
  (function initNewsSwiperMobileOnly() {
    const inner = document.querySelector(".news-blog__inner");
    const grid = document.querySelector(".news-blog__grid");
    if (!inner || !grid) return;
    if (typeof window.Swiper !== "function") return;

    let instance = null;

    function shouldEnable() {
      const styles = window.getComputedStyle(inner);
      return styles.display === "flex" && styles.flexDirection === "column";
    }

    function enable() {
      if (instance) return;

      const wrapped = wrapAsSwiper({
        containerEl: grid,
        swiperClass: "news-swiper",
        slideSelector: ".news-card",
        withNav: true,
        withPagination: true,
        paginationType: "fraction"
      });
      if (!wrapped) return;

      const { swiperEl, nextEl, prevEl, pagEl } = wrapped;

      instance = new window.Swiper(swiperEl, {
        loop: true,
        speed: 450,
        grabCursor: true,
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: {
          nextEl,
          prevEl
        },
        pagination: {
          el: pagEl,
          type: "fraction"
        }
      });
    }

    function disable() {
      if (!instance) return;
      instance.destroy(true, true);
      instance = null;
      unwrapSwiper(grid);
    }

    function sync() {
      if (shouldEnable()) enable();
      else disable();
    }

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
  })();

  // ----------------------------
  // Header: scroll compact
  // ----------------------------
  (function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  })();

  // ----------------------------
  // Header: mobile hamburger
  // ----------------------------
  (function initMobileNav() {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav");
    const navClose = document.querySelector(".nav__close");

    if (!hamburger || !nav) return;

    hamburger.addEventListener("click", () => {
      nav.classList.add("nav--open");
    });

    if (navClose) {
      navClose.addEventListener("click", () => {
        nav.classList.remove("nav--open");
      });
    }

    // Klik izvan navа zatvori
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("nav--open") &&
          !nav.contains(e.target) &&
          !hamburger.contains(e.target)) {
        nav.classList.remove("nav--open");
      }
    });
  })();

});