// CSS imports
import "../styles/styles.css";
import "../styles/responsives.css";
import Camera from "./utils/camera";
import App from "./pages/app";
import { animateStoryItems } from "./utils/animasi.js";
import { setupSkipToContent } from "./utils/index";
import { registerServiceWorker } from "./utils";

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", async () => {
  const content = document.getElementById("main-content");
  const drawerNavigation = document.getElementById("navigation-drawer");
  const drawerButton = document.getElementById("drawer-button");
  const skipLinkButton = document.getElementById("skip-to-content");

  // Ensure essential elements exist before initializing
  if (!content || !drawerNavigation || !drawerButton || !skipLinkButton) {
    console.error("Missing essential DOM elements. Initialization failed.");
    return;
  }

  const app = new App({
    content,
    drawerNavigation,
    drawerButton,
    skipLinkButton,
  });

  // Render initial page
  await app.renderPage();

  await registerServiceWorker();
  console.log("Berhasil mendaftarkan service worker.");

  setupSkipToContent(skipLinkButton, content);

  // Handle hash change for navigation
  window.addEventListener("hashchange", async () => {
    animateStoryItems();
    await app.renderPage();

    // Stop all active media
    Camera.stopAllStreams();
  });
});
