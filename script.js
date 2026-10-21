"use strict";

/*
  OINANCE WALLET V1
  FRONT-END DEMONSTRATION ONLY.

  No real wallets, private keys, recovery phrases,
  blockchain transactions, or live market feeds are used.
*/

const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    iconClass: "btc",
    network: "Bitcoin",
    price: 67450.25,
    change: 2.84,
    amount: 0.185,
    value: 12478.30
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    iconClass: "eth",
    network: "Ethereum",
    price: 3540.80,
    change: 4.12,
    amount: 2.15,
    value: 7612.72
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "◆",
    iconClass: "bnb",
    network: "BNB Chain",
    price: 598.40,
    change: -0.76,
    amount: 5.2,
    value: 3111.68
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    iconClass: "sol",
    network: "Solana",
    price: 142.75,
    change: 5.63,
    amount: 10.3,
    value: 1470.325
  }
];

const transactions = [
  {
    type: "receive",
    title: "Received Bitcoin",
    symbol: "BTC",
    amount: "+0.025 BTC",
    date: "Example transaction",
    status: "Demo record"
  },
  {
    type: "send",
    title: "Sent Ethereum",
    symbol: "ETH",
    amount: "-0.12 ETH",
    date: "Example transaction",
    status: "Demo record"
  },
  {
    type: "swap",
    title: "Swapped BNB",
    symbol: "BNB",
    amount: "0.50 BNB",
    date: "Example transaction",
    status: "Demo record"
  }
];

const state = {
  currentPage: "home",
  balanceHidden: false
};

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => Array.from(
  document.querySelectorAll(selector)
);

function formatUSD(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function showModal(title, message) {
  $("#modalTitle").textContent = title;
  $("#modalMessage").textContent = message;
  $("#modalOverlay").hidden = false;

  $("#modalOkay").focus();
}

function closeModal() {
  $("#modalOverlay").hidden = true;
}

function navigateTo(page) {
  const validPages = [
    "home",
    "markets",
    "activity",
    "send",
    "receive",
    "swap",
    "settings"
  ];

  if (!validPages.includes(page)) {
    return;
  }

  state.currentPage = page;

  $$(".page").forEach((section) => {
    section.classList.toggle(
      "active",
      section.id === `page-${page}`
    );
  });

  $$("[data-page]").forEach((button) => {
    const isActive = button.dataset.page === page;

    button.classList.toggle("active", isActive);

    if (
      button.classList.contains("nav-item") ||
      button.classList.contains("mobile-nav-item")
    ) {
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    }
  });

  const titles = {
    home: "Overview",
    markets: "Markets",
    activity: "Activity",
    send: "Send crypto",
    receive: "Receive crypto",
    swap: "Swap crypto",
    settings: "Settings"
  };

  $("#page-title").textContent = titles[page];

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* PORTFOLIO */

function getTotalBalance() {
  return assets.reduce((total, asset) => {
    return total + asset.value;
  }, 0);
}

function renderBalance() {
  const balance = $("#totalBalance");

  balance.textContent = state.balanceHidden
    ? "••••••••"
    : formatUSD(getTotalBalance());

  $("#balanceToggle").textContent =
    state.balanceHidden ? "◎" : "◉";
}

function renderAssets() {
  const assetRows = $("#assetRows");
  const marketRows = $("#marketRows");

  assetRows.innerHTML = "";
  marketRows.innerHTML = "";

  assets.forEach((asset) => {
    const changeClass = asset.change >= 0
      ? "positive"
      : "negative";

    const changeSign = asset.change >= 0 ? "+" : "";

    const assetHTML = `
      <div class="asset-row">

        <div class="asset-name">
          <span class="coin-icon ${asset.iconClass}">
            ${asset.icon}
          </span>

          <div>
            <strong>${escapeHTML(asset.name)}</strong>
            <small>${escapeHTML(asset.symbol)}</small>
          </div>
        </div>

        <div class="asset-price">
          ${formatUSD(asset.price)}
        </div>

        <div class="asset-change ${changeClass}">
          ${changeSign}${asset.change.toFixed(2)}%
        </div>

        <div class="asset-value">
          ${formatUSD(asset.value)}
        </div>

      </div>
    `;

    assetRows.insertAdjacentHTML("beforeend", assetHTML);

    const marketHTML = `
      <div class="asset-row market-row"
           data-search="${escapeHTML(
             `${asset.name} ${asset.symbol} ${asset.network}`
               .toLowerCase()
           )}">

        <div class="asset-name">
          <span class="coin-icon ${asset.iconClass}">
            ${asset.icon}
          </span>

          <div>
            <strong>${escapeHTML(asset.name)}</strong>
            <small>${escapeHTML(asset.symbol)}</small>
          </div>
        </div>

        <div class="asset-price">
          ${formatUSD(asset.price)}
        </div>

        <div class="asset-change ${changeClass}">
          ${changeSign}${asset.change.toFixed(2)}%
        </div>

        <div class="network-name">
          ${escapeHTML(asset.network)}
        </div>

      </div>
    `;

    marketRows.insertAdjacentHTML("beforeend", marketHTML);
  });
}

/* TRANSACTION HISTORY */

function transactionIcon(type) {
  if (type === "receive") return "↓";
  if (type === "send") return "↑";

  return "⇄";
}

function renderTransactions() {
  const recent = $("#recentTransactions");
  const all = $("#allTransactions");

  recent.innerHTML = "";
  all.innerHTML = "";

  transactions.forEach((transaction, index) => {
    const row = `
      <div class="transaction-row">

        <div class="transaction-left">
          <span class="transaction-icon">
            ${transactionIcon(transaction.type)}
          </span>

          <div>
            <strong>${escapeHTML(transaction.title)}</strong>
            <small>${escapeHTML(transaction.date)}</small>
          </div>
        </div>

        <div class="transaction-right">
          <strong>${escapeHTML(transaction.amount)}</strong>
          <small>${escapeHTML(transaction.status)}</small>
        </div>

      </div>
    `;

    if (index < 3) {
      recent.insertAdjacentHTML("beforeend", row);
    }

    all.insertAdjacentHTML("beforeend", row);
  });
}

/* BALANCE VISIBILITY */

$("#balanceToggle").addEventListener("click", () => {
  state.balanceHidden = !state.balanceHidden;
  renderBalance();
});

/* NAVIGATION */

$$("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.page);
  });
});

