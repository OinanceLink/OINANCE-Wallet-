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

  const detailsPanel = document.getElementById("cryptoDetails");
  const explorePanel = document.getElementById("explore-assets");
  const closeDetailsButton = document.getElementById("closeCryptoDetails");

  const API_URL =
    "https://oinance-crypto-api.emmycryptolord.workers.dev/coins?page=1";

  const PAGE_SIZE = 30;

  let allAssets = [];
  let visibleAssets = [];
  let displayedCount = 0;
  let loadingMore = false;

  function showMessage(element, message) {
    if (element) {
      element.textContent = message;
    }
  }

  // FORMAT PRICES
  function formatPrice(value) {
    const number = Number(value);

    if (value === null || value === undefined || value === "") {
      return "Unavailable";
    }

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
      return (
        "$" +
        number.toLocaleString("en-US", {
          maximumFractionDigits: 8
        })
      );
    }

    return "$0.00";
  }

  // FORMAT LARGE MARKET VALUES
  function formatLargeNumber(value) {
    if (value === null || value === undefined || value === "") {
      return "Unavailable";
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      return "Unavailable";
    }

    if (number >= 1e12) {
      return "$" + (number / 1e12).toFixed(2) + "T";
    }

    if (number >= 1e9) {
      return "$" + (number / 1e9).toFixed(2) + "B";
    }

    if (number >= 1e6) {
      return "$" + (number / 1e6).toFixed(2) + "M";
    }

    if (number >= 1e3) {
      return "$" + (number / 1e3).toFixed(2) + "K";
    }

    return "$" + number.toLocaleString("en-US", {
      maximumFractionDigits: 2
    });
  }

  // DEMONSTRATION SEND FORM
  if (sendForm) {
    sendForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const address = sendAddress ? sendAddress.value.trim() : "";
      const amount = sendAmount ? Number(sendAmount.value) : NaN;

      if (!address) {
        showMessage(sendMessage, "Enter a demo recipient label first.");
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        showMessage(
          sendMessage,
          "Enter a sample amount greater than zero."
        );
        return;
      }

      showMessage(
        sendMessage,
        "DEMO ONLY: No cryptocurrency was sent. " +
          amount +
          " on " +
          (sendNetwork ? sendNetwork.value : "the selected network") +
          " is only a preview."
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
      document.querySelectorAll(".nav-link").forEach(function (item) {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  // GET A COIN LOGO
  function logoUrl(asset) {
    return asset.image || "";
  }

  // DISPLAY COIN DETAILS
  function openCryptoDetails(asset) {
    if (!detailsPanel || !explorePanel) {
      showMessage(
        statusLabel,
        "The coin details screen is not available in the current HTML yet."
      );
      return;
    }

    const logo = document.getElementById("detailsCoinLogo");
    const name = document.getElementById("detailsCoinName");
    const symbol = document.getElementById("detailsCoinSymbol");
    const price = document.getElementById("detailsCoinPrice");
    const change = document.getElementById("detailsCoinChange");
    const marketCap = document.getElementById("detailsMarketCap");
    const high = document.getElementById("detailsHigh");
    const low = document.getElementById("detailsLow");
    const volume = document.getElementById("detailsVolume");
    const rank = document.getElementById("detailsRank");
    const status = document.getElementById("detailsStatus");

    if (name) {
      name.textContent = asset.name || "Cryptocurrency";
    }

    if (symbol) {
      symbol.textContent = String(asset.symbol || "").toUpperCase();
    }

    if (price) {
      price.textContent = formatPrice(asset.quotes?.USD?.price);
    }

    if (change) {
      const percentage = Number(
        asset.quotes?.USD?.percent_change_24h
      );

      if (
        asset.quotes?.USD?.percent_change_24h !== null &&
        asset.quotes?.USD?.percent_change_24h !== undefined &&
        Number.isFinite(percentage)
      ) {
        change.textContent =
          (percentage > 0 ? "+" : "") +
          percentage.toFixed(2) +
          "% over 24 hours";

        change.className =
          percentage >= 0 ? "positive" : "negative";
      } else {
        change.textContent = "24-hour price change unavailable";
        change.className = "muted";
      }
    }

    if (logo) {
      logo.onerror = function () {
        logo.style.visibility = "hidden";
      };

      logo.onload = function () {
        logo.style.visibility = "visible";
      };

      logo.style.visibility = "visible";
      logo.alt = (asset.name || "Cryptocurrency") + " logo";
      logo.src = logoUrl(asset);
    }

    if (marketCap) {
      marketCap.textContent = formatLargeNumber(asset.marketCap);
    }

    if (high) {
      high.textContent = formatPrice(asset.high24h);
    }

    if (low) {
      low.textContent = formatPrice(asset.low24h);
    }

    if (volume) {
      volume.textContent = formatLargeNumber(asset.volume24h);
    }

    if (rank) {
      rank.textContent =
        asset.rank && asset.rank < 999999
          ? "#" + asset.rank
          : "Unavailable";
    }

    if (status) {
      status.textContent =
        "Market information only. OINANCE Wallet is currently a prototype.";
    }

    detailsPanel.hidden = false;
    explorePanel.classList.add("details-open");

    detailsPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // RETURN TO THE COIN DIRECTORY
  function closeCryptoDetails() {
    if (!detailsPanel || !explorePanel) return;

    detailsPanel.hidden = true;
    explorePanel.classList.remove("details-open");

    explorePanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (closeDetailsButton) {
    closeDetailsButton.addEventListener(
      "click",
      closeCryptoDetails
    );
  }

  // COIN DETAILS ACTION BUTTONS
  function connectDetailAction(buttonId, targetId, messageId, message) {
    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("click", function () {
      const target = document.getElementById(targetId);
      const output = document.getElementById(messageId);

      if (output) {
        output.textContent = message;
      }

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  connectDetailAction(
    "detailsSendButton",
    "send",
    "sendMessage",
    "DEMO ONLY: This is not a real transaction. Sending is not connected."
  );

  connectDetailAction(
    "detailsReceiveButton",
    "receive",
    "receiveMessage",
    "DEMO ONLY: No real receiving address is available."
  );

  connectDetailAction(
    "detailsSwapButton",
    "swap",
    "swapMessage",
    "DEMO ONLY: Swapping is not connected to a blockchain or exchange."
  );

  // BUILD ONE CRYPTOCURRENCY ROW
  function createAssetRow(asset) {
    const row = document.createElement("article");

    row.className = "directory-coin";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute(
      "aria-label",
      "View details for " + asset.name
    );

    const image = document.createElement("img");

    image.className = "directory-logo";
    image.alt = asset.name + " logo";
    image.loading = "lazy";
    image.decoding = "async";

    image.onerror = function () {
      image.style.display = "none";
    };

    image.onload = function () {
      image.style.display = "block";
    };

    image.src = logoUrl(asset);

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

    const rawPercentage = asset.quotes?.USD?.percent_change_24h;
    const percentage = Number(rawPercentage);

    if (
      rawPercentage !== null &&
      rawPercentage !== undefined &&
      Number.isFinite(percentage)
    ) {
      change.textContent =
        (percentage > 0 ? "+" : "") +
        percentage.toFixed(2) +
        "% (24h)";

      change.className =
        percentage >= 0 ? "positive" : "negative";
    } else {
      change.textContent = "24h change unavailable";
      change.className = "muted";
    }

    priceArea.append(price, change);
    row.append(image, details, priceArea);

    row.addEventListener("click", function () {
      openCryptoDetails(asset);
    });

    row.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCryptoDetails(asset);
      }
    });

    return row;
  }

  // UPDATE THE NUMBER OF VISIBLE COINS
  function updateCount() {
    if (!countLabel || !directory) return;

    const displayed = directory.querySelectorAll(
      ".directory-coin:not([hidden])"
    ).length;

    countLabel.textContent = displayed + " shown";
  }

  // SORT COINS
  function sortAssets(assets) {
    const mode = sortSelect ? sortSelect.value : "rank";

    return assets.slice().sort(function (a, b) {
      if (mode === "name") {
        return a.name.localeCompare(b.name);
      }

      if (mode === "price") {
        return (
          Number(b.quotes?.USD?.price || 0) -
          Number(a.quotes?.USD?.price || 0)
        );
      }

      return Number(a.rank || 999999) - Number(b.rank || 999999);
    });
  }

  // RENDER THE COIN DIRECTORY
  function renderAssets(reset) {
    if (!directory) return;

    if (reset) {
      directory.replaceChildren();
      displayedCount = 0;
    }

    const start = displayedCount;
    const end = Math.min(
      start + PAGE_SIZE,
      visibleAssets.length
    );

    const batch = visibleAssets.slice(start, end);

    batch.forEach(function (asset) {
      directory.appendChild(createAssetRow(asset));
    });

    displayedCount = end;

    if (loadMoreButton) {
      loadMoreButton.hidden =
        displayedCount >= visibleAssets.length;

      loadMoreButton.disabled = false;
      loadMoreButton.textContent = "Load more assets";
    }

    if (batch.length === 0 && displayedCount === 0) {
      const empty = document.createElement("p");

      empty.className = "muted";
      empty.textContent = "No matching assets found.";

      directory.appendChild(empty);
    }

    updateCount();
  }

  // SEARCH COINS BY NAME OR SYMBOL
  function filterAssets() {
    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const filtered = allAssets.filter(function (asset) {
      return (
        String(asset.name || "").toLowerCase().includes(query) ||
        String(asset.symbol || "").toLowerCase().includes(query)
      );
    });

    visibleAssets = sortAssets(filtered);

    if (statusLabel) {
      statusLabel.textContent =
        allAssets.length.toLocaleString() +
        " cryptocurrency listings available. Tap a coin to view details.";
    }

    renderAssets(true);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterAssets);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", filterAssets);
  }

  // LOAD MORE COINS
  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", function () {
      if (loadingMore) return;

      loadingMore = true;
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = "Loading...";

      renderAssets(false);

      loadingMore = false;

      if (loadMoreButton) {
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = "Load more assets";
      }
    });
  }

  // LOAD CRYPTOCURRENCY MARKET DATA
  async function loadDirectory() {
    if (!directory) return;

    try {
      if (statusLabel) {
        statusLabel.textContent =
          "Loading cryptocurrency listings...";
      }

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Market data error: " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The market API did not return a coin list.");
      }

      allAssets = data.map(function (asset) {
        return {
          id: asset.id,
          name: asset.name || "Unknown coin",
          symbol: asset.symbol || "",
          image: asset.image || "",
          rank: Number(asset.market_cap_rank || 999999),

          marketCap: asset.market_cap,
          high24h: asset.high_24h,
          low24h: asset.low_24h,
          volume24h: asset.total_volume,

          quotes: {
            USD: {
              price: asset.current_price,
              percent_change_24h:
                asset.price_change_percentage_24h
            }
          }
        };
      });

      filterAssets();

    } catch (error) {
      console.error("OINANCE market data:", error);

      if (statusLabel) {
        statusLabel.textContent =
          "Live cryptocurrency data is temporarily unavailable.";
      }

      directory.replaceChildren();

      const message = document.createElement("p");
      message.className = "muted";
      message.textContent =
        "We could not load the coin list. Please check your internet connection and try again later.";

      directory.appendChild(message);

      if (countLabel) {
        countLabel.textContent = "Unavailable";
      }

      if (loadMoreButton) {
        loadMoreButton.hidden = true;
      }
    }
  }

  // UPDATE THE FOUR DASHBOARD MARKET CARDS
  async function updateDashboardPrices() {
    const dashboardCoins = [
      { id: "bitcoin", symbol: "btc" },
      { id: "ethereum", symbol: "eth" },
      { id: "binancecoin", symbol: "bnb" },
      { id: "solana", symbol: "sol" }
    ];

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Dashboard market data unavailable.");
      }

      const coins = await response.json();

      if (!Array.isArray(coins)) return;

      dashboardCoins.forEach(function (target) {
        const coin = coins.find(function (item) {
          return item.id === target.id;
        });

        if (!coin) return;

        const icon = document.querySelector(
          '.stat-card .crypto-icon[src*="/' +
            target.symbol +
            '@2x.png"]'
        );

        if (!icon) return;

        const card = icon.closest(".stat-card");

        if (!card) return;

        const priceElement = card.querySelector("div strong");

        if (priceElement) {
          priceElement.textContent = formatPrice(
            coin.current_price
          );
        }

        const changeElement = card.querySelector(
          ".positive, .negative"
        );

        if (changeElement) {
          const rawChange = coin.price_change_percentage_24h;
          const percentage = Number(rawChange);

          if (
            rawChange !== null &&
            rawChange !== undefined &&
            Number.isFinite(percentage)
          ) {
            changeElement.textContent =
              (percentage > 0 ? "+" : "") +
              percentage.toFixed(2) +
              "%";

            changeElement.className =
              percentage >= 0 ? "positive" : "negative";
          }
        }
      });

    } catch (error) {
      console.error("OINANCE dashboard prices:", error);
    }
  }

  // START THE APP
  updateDashboardPrices();
  loadDirectory();
});
