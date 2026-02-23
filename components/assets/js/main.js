// Komponente: učitavanje HTML-a (header/footer)
async function loadComponent(id, file) {
	const el = document.getElementById(id);
	if (!el) return;
	try {
		const res = await fetch(file);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		el.innerHTML = await res.text();
	} catch (err) {
		el.innerHTML =
			location.protocol === "file:"
				? "<p style=\"padding:16px;\">Komponente se učitavaju preko <code>fetch()</code>. Pokreni stranicu preko lokalnog servera (npr. Live Server) umjesto <code>file://</code>.</p>"
				: "<p style=\"padding:16px;\">Ne mogu učitati komponentu.</p>";
	}
}

// Učitaj komponente
loadComponent("header", "components/header.html");
loadComponent("footer", "components/footer.html");

// Hamburger meni (drawer)

document.addEventListener("click", function (e) {
	const nav = document.querySelector(".nav");
	if (!nav) return;

	if (e.target.closest(".hamburger")) {
		nav.classList.toggle("nav--open");
		return;
	}

	if (e.target.closest(".nav__close")) {
		nav.classList.remove("nav--open");
		return;
	}

	if (nav.classList.contains("nav--open") && !e.target.closest(".nav")) {
		nav.classList.remove("nav--open");
	}
});

// Linkovi: active stanje
document.addEventListener("click", function (e) {
	const link = e.target.closest(".footer__list a, .nav__list a, .nav__extras a");
	if (!link) return;

	const href = (link.getAttribute("href") || "").trim();
	if (href === "" || href === "#" || href.startsWith("#")) {
		e.preventDefault();
	}

	const list = link.closest("ul");
	if (!list) return;

	list.querySelectorAll("a.is-active").forEach((a) => a.classList.remove("is-active"));
	link.classList.add("is-active");
});

// Slider: Naši proizvodi (tns)
window.addEventListener("DOMContentLoaded", function () {
	const slider = document.querySelector(".products__slider");
	if (!slider) return;
	if (typeof window.tns !== "function") return;

	// Ako imamo malo proizvoda (npr. 4) i prikazujemo 3 na desktopu,
	// kloniramo ih da loop radi prirodno.
	const slides = Array.from(slider.children).filter((el) => el.nodeType === 1);
	if (slides.length > 0 && slides.length <= 4) {
		slides.forEach((el) => slider.appendChild(el.cloneNode(true)));
	}

	window.tns({
		container: slider,
		items: 1,
		edgePadding: 0,
		gutter: 0,
		slideBy: 1,
		speed: 450,
		mouseDrag: true,
		nav: false,
		controls: true,
		controlsText: ["‹", "›"],
		loop: true,
		responsive: {
			480: {
				items: 1,
				edgePadding: 0,
				gutter: 171,
			},
			768: {
				items: 2,
				edgePadding: 0,
				gutter: 20,
			},
			1024: {
				items: 3,
				edgePadding: 0,
				gutter: 24,
			},
		},
	});
});

// Slider: Vijesti i članci (tns) - samo na mobilnom
window.addEventListener("DOMContentLoaded", function () {
	const inner = document.querySelector(".news-blog__inner");
	const news = document.querySelector(".news-blog__grid");
	if (!inner || !news) return;
	if (typeof window.tns !== "function") return;
	let instance = null;
	let rafId = 0;

	function shouldEnableSlider() {
		const styles = window.getComputedStyle(inner);
		return styles.display === "flex" && styles.flexDirection === "column";
	}

	function sync() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(function () {
			rafId = 0;
			if (shouldEnableSlider()) {
			if (instance) return;
			instance = window.tns({
				container: news,
				items: 1,
				edgePadding: 0,
				gutter: 0,
				slideBy: 1,
				speed: 450,
				mouseDrag: true,
				nav: false,
				controls: true,
				controlsText: ["‹", "›"],
				loop: true,
			});
			return;
		}

			if (!instance) return;
			instance.destroy();
			instance = null;
		});
	}

	sync();
	window.addEventListener("resize", sync);
	window.addEventListener("orientationchange", sync);
});

// Proizvodi: klik na sliku/naziv/cijenu otvara "Dodaj u korpu"
document.addEventListener("click", function (e) {
	const trigger = e.target.closest(
		".product-card__img, .product-card__name, .product-card__price"
	);
	if (!trigger) return;

	const card = trigger.closest(".product-card");
	if (!card) return;
	card.classList.toggle("is-selected");
});