$(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  navigateTo("home");
});

/* MARKETS SEARCH */

$("#assetSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();

  $$(".market-row").forEach((row) => {
    const matches = row.dataset.search.includes(query);

    row.style.display = matches ? "grid" : "none";
  });
});

/* SEND DEMONSTRATION */

$("#sendForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const asset = $("#sendAsset").value;
  const address = $("#sendAddress").value.trim();
  const amount = Number($("#sendAmount").value);

  if (!address || !Number.isFinite(amount) || amount <= 0) {
    showModal(
      "Check your entries",
      "Enter a demonstration recipient and a positive amount."
    );

    return;
  }

  showModal(
    "Demonstration only",
    `You entered ${amount} ${asset}. No transaction was signed or broadcast, and no cryptocurrency was sent.`
  );

  $("#sendForm").reset();
});

/* RECEIVE DEMONSTRATION */

function updateSampleAddress() {
  $("#sampleAddress").textContent =
    "Real wallet address not available";
}

$("#receiveAsset").addEventListener("change", updateSampleAddress);

$("#copyAddressButton").addEventListener("click", async () => {
  const text = $("#sampleAddress").textContent;

  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error("Clipboard unavailable");
    }

    await navigator.clipboard.writeText(text);

    showToast(
      "Demonstration text copied. It is not a deposit address."
    );
  } catch {
    showModal(
      "Not a real address",
      "No wallet address exists in this prototype. Do not use the displayed text to receive cryptocurrency."
    );
  }
});

/* SWAP ESTIMATE */

function calculateSwapEstimate() {
  const amount = Number($("#swapAmount").value);
  const from = $("#swapFrom").value;
  const to = $("#swapTo").value;

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    from === to
  ) {
    $("#swapOutput").value = "";
    return;
  }

  const fromAsset = assets.find((asset) => asset.symbol === from);
  const toAsset = assets.find((asset) => asset.symbol === to);

  if (!fromAsset || !toAsset) {
    $("#swapOutput").value = "";
    return;
  }

  const estimated = amount * fromAsset.price / toAsset.price;

  $("#swapOutput").value = estimated.toFixed(8);
}

$("#swapAmount").addEventListener("input", calculateSwapEstimate);
$("#swapFrom").addEventListener("change", calculateSwapEstimate);
$("#swapTo").addEventListener("change", calculateSwapEstimate);

$("#reverseSwap").addEventListener("click", () => {
  const from = $("#swapFrom");
  const to = $("#swapTo");

  const oldFrom = from.value;

  from.value = to.value;
  to.value = oldFrom;

  calculateSwapEstimate();
});

$("#previewSwap").addEventListener("click", () => {
  const amount = Number($("#swapAmount").value);
  const from = $("#swapFrom").value;
  const to = $("#swapTo").value;
  const output = $("#swapOutput").value;

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    from === to ||
    !output
  ) {
    showModal(
      "Check your swap",
      "Enter a positive amount and choose two different assets."
    );

    return;
  }

  showModal(
    "Demonstration estimate",
    `${amount} ${from} is approximately ${output} ${to} using sample prices. No exchange has taken place.`
  );
});

/* NOTIFICATIONS */

$("#notificationsButton").addEventListener("click", () => {
  showModal(
    "OINANCE Wallet",
    "You're using the demonstration version. No blockchain notifications are connected."
  );
});

/* MODAL */

$("#modalClose").addEventListener("click", closeModal);
$("#modalOkay").addEventListener("click", closeModal);

$("#modalOverlay").addEventListener("click", (event) => {
  if (event.target === $("#modalOverlay")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* INITIALIZE */

function initializeWalletDemo() {
  renderBalance();
  renderAssets();
  renderTransactions();
  updateSampleAddress();

  navigateTo("home");

  console.log(
    "OINANCE Wallet V1 demo loaded. No real wallet functionality is active."
  );
}

initializeWalletDemo();
