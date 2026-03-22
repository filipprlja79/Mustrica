const products = [
  { name: "Privezak od dobrotske čipke", price: 25, img: "components/assets/img/nasiProizvodi/nasiProizvodi1.jpg" },
  { name: "Dobrotska čipka u okviru tamnoplava", price: 220, img: "components/assets/img/nasiProizvodi/nasiProizvodi2.jpg" },
  { name: "Dobrotska čipka u okviru bordo", price: 250, img: "components/assets/img/nasiProizvodi/nasiProizvodi3.jpg" },
  { name: "Broš sa dobrotskom čipkom", price: 55, img: "components/assets/img/nasiProizvodi/nasiProizvodi4.jpg" },
  { name: "Dobrotska čipka u okviru bordo", price: 25, img: "components/assets/img/nasiProizvodi/nasiProizvodi3.jpg" },
  { name: "Privezak od dobrotske čipke", price: 220, img: "components/assets/img/nasiProizvodi/nasiProizvodi1.jpg" },
  { name: "Dobrotska čipka u okviru tamnoplava", price: 250, img: "components/assets/img/nasiProizvodi/nasiProizvodi2.jpg" },
  { name: "Broš sa dobrotskom čipkom", price: 55, img: "components/assets/img/nasiProizvodi/nasiProizvodi4.jpg" },
  { name: "Dobrotska čipka u okviru bordo", price: 25, img: "components/assets/img/nasiProizvodi/nasiProizvodi1.jpg" },
  { name: "Broš sa dobrotskom čipkom", price: 55, img: "components/assets/img/nasiProizvodi/nasiProizvodi4.jpg" },
  { name: "Dobrotska čipka u okviru bordo", price: 25, img: "components/assets/img/nasiProizvodi/nasiProizvodi3.jpg" },
  { name: "Broš sa dobrotskom čipkom", price: 55, img: "components/assets/img/nasiProizvodi/nasiProizvodi2.jpg" }
];

const productsPerPage = 12; //moguce 12 po stranici
let currentPage = 1;
let searchQuery = "";

function filterProducts(query) {
  // Normalizuj na lower case i ukloni whitespace
  const q = query.trim().toLowerCase();
  // Podrška za UTF-8/mb4 karaktere
  return products.filter(p =>
    p.name.toLowerCase().normalize("NFKC").includes(q)
  );
}

function renderProducts(filtered = null) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  const items = filtered !== null ? filtered : products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  items.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" class="product-card__img">
        <div class="product-card__name">
          ${p.name}
        </div>
        <div class="product-card__price">
          €${p.price}
        </div>
        <button class="product-card__add">
          <img class="product-card__addIcon" src="components/assets/img/katanac.svg">
          <span>DODAJ U KORPU</span>
        </button>
      </div>
    `;
  });
}

function updateProductCount() {
  const shown = currentPage * productsPerPage > products.length
    ? products.length
    : currentPage * productsPerPage;

  document.getElementById("products-count").innerHTML =
    `Prikazano <strong>${shown}</strong> od <strong>${products.length}</strong> proizvoda`;
}

function renderPagination() {
  const totalPages = Math.ceil(products.length / productsPerPage);
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      updateAll();
      window.scrollTo({ top: 0, behavior: "smooth" }); // 🔥 UX bonus
    };

    pagination.appendChild(btn);
  }
}

function updateAll(filtered = null) {
  renderProducts(filtered);
  renderPagination();
  updateProductCount();
}

updateAll();

function setupSearchEvents() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value;
      const filtered = filterProducts(searchQuery);
      renderProducts(filtered);
    });
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        const filtered = filterProducts(searchInput.value);
        renderProducts(filtered);
      });
    }
  }
}

// Pozovi setupSearchEvents nakon što se header učita
window.addEventListener('DOMContentLoaded', function() {
  // Ovdje NE zovemo setupSearchEvents odmah jer header još nije u DOM-u
  // Umjesto toga, presrećemo includeHTML u proizvodi.html
});