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
		containerEl,          // original container (npr .products__slider)
		swiperClass,          // npr "products-swiper"
		slideSelector,        // npr ".product-card"
		withNav = true,
		withPagination = true,
		paginationType = "fraction", // "fraction" ili "bullets"
		duplicateIfAtMost = 0 // npr 4 (za loop kad ima tačno 4)
	}) {
		if (!containerEl) return null;

		// Ako je već wrapovano
		if (containerEl.dataset.swiperWrapped === "1") {
			return containerEl.querySelector(".swiper");
		}

		const items = Array.from(containerEl.querySelectorAll(slideSelector));
		if (!items.length) return null;

		// Sačuvaj originalni HTML da možemo restore (za mobile-only slučaj)
		containerEl.dataset.swiperOriginalHtml = containerEl.innerHTML;

		// Dupliranje za loop (npr products ima 4 kartice, a na desktop prikazuje 4 -> treba više za loop)
		if (duplicateIfAtMost > 0 && items.length <= duplicateIfAtMost) {
			// dupliraj jednom
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

		// Controls
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
			swiperEl.appendChild(nextEl);
			swiperEl.appendChild(prevEl);
		}

		if (withPagination) {
			pagEl = createEl("div", "swiper-pagination");
			swiperEl.appendChild(pagEl);
		}

		// Očisti container i ubaci swiper
		containerEl.innerHTML = "";
		containerEl.appendChild(swiperEl);

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
	// PRODUCTS Swiper (always)
	// ----------------------------
	(function initProductsSwiper() {
		const productsContainer = document.querySelector(".products__slider");
		if (!productsContainer) return;
		if (typeof window.Swiper !== "function") return;

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

		// Init
		new window.Swiper(swiperEl, {
			loop: true,
			speed: 450,
			grabCursor: true,
			slidesPerView: 2,
			spaceBetween: 16,

			navigation: {
				nextEl,
				prevEl
			},

			breakpoints: {
				768: {
					slidesPerView: 2,
					spaceBetween: 20
				},
				1024: {
					slidesPerView: 4,
					spaceBetween: 24
				}
			}
		});
	})();

	// ----------------------------
	// NEWS Swiper (mobile only)
	// ----------------------------
	(function initNewsSwiperMobileOnly() {
		const inner = document.querySelector(".news-blog__inner");
		const grid = document.querySelector(".news-blog__grid");
		if (!inner || !grid) return;
		if (typeof window.Swiper !== "function") return;

		let instance = null;

		function shouldEnable() {
			// isti princip kao prije: kad inner postane column (mobile layout)
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
});