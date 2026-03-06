document.addEventListener("DOMContentLoaded", function () {

  // Swiper 
  
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

    
    if (containerEl.dataset.swiperWrapped === "1") {
      return containerEl.querySelector(".swiper");
    }

    const items = Array.from(containerEl.querySelectorAll(slideSelector));
    if (!items.length) return null;

   
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

    // strelice
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

  
  // PRODUCTS Swiper — desktop + mobile (same instance)
  (function initProductsSwiper() {
    const swiperEl = document.querySelector(".products-swiper");
    if (!swiperEl || typeof Swiper !== "function") return;

    
    const wrapper = swiperEl.querySelector(".swiper-wrapper");
    if (wrapper && wrapper.dataset.productsLoopCloned !== "1") {
      const originalSlides = Array.from(wrapper.children).filter((el) =>
        el instanceof Element ? el.classList.contains("swiper-slide") : false
      );

      
      const minSlidesForLoop = 8;
      if (originalSlides.length > 0 && originalSlides.length < minSlidesForLoop) {
        while (wrapper.querySelectorAll(":scope > .swiper-slide").length < minSlidesForLoop) {
          originalSlides.forEach((slide) => wrapper.appendChild(slide.cloneNode(true)));
        }
      }

      wrapper.dataset.productsLoopCloned = "1";
    }

    new Swiper(swiperEl, {
      speed: 500,
      grabCursor: true,

      centeredSlides: false,

      loop: true,
      loopAdditionalSlides: 4,

      slidesPerView: 1,
      spaceBetween: 16,

      slidesPerGroup: 1,

      navigation: {
        nextEl: ".products .swiper-button-next",
        prevEl: ".products .swiper-button-prev"
      },

      pagination: {
        el: ".products .swiper-pagination",
        type: "progressbar"
      },

      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16
        },

        1024: {
          slidesPerView: 4,
          spaceBetween: 24
        }
      }
    });
  })();

  // prikaz 'Dodaj u korpu'

  (function initProductAddToCartUI() {
    const slider = document.querySelector(".products .products__slider");
    if (!slider) return;

    slider.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const img = target.closest(".product-card__img");
      if (!img) return;

      const card = img.closest(".product-card");
      if (!card) return;

      slider.querySelectorAll(".product-card.is-selected").forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
    });
  })();

  
  // NEWS Swiper  samo na mobilnom
 
  (function initNewsSwiperMobileOnly() {
    const grid = document.querySelector(".news-blog__grid");
    if (!grid) return;
    if (typeof window.Swiper !== "function") return;

    let instance = null;

    function shouldEnable() {
      return window.matchMedia("(max-width: 768px)").matches;
    }

    function enable() {
      if (instance) return;

      const wrapped = wrapAsSwiper({
        containerEl: grid,
        swiperClass: "news-swiper",
        slideSelector: ".news-card",
        withNav: false,
        withPagination: true,
        paginationType: "progressbar"
      });
      if (!wrapped) return;

      const { swiperEl, pagEl } = wrapped;

      instance = new window.Swiper(swiperEl, {
        loop: false,
        speed: 450,
        grabCursor: true,
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: pagEl,
          type: "progressbar"
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

  // VIDEO popup
  
  (function initVideoPopup() {
    const trigger = document.querySelector(".video-section__button");
    const modal = document.querySelector(".video-section .video-modal");
    if (!trigger || !modal) return;

    const content = modal.querySelector("[data-video-content]");
    const closeEls = Array.from(modal.querySelectorAll("[data-video-close]"));
    const thumb = trigger.querySelector("img");

    function setOpen(isOpen) {
      if (isOpen) {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.style.overflow = "hidden";
      } else {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        if (content) content.innerHTML = "";
      }
    }

    function buildPlayer(src) {
      if (!content) return;
      content.innerHTML = "";

      if (!src) {
        // Fallback: pokaz poster u popup-u 
        if (thumb) {
          const img = document.createElement("img");
          img.src = thumb.currentSrc || thumb.src;
          img.alt = thumb.alt || "Video";
          content.appendChild(img);
        }
        return;
      }

      const lower = String(src).toLowerCase();
      if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg")) {
        const video = document.createElement("video");
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.src = src;
        content.appendChild(video);
      } else {
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.title = "Video";
        iframe.referrerPolicy = "no-referrer";
        content.appendChild(iframe);
      }
    }

    trigger.addEventListener("click", () => {
      const src = trigger.getAttribute("data-video-src") || "";
      buildPlayer(src.trim());
      setOpen(true);
    });

    closeEls.forEach((el) => {
      el.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) setOpen(false);
    });
  })();

  
  // Header (loaded via fetch): scroll compact + hamburger + active link
  
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
});