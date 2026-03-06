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
  // Header (loaded via fetch): scroll compact + hamburger + active link
  // ----------------------------
  function setSiteHeaderOffset(header) {
    if (!header) return;
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--site-header-offset", `${Math.ceil(height)}px`);
  }

  function initHeaderScroll(header) {
    function updateHeader() {
      if (window.scrollY > 60) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
      setSiteHeaderOffset(header);
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", () => setSiteHeaderOffset(header));
    updateHeader();
  }

  function initHeaderActiveLinks(header) {
    const links = Array.from(header.querySelectorAll(".nav__list a"));
    if (!links.length) return;

    const setActive = (activeEl) => {
      links.forEach((a) => a.classList.toggle("is-active", a === activeEl));
    };

    // Click-based active state (works even when href is "#")
    links.forEach((a) => {
      a.addEventListener("click", () => setActive(a));
    });

    // URL-based active state when real hrefs exist
    const currentUrl = new URL(window.location.href);
    const currentPath = currentUrl.pathname.replace(/\/$/, "");
    const currentHash = currentUrl.hash;

    const match = links.find((a) => {
      const href = a.getAttribute("href") || "";
      if (!href || href === "#") return false;
      try {
        const u = new URL(href, window.location.href);
        const linkPath = u.pathname.replace(/\/$/, "");
        if (u.hash && currentHash) return u.hash === currentHash;
        return linkPath === currentPath;
      } catch {
        return false;
      }
    });

    if (match) setActive(match);
  }

  function initMobileNav() {
    if (window.__mustricaMobileNavBound) return;
    window.__mustricaMobileNavBound = true;

    // Delegate so it works even when header is injected later
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const hamburger = target.closest?.(".hamburger");
      if (hamburger) {
        const header = hamburger.closest(".site-header");
        const nav = header?.querySelector(".nav");
        if (!nav) return;
        nav.classList.add("nav--open");
        hamburger.setAttribute("aria-expanded", "true");
        return;
      }

      const closeBtn = target.closest?.(".nav__close");
      if (closeBtn) {
        const nav = closeBtn.closest(".nav");
        const header = closeBtn.closest(".site-header");
        const hb = header?.querySelector(".hamburger");
        nav?.classList.remove("nav--open");
        hb?.setAttribute("aria-expanded", "false");
        return;
      }

      // Click outside closes any open drawer
      const openNav = document.querySelector(".nav.nav--open");
      if (!openNav) return;
      const header = openNav.closest(".site-header");
      const hb = header?.querySelector(".hamburger");

      if (!openNav.contains(target) && !(hb && hb.contains(target))) {
        openNav.classList.remove("nav--open");
        hb?.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const openNav = document.querySelector(".nav.nav--open");
      if (!openNav) return;
      const header = openNav.closest(".site-header");
      const hb = header?.querySelector(".hamburger");
      openNav.classList.remove("nav--open");
      hb?.setAttribute("aria-expanded", "false");
    });
  }

  function initHeaderOnce() {
    const header = document.querySelector(".site-header");
    if (!header) return false;
    if (header.dataset.enhanced === "1") return true;
    header.dataset.enhanced = "1";

    initHeaderScroll(header);
    initHeaderActiveLinks(header);
    initMobileNav();
    setSiteHeaderOffset(header);
    return true;
  }

  // Try immediately (in case header is inline), else observe (header is injected via fetch)
  if (!initHeaderOnce()) {
    const obs = new MutationObserver(() => {
      if (initHeaderOnce()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Omogući prikaz 'Dodaj u korpu' na klik slike u sekciji Naši proizvodi
  document.querySelectorAll('.products__slider .product-card__img').forEach(function(img) {
    img.addEventListener('click', function(e) {
      // Ukloni selekciju sa svih kartica
      document.querySelectorAll('.products__slider .product-card.is-selected').forEach(function(card) {
        card.classList.remove('is-selected');
      });
      // Dodaj selekciju na kliknutu karticu
      const card = img.closest('.product-card');
      if(card) card.classList.add('is-selected');
      e.stopPropagation();
    });
  });

  // Klik izvan kartice uklanja selekciju
  document.addEventListener('click', function(e) {
    if(!e.target.closest('.product-card')) {
      document.querySelectorAll('.products__slider .product-card.is-selected').forEach(function(card) {
        card.classList.remove('is-selected');
      });
    }
  });
});