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
// sluzi za prikaz proizvoda, paginaciju i broj prikazanih proizvoda, sve u jednom da ne bude previse funkcija
function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  const pageItems = products.slice(start, end);

  pageItems.forEach(p => {
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

function updateAll() {
  renderProducts();
  renderPagination();
  updateProductCount();
}

updateAll();