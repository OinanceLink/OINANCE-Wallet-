"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const sendForm = document.getElementById("sendForm");
  const sendNetwork = document.getElementById("sendNetwork");
  const sendAddress = document.getElementById("sendAddress");
  const sendAmount = document.getElementById("sendAmount");
  const sendMessage = document.getElementById("sendMessage");

  const receiveButton = document.getElementById("receiveButton");
  const receiveMessage = document.getElementById("receiveMessage");

  const swapButton = document.getElementById("swapButton");
  const swapMessage = document.getElementById("swapMessage");

  const directory = document.getElementById("assetDirectory");
  const searchInput = document.getElementById("assetSearch");
  const sortSelect = document.getElementById("assetSort");
  const countLabel = document.getElementById("assetCount");
  const statusLabel = document.getElementById("assetStatus");
  const loadMoreButton = document.getElementById("loadMoreAssets");

  const PAGE_SIZE = 30;

  let allAssets = [];
  let visibleAssets = [];
  let displayedCount = 0;
  let logoChecks = new Map();
  let loadingMore = false;

  function showMessage(element, message) {
    if (element) {
      element.textContent = message;
    }
  }

  // DEMONSTRATION SEND FORM
  if (sendForm) {
    sendForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const address = sendAddress.value.trim();
      const amount = Number(sendAmount.value);

      if (!address) {
        showMessage(sendMessage, "Enter a demo recipient label first.");
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        showMessage(sendMessage, "Enter a sample amount greater than zero.");
        return;
      }

      showMessage(
        sendMessage,
        "DEMO ONLY: No cryptocurrency was sent. " +
          amount +
          " on " +
          sendNetwork.value +
          " is a preview only."
      );
    });
  }

  // DEMONSTRATION RECEIVE FEATURE
  if (receiveButton) {
    receiveButton.addEventListener("click", function () {
      showMessage(
        receiveMessage,
        "This prototype has no real wallet address. Do not send cryptocurrency to it."
      );
    });
  }

  // DEMONSTRATION SWAP FEATURE
  if (swapButton) {
    swapButton.addEventListener("click", function () {
      showMessage(
        swapMessage,
        "Swapping is not connected to a blockchain or exchange yet."
      );
    });
  }

  // NAVIGATION
  document.querySelectorAll(".nav-link[href^='#']").forEach(function (link) {
    link.addEventListener("click", function () {
      const target = link.getAttribute("href");

      if (target === "#") {
        return;
      }

      document.querySelectorAll(".nav-link").forEach(function (item) {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  // SAFE PRICE FORMATTING
  function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "Unavailable";
    }

    if (number >= 1) {
      return number.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
      });
    }

    if (number > 0) {
      return "$" + number.toLocaleString("en-US", {
        maximumFractionDigits: 8
      });
    }

    return "$0.00";
  }

  // LOGO URL FOR COINGECKO
  function logoUrl(asset) {
    return asset.image || "";
  }

  // VERIFY THAT A LOGO IMAGE ACTUALLY LOADS.
  // Assets without a loadable logo are not displayed.
  function verifyLogo(asset) {
    if (logoChecks.has(asset.id)) {
      return logoChecks.get(asset.id);
    }

    const promise = new Promise(function (resolve) {
      const image = new Image();
      let finished = false;

      const timer = setTimeout(function () {
        if (!finished) {
          finished = true;
          resolve(false);
        }
      }, 12000);

      image.onload = function () {
        if (finished) return;

        finished = true;
        clearTimeout(timer);
        resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
      };

      image.onerror = function () {
        if (finished) return;

        finished = true;
        clearTimeout(timer);
        resolve(false);
      };

      image.src = logoUrl(asset);
    });

    logoChecks.set(asset.id, promise);
    return promise;
  }

  // BUILD ONE DIRECTORY ROW
  function createAssetRow(asset) {
    const row = document.createElement("article");
    row.className = "directory-coin";
    row.hidden = false;

    const image = document.createElement("img");
    image.className = "directory-logo";
    image.alt = asset.name + " logo";
    image.loading = "lazy";
    image.decoding = "async";

    const details = document.createElement("div");
    details.className = "directory-details";

    const name = document.createElement("strong");
    name.textContent = asset.name;

    const symbol = document.createElement("small");
    symbol.textContent = String(asset.symbol || "").toUpperCase();

    details.append(name, symbol);

    const priceArea = document.createElement("div");
    priceArea.className = "directory-price";

    const price = document.createElement("strong");
    price.textContent = formatPrice(asset.quotes?.USD?.price);

    const change = document.createElement("small");
    const percentage = Number(
      asset.quotes?.USD?.percent_change_24h
    );

    if (Number.isFinite(percentage)) {
      change.textContent =
        (percentage > 0 ? "+" : "") +
        percentage.toFixed(2) +
        "% (24h)";

      change.className =
        percentage >= 0 ? "positive" : "negative";
    } else {
      change.textContent = "24h change unavailable";
    }

    priceArea.append(price, change);
    row.append(image, details, priceArea);

    image.onload = function () {
      if (image.naturalWidth > 0) {
        row.hidden = false;
      } else {
        row.remove();
      }
    };

    image.onerror = function () {
      row.remove();
      updateCount();
    };

    image.src = logoUrl(asset);

    return row;
  }

  function updateCount() {
    if (!countLabel) return;

    const displayed = directory
      ? directory.querySelectorAll(".directory-coin:not([hidden])").length
      : 0;

    countLabel.textContent =
      displayed + " shown";
  }

  // SORT THE RESULTS
  function sortAssets(assets) {
    const sortMode = sortSelect ? sortSelect.value : "rank";

    return assets.slice().sort(function (a, b) {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortMode === "price") {
        return (
          Number(b.quotes?.USD?.price || 0) -
          Number(a.quotes?.USD?.price || 0)
        );
      }

      return Number(a.rank || 999999) - Number(b.rank || 999999);
    });
  }

  // DISPLAY A PAGE OF MATCHING ASSETS
  function renderAssets(reset) {
    if (!directory) return;

    if (reset) {
      directory.replaceChildren();
      displayedCount = 0;
    }

    const start = displayedCount;
    const end = Math.min(start + PAGE_SIZE, visibleAssets.length);
    const batch = visibleAssets.slice(start, end);

    batch.forEach(function (asset) {
      directory.appendChild(createAssetRow(asset));
    });

    displayedCount = end;

    if (loadMoreButton) {
      loadMoreButton.hidden = displayedCount >= visibleAssets.length;
    }

    if (batch.length === 0 && displayedCount === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No matching assets found.";
      directory.appendChild(empty);
    }

    updateCount();
  }

  // SEARCH BY COIN NAME OR SYMBOL
  function filterAssets() {
    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const filtered = allAssets.filter(function (asset) {
      return (
        asset.name.toLowerCase().includes(query) ||
        String(asset.symbol || "").toLowerCase().includes(query)
      );
    });

    visibleAssets = sortAssets(filtered);

    if (statusLabel) {
      statusLabel.textContent =
        "Searching " + allAssets.length.toLocaleString() +
        " cryptocurrency listings. Only verified, loadable logos are displayed.";
    }

    renderAssets(true);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterAssets);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", filterAssets);
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", function () {
      if (loadingMore) return;

      loadingMore = true;
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = "Loading...";

      renderAssets(false);

      loadingMore = false;
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = "Load more assets";
    });
  }

  // LOAD MARKET DATA
  async function loadDirectory() {
    if (!directory) return;

    try {
      if (statusLabel) {
        statusLabel.textContent = "Loading cryptocurrency listings...";
      }

      const response = await fetch(
        "https://oinance-crypto-api.emmycryptolord.workers.dev/coins?page=1"
      );

      if (!response.ok) {
        throw new Error("API error: " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid API data.");
      }

      allAssets = data.map(function (asset) {
        return {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          image: asset.image || "",
          rank: Number(asset.market_cap_rank || 999999),
          quotes: {
            USD: {
              price: asset.current_price,
              percent_change_24h: asset.price_change_percentage_24h
            }
          }
        };
      });

      if (statusLabel) {
        statusLabel.textContent =
          allAssets.length.toLocaleString() +
          " listings received. Checking logo availability...";
      }

      filterAssets();

    } catch (error) {
      console.error("OINANCE asset directory:", error);

      if (statusLabel) {
        statusLabel.textContent =
          "We could not load live listings. Check your internet connection and try again later.";
      }

      if (directory) {
        directory.replaceChildren();

        const message = document.createElement("p");
        message.className = "muted";
        message.textContent =
          "The cryptocurrency data service is unavailable right now. Your existing wallet demo still works.";

        directory.appendChild(message);
      }

      if (countLabel) {
        countLabel.textContent = "Unavailable";
      }
    }
  }

  loadDirectory();
});
