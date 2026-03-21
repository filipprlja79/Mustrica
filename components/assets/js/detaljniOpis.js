document.addEventListener("DOMContentLoaded", function () {

  const swiperEl = document.querySelector(".products-swiper");
  if (!swiperEl || typeof Swiper !== "function") return;

  new Swiper(swiperEl, {
    speed: 500,
    grabCursor: true,
    loop: true,

    slidesPerView: 1,
    spaceBetween: 16,

    navigation: {
      nextEl: ".products .swiper-button-next",
      prevEl: ".products .swiper-button-prev"
    },

    breakpoints: {
      1024: {
        slidesPerView: 4,
        spaceBetween: 24
      }
    }
  });

});