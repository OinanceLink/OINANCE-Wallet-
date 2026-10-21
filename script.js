"use strict";

/*
 * OINANCE Wallet — Front-end prototype
 *
 * IMPORTANT:
 * This is a demonstration interface only.
 * It does not connect to a blockchain.
 * It does not generate wallets or private keys.
 * It cannot send, receive, or swap real cryptocurrency.
 */

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

  /*
   * Demo transfer form.
   * Nothing is broadcast to a blockchain.
   */
  if (sendForm) {
    sendForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const network = sendNetwork.value;
      const address = sendAddress.value.trim();
      const amount = Number(sendAmount.value);

      if (!address) {
        showMessage(
          sendMessage,
          "Enter a demonstration recipient label to preview this form."
        );
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        showMessage(
          sendMessage,
          "Please enter a sample amount greater than zero."
        );
        return;
      }

      showMessage(
        sendMessage,
        "DEMO ONLY: " +
          amount +
          " on " +
          network +
          " would be reviewed here. No transaction was sent."
      );
    });
  }

  /*
   * Demo receive feature.
   * Never display a fake address as a real deposit address.
   */
  if (receiveButton) {
    receiveButton.addEventListener("click", function () {
      showMessage(
        receiveMessage,
        "Demo mode: no wallet address has been generated. Do not send funds to this prototype."
      );
    });
  }

  /*
   * Demo swap feature.
   */
  if (swapButton) {
    swapButton.addEventListener("click", function () {
      showMessage(
        swapMessage,
        "Swap preview: blockchain connectivity and a supported swap provider must be integrated before real swaps can work."
      );
    });
  }

  /*
   * Highlight the selected navigation item.
   */
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      const target = link.getAttribute("href");

      if (!target || target === "#") {
        return;
      }

      navLinks.forEach(function (item) {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  /*
   * Display a clear message without inserting user text as HTML.
   */
  function showMessage(element, message) {
    if (!element) {
      return;
    }

    element.textContent = message;
  }
});
