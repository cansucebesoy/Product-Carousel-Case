if (window.location.href === "https://www.e-bebek.com/") {
  async function getEbebekProducts() {
    try {
      const products = JSON.parse(localStorage.getItem("products"));
      if (products) {
        return products;
      }
      const response = await fetch(
        "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json"
      );
      const data = await response.json();
      localStorage.setItem("products", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Error Occured:", error);
      return null;
    }
  }

  function generateRandomRating() {
    return {
      stars: Math.floor(Math.random() * 2) + 4,
      count: Math.floor(Math.random() * 100) + 1,
    };
  }

  function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " TL";
  }

  function calculateDiscount(original, current) {
    if (original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  }

  function renderProducts(products) {
    const favoriteProducts = JSON.parse(localStorage.getItem("favorites"));
    const carouselTrack = document.getElementById("carousel-track");
    carouselTrack.innerHTML = "";

    products.forEach((product, index) => {
      const rating = generateRandomRating();
      const discount = calculateDiscount(product.original_price, product.price);
      const isBestseller = index % 3 === 0; // Every 3rd product is a bestseller for demo
      const isProductFavorite = favoriteProducts?.some(
        (favId) => favId == product.id
      );
      const productElement = document.createElement("div");
      productElement.className = "carousel-item";
      productElement.addEventListener("click", () => {
        window.open(product.url, "_blank");
      });

      let starsHTML = "";
      for (let i = 0; i < 5; i++) {
        if (i < rating.stars) {
          starsHTML += '<span class="star">★</span>';
        } else {
          starsHTML += '<span class="star" style="color: #e0e0e0;">★</span>';
        }
      }

      productElement.innerHTML = `
            <div class="product-info">
                <div class="product-image-container">
                    ${
                      isBestseller
                        ? '<img class="bestseller-badge" src="https://www.e-bebek.com/assets/images/cok-satan@2x.png" alt="Çok Satan">'
                        : ""
                    }
                    <div class="heart ${isProductFavorite ? "active" : ""}">
                        <img id="default-favorite-${
                          product.id
                        }" src="https://www.e-bebek.com/assets/svg/default-favorite.svg" alt="heart" class="heart-icon default-favorite">
                        <img id="hover-favorite-${
                          product.id
                        }" src="https://www.e-bebek.com/assets/svg/added-favorite-hover.svg" alt="heart" class="heart-icon hovered">
                        <img id="favorite-product-${
                          product.id
                        }" src="https://www.e-bebek.com/assets/svg/added-favorite.svg" alt="heart" class="favorite-heart-icon">
                    </div>
                    <img src="${product.img}" alt="${
        product.name
      }" class="product-image">
                </div>
                <div class="product-brand"> <b>${product.brand} -</b>${
        product.name
      }</div>
                <div class="product-rating">
                    <div class="stars">${starsHTML}</div>
                    <span class="rating-count">(${rating.count})</span>
                </div>
                <div class="product-price">
                    ${
                      product.original_price > product.price
                        ? `<div class="original-price">
                                    ${formatPrice(product.original_price)} 
                                    <span class="discount-badge">
                                        %${discount}  
                                        <span class="decrease-icon-container">
                                            <img class="decrease-icon" src="https://res.cloudinary.com/dmlubpg4d/image/upload/f_auto,q_auto/fvoxz7mnloel1babp196" alt="discount-icon"></img>
                                        </span>
                                    </span>
                                </div>`
                        : '<div class="original-price"></div>'
                    }
                    <div class="current-price ${
                      product.original_price > product.price && "discounted"
                    }">
                        ${formatPrice(product.price)}
                    </div>
                </div>
            </div>
            <button class="add-to-cart">Sepete Ekle</button>
                `;
      carouselTrack.appendChild(productElement);
    });

    document.querySelectorAll(".heart").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle("active");
        const favorites = JSON.parse(localStorage.getItem("favorites"));
        const temp = e.target.id.split("-");
        const productId = temp[temp.length - 1];
        if (!favorites) {
          localStorage.setItem("favorites", JSON.stringify([productId]));
          return;
        }
        if (favorites.some((id) => id === productId)) {
          localStorage.setItem(
            "favorites",
            JSON.stringify(favorites.filter((favId) => favId !== productId))
          );
          return;
        }
        localStorage.setItem(
          "favorites",
          JSON.stringify([...favorites, productId])
        );
      });
    });
  }

  async function initCarousel() {
    const products = await getEbebekProducts();
    renderProducts(products);
    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    let position = 0;

    function calculateLimits() {
      // Recalculate item width on each call to handle responsive changes
      const itemWidth =
        document.querySelector(".carousel-item").offsetWidth + 20; // width + margin
      const containerWidth = track.parentElement.offsetWidth;
      const visibleItems = Math.floor(containerWidth / itemWidth);
      const maxPosition = Math.max(0, products.length - visibleItems);
      return { itemWidth, visibleItems, maxPosition };
    }
    let { visibleItems, maxPosition } = calculateLimits();

    function updatePosition() {
      const { itemWidth } = calculateLimits();
      track.style.transform = `translateX(${-position * itemWidth}px)`;

      prevDisabled = position <= 0;
      nextDisabled = position >= maxPosition;
      prevBtn.disabled = prevDisabled;
      nextBtn.disabled = nextDisabled;
    }

    prevBtn.addEventListener("click", () => {
      if (position > 0) {
        position--;
        updatePosition();
      }
    });

    nextBtn.addEventListener("click", () => {
      const { maxPosition: currentMaxPosition } = calculateLimits();
      maxPosition = currentMaxPosition;
      if (position < maxPosition) {
        position++;
        updatePosition();
      }
    });

    updatePosition();

    window.addEventListener("resize", () => {
      const { visibleItems: newVisibleItems, maxPosition: newMaxPosition } =
        calculateLimits();
      visibleItems = newVisibleItems;
      maxPosition = newMaxPosition;

      if (position > maxPosition) {
        position = maxPosition;
      }
      updatePosition();
    });
  }

  (() => {
    const init = () => {
      buildHTML();
      buildCSS();
      initCarousel();
    };

    const buildHTML = () => {
      const html = `
            <div class="carousel-container">
                <div class="carousel-title">
                    <h2>Beğenebileceğinizi düşündüklerimiz</h2>
                </div>
                <div class="carousel-wrapper">
                    <div class="carousel-track" id="carousel-track"></div>
                    <div class="carousel-nav prev" id="prev-btn"></div>
                    <div class="carousel-nav next" id="next-btn"></div>
                </div>
            </div>
        `;

      const carousel = document.querySelector("eb-product-carousel");
      carousel.innerHTML = html;
    };

    const buildCSS = () => {
      const css = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Poppins", sans-serif;
                user-select: none;
            }
    
            body {
                padding: 20px;
            }
    
            .carousel-container {
                width: 80vw;
                max-width: 1300px;
                margin: 0 auto;
                position: relative;
            }
    
            .carousel-title {
                background-color: #fff7ec;
                padding: 25px 67px;
                margin-bottom: 20px;
                border-radius: 5px;
                border-top-left-radius: 35px;
                border-top-right-radius: 35px;
            }
    
            .carousel-title h2 {
                color: #f28e00;
                font-size: 28px;
                font-family: "Quicksand-Bold", sans-serif;
                font-weight: 700;
                line-height: 1.11;
                margin: 0;
            }
    
            @media (max-width: 480px) {
                .carousel-title {
                padding: 0 0 0 3rem;
                background-color: inherit;
                }
    
                .carousel-title h2 {
                font-size: 1.7rem;
                }
            }
            .carousel-wrapper {
                overflow: hidden;
            }
    
            .carousel-track {
                display: flex;
                transition: transform 0.5s ease;
            }
    
            .carousel-item {
                flex: 0 0 calc(20% - 20px);
                min-width: calc(20% - 20px);
                margin: 0 10px;
                border: 1px solid #e5e5e5;
                border-radius: 10px;
                padding: 15px;
                position: relative;
                display: flex;
                flex-direction: column;
                height: 500px; /* Adjusted height to accommodate the spacer */
                cursor: pointer;
            }
            .product-info {
                height: 300px;
                flex-direction: column;
            }
            .carousel-item:hover {
                box-shadow: 0 0 0 0 #00000030, inset 0 0 0 3px #f28e00;
                transition: all 0.2s ease;
            }
    
            .product-info {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
    
            .product-image-container {
                position: relative;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
    
            .product-image {
                max-width: 100%;
                max-height: 180px;
                object-fit: contain;
            }
    
            .bestseller-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                width: 56px;
                height: 56.5px;
            }
    
            .heart {
                position: absolute;
                top: 10px;
                right: 6px;
                z-index: 2;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.2);
            }
    
            .heart-icon {
                position: absolute;
                width: 24px;
                height: 24px;
                transition: opacity 0.2s ease;
            }
    
            .default-favorite {
                opacity: 1;
            }
    
            .heart-icon.hovered {
                opacity: 0;
            }
    
            .heart:hover .default-favorite {
                opacity: 0;
            }

            .heart:hover .heart-icon.hovered {
                opacity: 1;
            }
    
            .heart.active .default-favorite {
                opacity: 0;
            }
    
            .heart.active .favorite-heart-icon {
                opacity: 1;
            }
            
            .heart.active:hover .favorite-heart-icon {
                opacity: 0;
            }
    
            .favorite-heart-icon {
                opacity: 0;
            }
    
            .heart,
            .heart img {
                position: absolute;
                width: 42px !important;
                height: 42px !important;
            }
    
            .heart .default-favorite {
                position: absolute;
                top: 11px !important;
                right: 11px !important;
                width: 20px !important;
                height: 20px !important;
            }
    
            @media (max-width: 992px) {
                .heart,
                .heart img {
                width: 42px !important;
                height: 42px !important;
                }
    
                .heart .default-favorite {
                position: absolute;
                top: 11px !important;
                right: 11px !important;
                width: 20px !important;
                height: 20px !important;
                }
            }
    
            .product-brand {
                margin: 16px 0 0 0;
                padding: 8px 0 8px 0;
                font-size: 11.52px;
                color: #7d7d7d;
                font-weight: 500;
                width: 200px;
                line-height: 1.3em;
                max-height: 3.4em;
                max-width: 100%;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }
    
            .product-rating {
                display: flex;
                margin: 30px 0 0 0;
            }
    
            .stars {
                display: flex;
                margin-right: 5px;
            }
    
            .star {
                color: #ffd700;
                font-size: 24px;
            }
    
            .rating-count {
                color: #666;
                font-size: 14px;
                display: flex;
                align-items: center;
                height: 100%;
            }
    
            .original-price {
                color: #7d7d7d;
                text-decoration: line-through;
                font-size: 14px;
                height: 22px;
            }
    
            .discount-badge {
                display: inline-block;
                color: #00a365;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 18px;
                margin-left: 5px;
            }
    
            .decrease-icon-container {
                position: relative;
            }
    
            .decrease-icon {
                position: absolute;
                top: 2px;
                left: 3px;
                width: 20px;
                height: 20px;
            }
    
            .current-price {
                color: #7d7d7d;
                font-size: 20px;
                font-weight: bold;
            }
    
            .discounted {
                color: #00A365;
            }
    
            .add-to-cart {
                background-color: #fff7ec;
                color: #f28e00;
                border: none;
                border-radius: 37.5px;
                padding: 10px;
                margin-top: auto;
                cursor: pointer;
                font-weight: 700;
                font-size: 14px;
                transition: background-color 0.3s;
            }
    
            .add-to-cart:hover {
                background-color: #f28e00;
                color: #fff;
            }
    
            .carousel-nav {
                background-color: #fef6eb;
                color: #f28e00;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                font-size: 24px;
            }
    
            .carousel-nav.next::before {
                content: "";
                background-image: url("https://cdn06.e-bebek.com/assets/svg/next.svg");
                background-repeat: no-repeat;
                background-position: center;
    
                width: 100%;
                height: 100%;
                display: block;
            }
    
            .carousel-nav.prev::before {
                content: "";
                background-image: url("https://cdn06.e-bebek.com/assets/svg/next.svg");
                background-repeat: no-repeat;
                background-position: center;
                width: 100%;
                height: 100%;
                display: block;
                transform: rotate(180deg);
            }
    
            .carousel-nav:hover {
                background-color: white;
                border: 1px solid #f28e00;
            }
    
            .carousel-nav.prev {
                left: -65px;
            }
    
            .carousel-nav.next {
                right: -65px;
            }
    
            .special-tag {
                position: absolute;
                top: 10px;
                left: 10px;
                background-color: #ffd700;
                color: #333;
                padding: 5px 8px;
                border-radius: 5px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1;
            }
    
            @media (max-width: 1200px) {
                .carousel-item {
                    flex: 0 0 calc(25% - 20px);
                    min-width: calc(25% - 20px);
                }
            }
    
            @media (max-width: 992px) {
                .carousel-item {
                    flex: 0 0 calc(33.333% - 20px);
                    min-width: calc(33.333% - 20px);
                }
            }
    
            @media (max-width: 768px) {
                .carousel-item {
                    flex: 0 0 calc(50% - 20px);
                    min-width: calc(50% - 20px);
                }
            }
    
            @media (max-width: 576px) {
                .carousel-item {
                    flex: 0 0 calc(100% - 20px);
                    min-width: calc(100% - 20px);
                }
            }
            `;

      const styles = document.querySelector("style");
      styles.innerHTML += css;
    };

    init();
  })();
} else {
  console.log("--- WRONG PAGE !!!");
}
